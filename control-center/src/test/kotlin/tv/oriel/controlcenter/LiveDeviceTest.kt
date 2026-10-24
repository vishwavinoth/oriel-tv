package tv.oriel.controlcenter

import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import kotlinx.coroutines.runBlocking
import org.junit.Assume.assumeTrue
import tv.oriel.device.BackupCodec
import tv.oriel.device.DeviceReader
import tv.oriel.device.DeviceReport
import tv.oriel.device.DeviceSnapshot
import tv.oriel.device.ExecutionResult
import tv.oriel.device.HostCommand
import tv.oriel.device.OperationExecutor
import tv.oriel.device.OperationOption
import tv.oriel.device.OperationPlanner

/**
 * An end-to-end check against a real device or emulator, using the same code paths as the Control Center
 * window. It's skipped unless ORIEL_LIVE_DEVICE names a connected device, so CI and normal runs stay offline.
 *
 *   ORIEL_LIVE_DEVICE=emulator-5554 ./gradlew :control-center:test --tests '*LiveDeviceTest*'
 *
 * It installs Oriel from launcher/build/outputs/apk/debug, sets it as the home app, checks the result, and
 * then restores the original home app. Only use it on a device you don't mind changing.
 */
class LiveDeviceTest {
    @Test
    fun `reads a device, installs Oriel, sets it as home, and restores the original home`() = runBlocking<Unit> {
        val serial = System.getenv("ORIEL_LIVE_DEVICE")
        assumeTrue("Set ORIEL_LIVE_DEVICE to run this test", !serial.isNullOrBlank())
        val apk = Path.of("..", "launcher", "build", "outputs", "apk", "debug", "launcher-debug.apk")
        assumeTrue("Build the launcher first", Files.isRegularFile(apk))
        val runner = ProcessCommandRunner(assertNotNull(AdbLocator.find(), "adb wasn’t found"))

        val device = assertNotNull(DeviceReader.devices(runner).firstOrNull { it.serial == serial && it.isReady }, "$serial isn’t connected")
        val before = DeviceReader.snapshot(device, runner)
        println("Device: ${before.label}, Android ${before.androidVersion} (API ${before.sdk}), ${before.platform.label}, home ${before.homeActivity}")
        assertTrue(before.sdk > 0 && before.installedPackages.isNotEmpty())
        val originalHome = assertNotNull(before.homeActivity, "couldn’t read the home app")

        // Install through the same plan the window shows.
        val install = assertIs<OperationOption.Available>(OperationPlanner.install(before, apk)).plan
        println("Install preview: ${install.preview}")
        assertIs<ExecutionResult.Succeeded>(OperationExecutor.execute(install, runner))
        val installed = DeviceReader.snapshot(device, runner)
        assertTrue(installed.orielInstalled)
        assertNotNull(installed.orielVersion, "couldn’t read Oriel’s version")
        val report = DeviceReport.text(installed)
        println(report)
        assertTrue(serial !in report)

        try {
            if (!installed.orielIsHome) {
                val setHome = assertIs<OperationOption.Available>(OperationPlanner.setHome(installed)).plan
                println("Set-home preview: ${setHome.preview}")
                assertIs<ExecutionResult.Succeeded>(OperationExecutor.execute(setHome, runner))
            }
            val after = DeviceReader.snapshot(device, runner)
            println("Home after: ${after.homeActivity}")
            assertEquals(DeviceSnapshot.ORIEL_PACKAGE, after.homeActivity?.substringBefore('/'))

            val backup = BackupCodec.decode(BackupCodec.encode(BackupCodec.create(after)))
            assertEquals(after.disabledPackages.sorted(), backup.disabledPackages)
        } finally {
            // Put the device back the way it was.
            if (!originalHome.startsWith(DeviceSnapshot.ORIEL_PACKAGE)) {
                val restored = runner.run(HostCommand.SetHomeActivity(serial, originalHome))
                println("Restored home to $originalHome: ${restored.output.trim()}")
            }
        }
    }
}
