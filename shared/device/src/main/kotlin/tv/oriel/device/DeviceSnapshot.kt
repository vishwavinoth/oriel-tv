package tv.oriel.device

/** A device as `adb devices -l` lists it. */
data class ConnectedDevice(val serial: String, val state: String, val model: String?) {
    /** Network connections ("192.168.1.50:5555") aren't encrypted; USB ones are local. */
    val isNetwork: Boolean get() = serial.contains(':')
    val isReady: Boolean get() = state == "device"
}

enum class Platform(val label: String) {
    GoogleTv("Google TV"),
    AndroidTv("Android TV"),
    FireTv("Fire TV"),
    OtherAndroid("Android device"),
}

/** Parsers for adb output. Anything that doesn't match is skipped rather than guessed. */
object Parsers {
    private val propertyLine = Regex("^\\[(.+?)]: \\[(.*)]$")

    fun devices(output: String): List<ConnectedDevice> =
        output.lineSequence()
            .map(String::trim)
            .filter { it.isNotEmpty() && !it.startsWith("List of devices") && !it.startsWith("*") }
            .mapNotNull { line ->
                val words = line.split(Regex("\\s+"))
                if (words.size < 2) return@mapNotNull null
                val serial = runCatching { Validate.serial(words[0]) }.getOrNull() ?: return@mapNotNull null
                val model = words.firstOrNull { it.startsWith("model:") }?.removePrefix("model:")?.replace('_', ' ')
                ConnectedDevice(serial, words[1], model)
            }
            .toList()

    fun properties(output: String): Map<String, String> =
        output.lineSequence().mapNotNull { propertyLine.find(it.trim()) }.associate { it.groupValues[1] to it.groupValues[2] }

    fun packages(output: String): Set<String> =
        output.lineSequence().map(String::trim).filter { it.startsWith("package:") }.map { it.removePrefix("package:") }.filter(Validate::isPackageName).toSet()

    fun features(output: String): Set<String> =
        output.lineSequence().map(String::trim).filter { it.startsWith("feature:") }.map { it.removePrefix("feature:").substringBefore('=') }.toSet()

    /** "Physical size: 1920x1080", preferring an "Override size" when one is set. */
    fun screenSize(output: String): String? {
        val sizes = output.lineSequence().mapNotNull { Regex("(Physical|Override) size: (\\d+x\\d+)").find(it) }.associate { it.groupValues[1] to it.groupValues[2] }
        return sizes["Override"] ?: sizes["Physical"]
    }

    fun memoryTotalMb(output: String): Int? =
        Regex("MemTotal:\\s+(\\d+)\\s+kB").find(output)?.groupValues?.get(1)?.toLongOrNull()?.let { (it / 1024).toInt() }

    /** The last line of `cmd package resolve-activity --brief`, when it's a valid activity name. */
    fun homeActivity(output: String): String? =
        output.lineSequence().map(String::trim).lastOrNull { it.contains('/') }?.takeIf(Validate::isComponent)

    /** The first "versionName=" in `dumpsys package` output. */
    fun versionName(output: String): String? = Regex("versionName=([\\w.+-]+)").find(output)?.groupValues?.get(1)
}

/**
 * What Control Center knows about a device. It deliberately leaves out the serial number property and anything
 * tied to accounts; `serial` is only the connection address adb uses (PRD section 7.2).
 */
data class DeviceSnapshot(
    val serial: String,
    val isNetwork: Boolean,
    val model: String,
    val manufacturer: String,
    val androidVersion: String,
    val sdk: Int,
    val buildId: String,
    val screenSize: String?,
    val memoryMb: Int?,
    val platform: Platform,
    val installedPackages: Set<String>,
    val disabledPackages: Set<String>,
    val homeActivity: String?,
    val orielVersion: String? = null,
) {
    val label: String get() = "$manufacturer $model".trim()
    val orielInstalled: Boolean get() = ORIEL_PACKAGE in installedPackages
    val orielIsHome: Boolean get() = homeActivity?.substringBefore('/') == ORIEL_PACKAGE

    /** Built-in home screens on this device, whether on or off. */
    val builtInHomes: List<String> get() = BUILT_IN_HOMES.filter { it in installedPackages }

    val warnings: List<String>
        get() = buildList {
            if (isNetwork) add("This connection uses network debugging, which isn’t encrypted. Turn it off on the TV when you’re done.")
            if (platform == Platform.FireTv) add("Fire OS always returns to Amazon’s home screen, so Oriel can only be opened as an app here.")
            if (sdk in 1 until MIN_SDK) add("Oriel needs Android 5.0 or newer. This device runs Android $androidVersion.")
            if (homeActivity == null) {
                add(
                    if (sdk in 1 until HOME_COMMANDS_MIN_SDK) {
                        "Android $androidVersion can’t report or change the home app over adb. To use Oriel, press Home on the TV and choose it when Android asks."
                    } else {
                        "Couldn’t read which app is the home screen. Some operations are unavailable."
                    },
                )
            }
            if (platform == Platform.OtherAndroid) add("This doesn’t look like a TV. Oriel is designed for Android TV and Google TV.")
        }

    companion object {
        const val ORIEL_PACKAGE = "tv.oriel.launcher"
        const val ORIEL_HOME = "tv.oriel.launcher/.MainActivity"
        /** Android 5.0, the first Android TV release. Matches the launcher's minSdk. */
        const val MIN_SDK = 21

        /** `cmd package` (resolve-activity, set-home-activity) arrived in Android 7.0. */
        const val HOME_COMMANDS_MIN_SDK = 24
        val BUILT_IN_HOMES = listOf(
            "com.google.android.apps.tv.launcherx",
            "com.google.android.tvlauncher",
            "com.google.android.leanbacklauncher",
        )

        fun detectPlatform(manufacturer: String, features: Set<String>, installed: Set<String>): Platform = when {
            manufacturer.equals("Amazon", ignoreCase = true) -> Platform.FireTv
            "com.google.android.apps.tv.launcherx" in installed -> Platform.GoogleTv
            "android.software.leanback" in features || "android.software.leanback_only" in features -> Platform.AndroidTv
            else -> Platform.OtherAndroid
        }

        fun from(
            device: ConnectedDevice,
            properties: Map<String, String>,
            features: Set<String>,
            installed: Set<String>,
            disabled: Set<String>,
            screenSize: String?,
            memoryMb: Int?,
            homeActivity: String?,
            orielVersion: String? = null,
        ): DeviceSnapshot {
            val manufacturer = properties["ro.product.manufacturer"].orEmpty().ifBlank { "Unknown maker" }
            return DeviceSnapshot(
                serial = device.serial,
                isNetwork = device.isNetwork,
                model = properties["ro.product.model"].orEmpty().ifBlank { device.model ?: "Unknown model" },
                manufacturer = manufacturer,
                androidVersion = properties["ro.build.version.release"].orEmpty().ifBlank { "unknown" },
                sdk = properties["ro.build.version.sdk"]?.toIntOrNull() ?: 0,
                buildId = properties["ro.build.id"].orEmpty().ifBlank { "unknown" },
                screenSize = screenSize,
                memoryMb = memoryMb,
                platform = detectPlatform(manufacturer, features, installed),
                installedPackages = installed,
                disabledPackages = disabled,
                homeActivity = homeActivity,
                orielVersion = orielVersion,
            )
        }
    }
}
