package tv.oriel.device

import java.nio.file.Files
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ValidationTest {
    @Test
    fun `package names accept real names and reject anything a shell could interpret`() {
        assertEquals("com.google.android.apps.tv.launcherx", Validate.packageName(" com.google.android.apps.tv.launcherx "))
        for (bad in listOf("launcher", "com.example;reboot", "com.example && reboot", "\$(reboot)", "com.example app", "com.'x'", "com..x", "1com.x", "com.x\nreboot")) {
            assertFailsWith<InvalidArgumentException>(bad) { Validate.packageName(bad) }
        }
    }

    @Test
    fun `components need a package and a class, without inner-class dollar signs`() {
        assertTrue(Validate.isComponent("tv.oriel.launcher/.MainActivity"))
        assertTrue(Validate.isComponent("com.example/com.example.Home"))
        assertFalse(Validate.isComponent("tv.oriel.launcher"))
        assertFalse(Validate.isComponent("com.example/.Main\$Inner"))
        assertFalse(Validate.isComponent("com.example/.Main;reboot"))
    }

    @Test
    fun `hosts accept IPv4 addresses and hostnames with valid ports`() {
        assertEquals("192.168.1.50:5555", Validate.host("192.168.1.50:5555"))
        assertEquals("living-room-tv.local", Validate.host("living-room-tv.local"))
        for (bad in listOf("192.168.1.300", "192.168.1.5:0", "192.168.1.5:70000", "tv;reboot", "-tv", "")) {
            assertFailsWith<InvalidArgumentException>(bad) { Validate.host(bad) }
        }
    }

    @Test
    fun `serials match what adb reports`() {
        assertEquals("emulator-5554", Validate.serial("emulator-5554"))
        assertFailsWith<InvalidArgumentException> { Validate.serial("emulator 5554") }
        assertFailsWith<InvalidArgumentException> { Validate.serial("x;rm") }
    }

    @Test
    fun `apk files must exist, be non-empty, and end with apk`() {
        val dir = Files.createTempDirectory("oriel-test")
        val apk = Files.write(dir.resolve("launcher-debug.apk"), byteArrayOf(1, 2, 3))
        val empty = Files.createFile(dir.resolve("empty.apk"))
        val text = Files.write(dir.resolve("notes.txt"), byteArrayOf(1))
        assertEquals(apk.toAbsolutePath().normalize(), Validate.apkFile(apk))
        assertFailsWith<InvalidArgumentException> { Validate.apkFile(empty) }
        assertFailsWith<InvalidArgumentException> { Validate.apkFile(text) }
        assertFailsWith<InvalidArgumentException> { Validate.apkFile(dir.resolve("missing.apk")) }
    }

    @Test
    fun `commands validate their values and changing commands are marked`() {
        assertEquals(
            "adb -s 192.168.1.50:5555 shell pm disable-user --user 0 com.google.android.apps.tv.launcherx",
            HostCommand.DisablePackage("192.168.1.50:5555", "com.google.android.apps.tv.launcherx").display(),
        )
        assertTrue(HostCommand.EnablePackage("emulator-5554", "com.example.app").changesDevice)
        assertFalse(HostCommand.ReadProperties("emulator-5554").changesDevice)
        assertFailsWith<InvalidArgumentException> { HostCommand.DisablePackage("emulator-5554", "com.example;reboot") }
        assertFailsWith<InvalidArgumentException> { HostCommand.SetHomeActivity("emulator-5554", "tv.oriel.launcher/.Main && reboot") }
    }
}
