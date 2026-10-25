package tv.oriel.controlcenter

import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlinx.coroutines.test.runTest
import tv.oriel.device.HostCommand

class ProcessCommandRunnerTest {
    @Test
    fun `arguments reach the program directly and a failing exit is reported as failed`() = runTest {
        // Stand in for adb with this JVM's own java executable: "java devices -l" exits with an error.
        val java = Path.of(ProcessHandle.current().info().command().orElseThrow())
        val result = ProcessCommandRunner(java).run(HostCommand.ListDevices())
        assertTrue(result.exitCode != 0)
        assertFalse(result.succeeded)
        assertTrue(result.output.contains("devices"))
    }

    @Test
    fun `history keeps entries across loads and ignores damaged lines`() {
        val file = Files.createTempDirectory("oriel-history").resolve("history.jsonl")
        val store = HistoryStore(file)
        store.append(HistoryEntry("2026-10-24T10:00:00Z", "Google Chromecast HD", "Install or update Oriel", "Succeeded"))
        Files.writeString(file, Files.readString(file) + "not json\n")
        assertEquals(listOf("Install or update Oriel"), store.load().map { it.operation })
    }

    @Test
    fun `adb is not invented when none is installed`() {
        val empty = Files.createTempDirectory("no-sdk").toString()
        // With no SDK variables and an empty PATH, only the default SDK folders are checked.
        val found = AdbLocator.find(mapOf("PATH" to empty))
        if (found != null) assertTrue(Files.isRegularFile(found)) else assertNull(found)
    }
}
