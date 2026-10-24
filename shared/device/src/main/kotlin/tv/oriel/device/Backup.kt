package tv.oriel.device

import java.time.Instant
import kotlinx.serialization.SerializationException
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class BackupDevice(val model: String, val manufacturer: String, val sdk: Int)

/**
 * A record of which apps were turned off on a TV, and its home app. It holds no serial number, accounts, or app
 * data, and it can't back up Android itself or other apps' data (PRD section 7.4).
 */
@Serializable
data class DeviceBackup(
    val formatVersion: Int,
    val createdAt: String,
    val device: BackupDevice,
    val disabledPackages: List<String>,
    val homeActivity: String? = null,
)

class InvalidBackupException(message: String) : Exception(message)

/**
 * Reads and writes backups. Files are decoded into fixed data classes only, never into arbitrary types, and
 * every field is validated before a backup can be used (PRD section 11).
 */
object BackupCodec {
    const val FORMAT_VERSION = 1
    const val MAX_BYTES = 1_000_000
    const val MAX_PACKAGES = 5_000

    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = false
    }

    fun create(device: DeviceSnapshot, now: Instant = Instant.now()): DeviceBackup = DeviceBackup(
        formatVersion = FORMAT_VERSION,
        createdAt = now.toString(),
        device = BackupDevice(device.model, device.manufacturer, device.sdk),
        disabledPackages = device.disabledPackages.sorted(),
        homeActivity = device.homeActivity,
    )

    fun encode(backup: DeviceBackup): String = json.encodeToString(DeviceBackup.serializer(), backup)

    fun decode(text: String): DeviceBackup {
        if (text.length > MAX_BYTES) throw InvalidBackupException("This file is too large to be an Oriel backup.")
        val backup = try {
            json.decodeFromString(DeviceBackup.serializer(), text)
        } catch (error: SerializationException) {
            throw InvalidBackupException("This file isn’t an Oriel backup, or it’s damaged.")
        } catch (error: IllegalArgumentException) {
            throw InvalidBackupException("This file isn’t an Oriel backup, or it’s damaged.")
        }
        validate(backup)
        return backup
    }

    private fun validate(backup: DeviceBackup) {
        fun fail(message: String): Nothing = throw InvalidBackupException(message)
        if (backup.formatVersion != FORMAT_VERSION) fail("This backup uses format ${backup.formatVersion}, which this version of Control Center can’t read.")
        if (runCatching { Instant.parse(backup.createdAt) }.isFailure) fail("This backup has an invalid date.")
        if (backup.device.model.length > 200 || backup.device.manufacturer.length > 200 || backup.device.sdk !in 0..1000) fail("This backup has invalid device details.")
        if (backup.disabledPackages.size > MAX_PACKAGES) fail("This backup lists too many apps.")
        backup.disabledPackages.firstOrNull { !Validate.isPackageName(it) }?.let { fail("This backup contains an invalid app name: “${it.take(80)}”.") }
        backup.homeActivity?.let { if (!Validate.isComponent(it)) fail("This backup contains an invalid home app.") }
    }
}
