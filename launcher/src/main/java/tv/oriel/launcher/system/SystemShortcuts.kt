package tv.oriel.launcher.system

import android.provider.Settings

/** What the TV's own settings use to open the notifications side panel on Android TV 12 and newer. */
private const val TV_NOTIFICATIONS_PANEL = "com.android.tv.action.OPEN_NOTIFICATIONS_PANEL"

/** The phone-style notification settings screen. It isn't a public constant, but most Android builds handle it. */
private const val NOTIFICATION_SETTINGS = "android.settings.NOTIFICATION_SETTINGS"

/**
 * Shortcuts to the TV's own settings. A launcher can't switch Wi-Fi or read notifications itself, so each shortcut
 * opens the system screen that can. Each one lists the actions that different TVs and Android versions use, in order
 * of preference, and appears only when this TV can open one of them.
 */
enum class SystemShortcut(val actions: List<String>) {
    Network(listOf(Settings.ACTION_WIFI_SETTINGS, Settings.ACTION_WIRELESS_SETTINGS)),
    Bluetooth(listOf(Settings.ACTION_BLUETOOTH_SETTINGS)),
    Notifications(listOf(TV_NOTIFICATIONS_PANEL, NOTIFICATION_SETTINGS)),
    Display(listOf(Settings.ACTION_DISPLAY_SETTINGS)),
    Sound(listOf(Settings.ACTION_SOUND_SETTINGS)),
    ScreenSaver(listOf(Settings.ACTION_DREAM_SETTINGS)),
    DateTime(listOf(Settings.ACTION_DATE_SETTINGS)),
    Language(listOf(Settings.ACTION_LOCALE_SETTINGS)),
    Keyboard(listOf(Settings.ACTION_INPUT_METHOD_SETTINGS)),
    Accessibility(listOf(Settings.ACTION_ACCESSIBILITY_SETTINGS)),
    Apps(listOf(Settings.ACTION_APPLICATION_SETTINGS, Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS)),
    Storage(listOf(Settings.ACTION_INTERNAL_STORAGE_SETTINGS)),
    Privacy(listOf(Settings.ACTION_PRIVACY_SETTINGS)),
    About(listOf(Settings.ACTION_DEVICE_INFO_SETTINGS)),
    AllSettings(listOf(Settings.ACTION_SETTINGS)),
}

/** A shortcut this TV can open, with the action that opens it. */
data class AvailableShortcut(val shortcut: SystemShortcut, val action: String)

object SystemShortcuts {
    /** Every shortcut whose actions this TV handles, each with the first action that works. */
    fun available(canOpen: (String) -> Boolean): List<AvailableShortcut> =
        SystemShortcut.entries.mapNotNull { shortcut -> shortcut.actions.firstOrNull(canOpen)?.let { AvailableShortcut(shortcut, it) } }
}
