package tv.oriel.device

import java.nio.file.Path

enum class Reversibility(val label: String) {
    Reversible("Can be undone"),
    PartlyReversible("Can mostly be undone"),
    NotReversible("Can’t be reliably undone"),
}

/**
 * Everything a person sees before an operation runs (PRD section 7.3): what it does, the device it targets,
 * the risks, whether it can be undone, the exact commands, and how to recover.
 */
data class OperationPlan(
    val title: String,
    val explanation: List<String>,
    val risks: List<String>,
    val reversibility: Reversibility,
    val steps: List<HostCommand>,
    val recovery: List<String>,
) {
    val preview: List<String> get() = steps.map(HostCommand::display)
}

/** An operation offered for a device: either a plan to review, or the reason it isn't available. */
sealed interface OperationOption {
    val title: String

    data class Available(val plan: OperationPlan) : OperationOption {
        override val title: String get() = plan.title
    }

    data class Unavailable(override val title: String, val reason: String) : OperationOption
}

/** Builds plans only from the allowlisted commands in [HostCommand]. */
object OperationPlanner {
    const val INSTALL = "Install or update Oriel"
    const val SET_HOME = "Make Oriel the home app"
    const val TURN_OFF_BUILT_IN = "Turn off the built-in home screen"
    const val TURN_ON_BUILT_IN = "Turn the built-in home screen back on"
    const val RESTORE = "Restore turned-off apps from a backup"

    fun options(device: DeviceSnapshot, apk: Path?): List<OperationOption> = listOf(
        install(device, apk),
        setHome(device),
        turnOffBuiltInHome(device),
        turnOnBuiltInHome(device),
    )

    fun install(device: DeviceSnapshot, apk: Path?): OperationOption {
        if (device.sdk in 1 until DeviceSnapshot.MIN_SDK) {
            return OperationOption.Unavailable(INSTALL, "Oriel needs Android 5.0 or newer.")
        }
        val file = apk?.let { runCatching { Validate.apkFile(it) }.getOrNull() }
            ?: return OperationOption.Unavailable(INSTALL, "Choose the Oriel APK first. Build it with ./gradlew :launcher:assembleDebug.")
        return OperationOption.Available(
            OperationPlan(
                title = INSTALL,
                explanation = listOf(
                    "Installs ${file.fileName} on ${device.label}. If Oriel is already installed, it’s updated and keeps its settings.",
                    "Nothing else on the TV changes. Oriel opens like any other app until you choose to make it the home app.",
                ),
                risks = listOf("If the APK is signed with a different key than the installed copy, the update fails and nothing changes."),
                reversibility = Reversibility.Reversible,
                steps = listOf(HostCommand.Install(device.serial, file)),
                recovery = listOf("To remove Oriel, uninstall it from the TV’s app settings, or run: adb uninstall ${DeviceSnapshot.ORIEL_PACKAGE}"),
            ),
        )
    }

    fun setHome(device: DeviceSnapshot): OperationOption {
        if (!device.orielInstalled) return OperationOption.Unavailable(SET_HOME, "Install Oriel first.")
        if (device.platform == Platform.FireTv) return OperationOption.Unavailable(SET_HOME, "Fire OS doesn’t allow another home app.")
        if (device.sdk in 1 until DeviceSnapshot.HOME_COMMANDS_MIN_SDK) {
            return OperationOption.Unavailable(SET_HOME, "Android ${device.androidVersion} can’t change the home app over adb. Press Home on the TV and choose Oriel when Android asks.")
        }
        if (device.orielIsHome) return OperationOption.Unavailable(SET_HOME, "Oriel is already the home app.")
        return OperationOption.Available(
            OperationPlan(
                title = SET_HOME,
                explanation = listOf(
                    "Asks Android to use Oriel when you press Home on ${device.label}. This is the gentlest option: nothing is turned off.",
                    "Many Google TV devices ignore this preference. If Home still opens the built-in screen afterwards, review “$TURN_OFF_BUILT_IN”.",
                ),
                risks = listOf("Some devices reset this preference after an update or a restart."),
                reversibility = Reversibility.Reversible,
                steps = listOf(HostCommand.SetHomeActivity(device.serial, DeviceSnapshot.ORIEL_HOME)),
                recovery = listOf("To go back, choose the built-in home app when the TV asks, or uninstall Oriel."),
            ),
        )
    }

    fun turnOffBuiltInHome(device: DeviceSnapshot): OperationOption {
        // Never leave a TV without a home screen: Oriel has to be installed first.
        if (!device.orielInstalled) return OperationOption.Unavailable(TURN_OFF_BUILT_IN, "Install Oriel first, so the TV always has a home screen.")
        if (device.platform == Platform.FireTv) return OperationOption.Unavailable(TURN_OFF_BUILT_IN, "Not supported on Fire OS.")
        val active = device.builtInHomes.filterNot { it in device.disabledPackages }
        if (active.isEmpty()) return OperationOption.Unavailable(TURN_OFF_BUILT_IN, "No built-in home screen Oriel knows about is turned on.")
        return OperationOption.Available(
            OperationPlan(
                title = TURN_OFF_BUILT_IN,
                explanation = listOf(
                    "Turns off ${active.joinToString()} for the main user on ${device.label}, so pressing Home opens Oriel.",
                    "It isn’t uninstalled. It stays on the TV and can be turned back on at any time.",
                ),
                risks = listOf(
                    "On some models this affects setup screens, voice search, or casting from a phone.",
                    "Firmware updates can turn the built-in home screen back on.",
                    "Nobody on the Oriel project has verified this on ${device.label} yet.",
                ),
                reversibility = Reversibility.Reversible,
                steps = active.map { HostCommand.DisablePackage(device.serial, it) },
                recovery = listOf(
                    "Use “$TURN_ON_BUILT_IN” in Control Center, or run: " + active.joinToString(" && ") { "adb shell pm enable $it" },
                ),
            ),
        )
    }

    fun turnOnBuiltInHome(device: DeviceSnapshot): OperationOption {
        val disabled = device.builtInHomes.filter { it in device.disabledPackages }
        if (disabled.isEmpty()) return OperationOption.Unavailable(TURN_ON_BUILT_IN, "The built-in home screen is already on.")
        return OperationOption.Available(
            OperationPlan(
                title = TURN_ON_BUILT_IN,
                explanation = listOf("Turns ${disabled.joinToString()} back on, so ${device.label} works the way it did before."),
                risks = listOf("Pressing Home may open the built-in screen again instead of Oriel."),
                reversibility = Reversibility.Reversible,
                steps = disabled.map { HostCommand.EnablePackage(device.serial, it) },
                recovery = listOf("If Home still opens Oriel, uninstall Oriel or choose the built-in home app when the TV asks."),
            ),
        )
    }

    /**
     * Makes the set of turned-off apps match a backup. Apps that aren't installed on this TV are skipped, and a
     * built-in home screen is never turned off unless Oriel is installed.
     */
    fun restore(device: DeviceSnapshot, backup: DeviceBackup): OperationOption {
        val backupDisabled = backup.disabledPackages.toSet()
        val toEnable = (device.disabledPackages - backupDisabled).filter { it in device.installedPackages }.sorted()
        var toDisable = (backupDisabled - device.disabledPackages).filter { it in device.installedPackages }.sorted()
        val skippedHomes = if (!device.orielInstalled) toDisable.filter { it in DeviceSnapshot.BUILT_IN_HOMES } else emptyList()
        toDisable = toDisable - skippedHomes.toSet()
        if (toEnable.isEmpty() && toDisable.isEmpty()) return OperationOption.Unavailable(RESTORE, "This TV already matches the backup.")

        val notInstalled = (backupDisabled - device.installedPackages).size
        return OperationOption.Available(
            OperationPlan(
                title = RESTORE,
                explanation = buildList {
                    add("Makes the turned-off apps on ${device.label} match the backup from ${backup.createdAt}.")
                    if (toEnable.isNotEmpty()) add("Turns back on: ${toEnable.joinToString()}.")
                    if (toDisable.isNotEmpty()) add("Turns off: ${toDisable.joinToString()}.")
                    if (notInstalled > 0) add("$notInstalled app(s) in the backup aren’t installed on this TV and are skipped.")
                    if (skippedHomes.isNotEmpty()) add("Skips turning off ${skippedHomes.joinToString()} because Oriel isn’t installed.")
                },
                risks = buildList {
                    if (backup.device.model != device.model) add("This backup came from a different model (${backup.device.manufacturer} ${backup.device.model}).")
                    if (toDisable.isNotEmpty()) add("Turning off system apps can affect features such as voice search or casting.")
                    add("Export a backup of the current state first, so you can return to it.")
                },
                reversibility = Reversibility.Reversible,
                steps = toEnable.map { HostCommand.EnablePackage(device.serial, it) } + toDisable.map { HostCommand.DisablePackage(device.serial, it) },
                recovery = listOf("Restore the backup you exported before this change, or turn apps back on with: adb shell pm enable <package>"),
            ),
        )
    }
}
