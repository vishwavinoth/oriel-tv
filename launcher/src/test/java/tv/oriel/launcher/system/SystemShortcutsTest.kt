package tv.oriel.launcher.system

import android.provider.Settings
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SystemShortcutsTest {
    @Test
    fun `shortcuts appear only when the TV can open one of their actions, preferring the first`() {
        val handled = setOf(
            Settings.ACTION_WIRELESS_SETTINGS,
            Settings.ACTION_SETTINGS,
            "com.android.tv.action.OPEN_NOTIFICATIONS_PANEL",
            "android.settings.NOTIFICATION_SETTINGS",
        )
        val available = SystemShortcuts.available { it in handled }

        assertEquals(listOf(SystemShortcut.Network, SystemShortcut.Notifications, SystemShortcut.AllSettings), available.map { it.shortcut })
        // No Wi-Fi screen on this TV, so the general network screen stands in.
        assertEquals(Settings.ACTION_WIRELESS_SETTINGS, available[0].action)
        // The TV's own notifications panel wins over the phone-style settings screen.
        assertEquals("com.android.tv.action.OPEN_NOTIFICATIONS_PANEL", available[1].action)
    }

    @Test
    fun `a TV that handles none of them gets no shortcuts`() {
        assertTrue(SystemShortcuts.available { false }.isEmpty())
    }

    @Test
    fun `every action is declared in the manifest, or Android 11 and newer would hide it`() {
        val manifest = File("src/main/AndroidManifest.xml").readText()
        SystemShortcut.entries.flatMap { it.actions }.forEach { action ->
            assertTrue("$action is missing from <queries>", manifest.contains("<action android:name=\"$action\" />"))
        }
    }
}
