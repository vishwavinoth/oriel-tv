package tv.oriel.device

import java.nio.file.Files
import java.nio.file.Path

/** A value from a person, a device, or a file that failed validation. Nothing runs when this is thrown. */
class InvalidArgumentException(message: String) : IllegalArgumentException(message)

/**
 * Validation for every value that can reach adb. `adb shell` passes its arguments through the TV's own shell,
 * so values are limited to plain names made of letters, digits, dots, and underscores: no spaces, quotes,
 * or shell symbols can get through (PRD section 7.5).
 */
object Validate {
    private const val SEGMENT = "[A-Za-z][A-Za-z0-9_]*"
    private val packagePattern = Regex("^$SEGMENT(\\.$SEGMENT)+$")
    private val classPattern = Regex("^\\.?$SEGMENT(\\.$SEGMENT)*$")
    private val serialPattern = Regex("^[A-Za-z0-9._:-]{1,96}$")
    private val ipv4Pattern = Regex("^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$")
    private val hostnamePattern = Regex("^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$")

    private fun check(valid: Boolean, message: () -> String) {
        if (!valid) throw InvalidArgumentException(message())
    }

    fun packageName(value: String): String {
        val name = value.trim()
        check(name.length <= 255 && packagePattern.matches(name)) { "“$value” isn’t a valid Android package name." }
        return name
    }

    fun isPackageName(value: String): Boolean = runCatching { packageName(value) }.isSuccess

    /** An activity as "package/class" or "package/.Class". */
    fun component(value: String): String {
        val component = value.trim()
        val parts = component.split('/')
        check(component.length <= 512 && parts.size == 2 && packagePattern.matches(parts[0]) && classPattern.matches(parts[1])) {
            "“$value” isn’t a valid activity name."
        }
        return component
    }

    fun isComponent(value: String): Boolean = runCatching { component(value) }.isSuccess

    /** A device serial as adb reports it, such as a USB serial or "192.168.1.50:5555". */
    fun serial(value: String): String {
        val serial = value.trim()
        check(serialPattern.matches(serial)) { "“$value” isn’t a device serial adb would report." }
        return serial
    }

    /** A TV's network address for `adb connect`: an IPv4 address or hostname, with an optional port. */
    fun host(value: String): String {
        val host = value.trim()
        val name = host.substringBeforeLast(':', host)
        val port = if (host.contains(':')) host.substringAfterLast(':').toIntOrNull() else 5555
        check(port != null && port in 1..65535) { "“$value” has an invalid port." }
        val looksNumeric = name.isNotEmpty() && name.all { it.isDigit() || it == '.' }
        val valid = if (looksNumeric) ipv4Pattern.matches(name) else name.length <= 253 && hostnamePattern.matches(name)
        check(valid) { "“$value” isn’t an IP address or hostname." }
        return host
    }

    /** An APK file on this computer. It's passed to adb as one argument and never through a shell. */
    fun apkFile(path: Path): Path {
        val file = path.toAbsolutePath().normalize()
        check(file.fileName?.toString()?.lowercase()?.endsWith(".apk") == true) { "“$path” isn’t an .apk file." }
        check(Files.isRegularFile(file) && Files.size(file) > 0) { "“$path” doesn’t exist or is empty." }
        return file
    }
}
