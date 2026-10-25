package tv.oriel.device

/**
 * A plain-text summary for compatibility reports and troubleshooting. It's built only from fields that are safe to
 * share, and leaves out the connection address, any serial number, and the list of installed apps (PRD section 11).
 */
object DeviceReport {
    fun text(device: DeviceSnapshot): String = buildString {
        appendLine("Oriel device report")
        appendLine()
        appendLine("- Device: ${device.label}")
        appendLine("- Platform: ${device.platform.label}")
        appendLine("- Android: ${device.androidVersion} (API ${device.sdk}), build ${device.buildId}")
        appendLine("- Screen: ${device.screenSize ?: "couldn’t read"}")
        appendLine("- Memory: ${device.memoryMb?.let { "$it MB" } ?: "couldn’t read"}")
        appendLine("- Connection: ${if (device.isNetwork) "network debugging" else "USB"}")
        appendLine("- Oriel: ${if (device.orielInstalled) "installed, version ${device.orielVersion ?: "unknown"}" else "not installed"}")
        appendLine("- Home app: ${device.homeActivity?.substringBefore('/') ?: "couldn’t read"}")
        val homes = device.builtInHomes.joinToString { "$it (${if (it in device.disabledPackages) "off" else "on"})" }
        appendLine("- Built-in home screens: ${homes.ifEmpty { "none found" }}")
        appendLine("- Apps turned off: ${device.disabledPackages.size}")
        if (device.warnings.isNotEmpty()) {
            appendLine()
            appendLine("Warnings:")
            device.warnings.forEach { appendLine("- $it") }
        }
        appendLine()
        append("This report leaves out the device’s address, serial number, and list of installed apps.")
    }
}
