package tv.oriel.device

import java.nio.file.Path

private fun shell(serial: String, vararg words: String): List<String> = listOf("-s", Validate.serial(serial), "shell", *words)

/**
 * Every command Control Center can send, as arguments to the adb program. There's no type for an arbitrary
 * command, so the allowlist (PRD section 7.5) holds by construction, and every value is validated when a
 * command is created. Commands run with their arguments passed directly, never through this computer's shell.
 */
sealed class HostCommand(val args: List<String>, val changesDevice: Boolean, val timeoutSeconds: Long = 30) {
    /** The command as it appears in an operation preview. */
    fun display(): String = (listOf("adb") + args).joinToString(" ")

    override fun equals(other: Any?): Boolean = other is HostCommand && other::class == this::class && other.args == args

    override fun hashCode(): Int = args.hashCode()

    override fun toString(): String = display()

    class ListDevices : HostCommand(listOf("devices", "-l"), changesDevice = false)

    class Connect(host: String) : HostCommand(listOf("connect", Validate.host(host)), changesDevice = false)

    class Disconnect(host: String) : HostCommand(listOf("disconnect", Validate.host(host)), changesDevice = false)

    class ReadProperties(serial: String) : HostCommand(shell(serial, "getprop"), changesDevice = false)

    class ListFeatures(serial: String) : HostCommand(shell(serial, "pm", "list", "features"), changesDevice = false)

    class ListPackages(serial: String, disabledOnly: Boolean = false) :
        HostCommand(if (disabledOnly) shell(serial, "pm", "list", "packages", "-d") else shell(serial, "pm", "list", "packages"), changesDevice = false)

    class ReadScreenSize(serial: String) : HostCommand(shell(serial, "wm", "size"), changesDevice = false)

    class ReadMemory(serial: String) : HostCommand(shell(serial, "cat", "/proc/meminfo"), changesDevice = false)

    class ResolveHome(serial: String) : HostCommand(
        shell(serial, "cmd", "package", "resolve-activity", "--brief", "-a", "android.intent.action.MAIN", "-c", "android.intent.category.HOME"),
        changesDevice = false,
    )

    class Install(serial: String, apk: Path) :
        HostCommand(listOf("-s", Validate.serial(serial), "install", "-r", Validate.apkFile(apk).toString()), changesDevice = true, timeoutSeconds = 300)

    class SetHomeActivity(serial: String, component: String) :
        HostCommand(shell(serial, "cmd", "package", "set-home-activity", Validate.component(component)), changesDevice = true)

    /** Turns an app off for the main user. It stays installed, and EnablePackage turns it back on. */
    class DisablePackage(serial: String, packageName: String) :
        HostCommand(shell(serial, "pm", "disable-user", "--user", "0", Validate.packageName(packageName)), changesDevice = true)

    class EnablePackage(serial: String, packageName: String) :
        HostCommand(shell(serial, "pm", "enable", Validate.packageName(packageName)), changesDevice = true)
}
