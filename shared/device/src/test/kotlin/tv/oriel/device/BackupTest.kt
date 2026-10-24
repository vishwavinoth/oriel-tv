package tv.oriel.device

import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import tv.oriel.device.DeviceSnapshotTest.Companion.sampleDevice

class BackupTest {
    private val device = sampleDevice(disabled = setOf("com.example.b", "com.example.a"))

    @Test
    fun `a backup survives a round trip and holds no serial`() {
        val backup = BackupCodec.create(device, Instant.parse("2026-10-24T10:00:00Z"))
        val text = BackupCodec.encode(backup)
        assertEquals(backup, BackupCodec.decode(text))
        assertEquals(listOf("com.example.a", "com.example.b"), backup.disabledPackages)
        assertFalse(text.contains("emulator-5554"))
        assertFalse(text.contains("SHOULD-NOT-BE-KEPT"))
    }

    @Test
    fun `damaged, foreign, and unsafe files are rejected with a clear message`() {
        val valid = BackupCodec.encode(BackupCodec.create(device, Instant.parse("2026-10-24T10:00:00Z")))
        val cases = mapOf(
            "not json" to "hello",
            "wrong version" to valid.replace("\"formatVersion\": 1", "\"formatVersion\": 9"),
            "bad date" to valid.replace("2026-10-24T10:00:00Z", "yesterday"),
            "injected package" to valid.replace("com.example.a", "com.example.a; reboot"),
            "unknown field" to valid.replace("{", "{\"run\": \"reboot\", "),
            "too large" to " ".repeat(BackupCodec.MAX_BYTES + 1),
        )
        for ((name, text) in cases) {
            assertFailsWith<InvalidBackupException>(name) { BackupCodec.decode(text) }
        }
    }
}
