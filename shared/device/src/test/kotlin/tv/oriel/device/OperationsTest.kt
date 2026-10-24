package tv.oriel.device

import java.nio.file.Files
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue
import kotlinx.coroutines.test.runTest
import tv.oriel.device.DeviceSnapshotTest.Companion.sampleDevice

class OperationsTest {
    private val launcherx = "com.google.android.apps.tv.launcherx"
    private val oriel = DeviceSnapshot.ORIEL_PACKAGE

    @Test
    fun `install needs a valid APK and previews the exact command`() {
        assertIs<OperationOption.Unavailable>(OperationPlanner.install(sampleDevice(), null))
        val apk = Files.write(Files.createTempDirectory("oriel").resolve("launcher-debug.apk"), byteArrayOf(1))
        val option = assertIs<OperationOption.Available>(OperationPlanner.install(sampleDevice(), apk))
        assertTrue(option.plan.preview.single().startsWith("adb -s emulator-5554 install -r "))
        assertEquals(Reversibility.Reversible, option.plan.reversibility)
    }

    @Test
    fun `older Android can install Oriel but can't switch the home app over adb`() {
        val apk = Files.write(Files.createTempDirectory("oriel").resolve("launcher-debug.apk"), byteArrayOf(1))
        assertIs<OperationOption.Available>(OperationPlanner.install(sampleDevice(sdk = "22"), apk))
        assertIs<OperationOption.Unavailable>(OperationPlanner.install(sampleDevice(sdk = "19"), apk))

        val old = sampleDevice(installed = setOf(launcherx, oriel), home = null, sdk = "23")
        assertTrue(assertIs<OperationOption.Unavailable>(OperationPlanner.setHome(old)).reason.contains("choose Oriel"))
        assertTrue(old.warnings.any { it.contains("can’t report or change the home app") })
        assertIs<OperationOption.Available>(OperationPlanner.setHome(sampleDevice(installed = setOf(launcherx, oriel), home = null, sdk = "24")))
    }

    @Test
    fun `turning off the built-in home screen requires Oriel to be installed`() {
        val withoutOriel = OperationPlanner.turnOffBuiltInHome(sampleDevice())
        assertIs<OperationOption.Unavailable>(withoutOriel)

        val option = assertIs<OperationOption.Available>(OperationPlanner.turnOffBuiltInHome(sampleDevice(installed = setOf(launcherx, oriel))))
        assertEquals(listOf("adb -s emulator-5554 shell pm disable-user --user 0 $launcherx"), option.plan.preview)
        assertTrue(option.plan.recovery.single().contains("pm enable $launcherx"))
    }

    @Test
    fun `turning the built-in home screen back on only appears when it's off`() {
        assertIs<OperationOption.Unavailable>(OperationPlanner.turnOnBuiltInHome(sampleDevice()))
        val option = assertIs<OperationOption.Available>(OperationPlanner.turnOnBuiltInHome(sampleDevice(disabled = setOf(launcherx))))
        assertEquals(listOf("adb -s emulator-5554 shell pm enable $launcherx"), option.plan.preview)
    }

    @Test
    fun `Fire TV never offers home screen changes`() {
        val fire = sampleDevice(manufacturer = "Amazon", installed = setOf(oriel))
        assertIs<OperationOption.Unavailable>(OperationPlanner.setHome(fire))
        assertIs<OperationOption.Unavailable>(OperationPlanner.turnOffBuiltInHome(fire))
    }

    @Test
    fun `restore turns apps on and off to match a backup and skips what isn't installed`() {
        val device = sampleDevice(installed = setOf(launcherx, oriel, "com.example.a", "com.example.b"), disabled = setOf("com.example.a"))
        val backup = BackupCodec.create(device).copy(disabledPackages = listOf("com.example.b", "com.example.missing"))
        val option = assertIs<OperationOption.Available>(OperationPlanner.restore(device, backup))
        assertEquals(
            listOf("adb -s emulator-5554 shell pm enable com.example.a", "adb -s emulator-5554 shell pm disable-user --user 0 com.example.b"),
            option.plan.preview,
        )
        assertTrue(option.plan.explanation.any { it.contains("1 app(s) in the backup aren’t installed") })
    }

    @Test
    fun `restore never turns off a built-in home screen when Oriel isn't installed`() {
        val device = sampleDevice(installed = setOf(launcherx))
        val backup = BackupCodec.create(device).copy(disabledPackages = listOf(launcherx))
        assertIs<OperationOption.Unavailable>(OperationPlanner.restore(device, backup))
    }

    @Test
    fun `execution stops at the first failure and reports what ran`() = runTest {
        val device = sampleDevice(installed = setOf(launcherx, oriel, "com.example.a", "com.example.b"), disabled = setOf("com.example.a", "com.example.b"))
        val plan = assertIs<OperationOption.Available>(OperationPlanner.restore(device, BackupCodec.create(device).copy(disabledPackages = emptyList()))).plan
        val ran = mutableListOf<HostCommand>()
        val result = OperationExecutor.execute(plan) { command ->
            ran += command
            if (ran.size == 1) CommandResult(0, "Package com.example.a new state: enabled") else CommandResult(0, "Error: java.lang.SecurityException")
        }
        val failed = assertIs<ExecutionResult.Failed>(result)
        assertEquals(1, failed.completed.size)
        assertEquals(plan.steps[1], failed.failed.command)
        assertEquals(2, ran.size)
    }

    @Test
    fun `a zero exit code with a failure message still counts as failed`() {
        assertTrue(CommandResult(0, "Success").succeeded)
        assertEquals(false, CommandResult(0, "Failure [INSTALL_FAILED_UPDATE_INCOMPATIBLE]").succeeded)
        assertEquals(false, CommandResult(1, "").succeeded)
        assertEquals(false, CommandResult(0, "", timedOut = true).succeeded)
    }
}
