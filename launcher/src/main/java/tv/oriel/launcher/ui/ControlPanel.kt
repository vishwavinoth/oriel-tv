package tv.oriel.launcher.ui

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.tv.material3.Icon
import androidx.tv.material3.Text
import tv.oriel.launcher.R
import tv.oriel.launcher.system.AvailableShortcut
import tv.oriel.launcher.system.Connection
import tv.oriel.launcher.system.SystemShortcut
import tv.oriel.launcher.ui.theme.LocalOrielColors
import tv.oriel.launcher.ui.theme.OrielTokens
import tv.oriel.launcher.ui.theme.OrielType

private data class Tile(@param:StringRes val label: Int, val icon: ImageVector, val onClick: () -> Unit)

/**
 * Quick access to the TV's own settings, plus Oriel's. Regular glass, because it carries text (HIG). Only the
 * shortcuts this TV can open are shown, so the panel never offers something that won't work.
 */
@Composable
fun ControlPanel(
    connection: Connection,
    shortcuts: List<AvailableShortcut>,
    onShortcut: (AvailableShortcut) -> Unit,
    onOrielSettings: () -> Unit,
    onClose: () -> Unit,
) {
    val colors = LocalOrielColors.current
    val first = remember { FocusRequester() }
    val tiles = listOf(Tile(R.string.shortcut_oriel, SystemIcons.Sliders, onOrielSettings)) +
        shortcuts.map { available -> Tile(available.shortcut.label(), available.shortcut.icon(), { onShortcut(available) }) }

    OrielDialog(onDismiss = onClose) {
        GlassSurface(
            shape = RoundedCornerShape(OrielTokens.Radius.Xl),
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(24.dp)
                .width(500.dp)
                .fillMaxHeight(),
        ) {
            Column(
                Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(28.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                    Text(stringResource(R.string.control_panel), style = OrielType.Headline, color = colors.textPrimary)
                    Text(stringResource(R.string.settings_close_hint), style = OrielType.Caption, color = colors.textSecondary)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(connection.icon(), contentDescription = null, tint = colors.textPrimary, modifier = Modifier.size(28.dp))
                    Column {
                        Text(stringResource(connection.label()), style = OrielType.Title, color = colors.textPrimary)
                        Text(stringResource(connection.detail()), style = OrielType.Caption, color = colors.textSecondary)
                    }
                }

                SettingLabel(stringResource(R.string.control_panel_hint))
                tiles.chunked(2).forEachIndexed { row, pair ->
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        pair.forEachIndexed { column, tile ->
                            ShortcutTile(
                                tile = tile,
                                modifier = Modifier
                                    .weight(1f)
                                    .then(if (row == 0 && column == 0) Modifier.focusRequester(first) else Modifier),
                            )
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }
        LaunchedEffect(Unit) { runCatching { first.requestFocus() } }
    }
}

@Composable
private fun ShortcutTile(tile: Tile, modifier: Modifier) {
    PanelControl(onClick = tile.onClick, shape = RoundedCornerShape(OrielTokens.Radius.Md), modifier = modifier) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(tile.icon, contentDescription = null, modifier = Modifier.size(22.dp))
            Text(stringResource(tile.label), style = OrielType.Label, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
    }
}

internal fun Connection.icon(): ImageVector = when (this) {
    Connection.Wifi -> SystemIcons.Wifi
    Connection.Ethernet -> SystemIcons.Ethernet
    Connection.Other -> SystemIcons.Globe
    Connection.Offline -> SystemIcons.Offline
}

@StringRes
internal fun Connection.label(): Int = when (this) {
    Connection.Wifi -> R.string.connection_wifi
    Connection.Ethernet -> R.string.connection_ethernet
    Connection.Other -> R.string.connection_other
    Connection.Offline -> R.string.connection_offline
}

@StringRes
private fun Connection.detail(): Int = when (this) {
    Connection.Wifi -> R.string.connection_wifi_detail
    Connection.Ethernet -> R.string.connection_ethernet_detail
    Connection.Other -> R.string.connection_other_detail
    Connection.Offline -> R.string.connection_offline_detail
}

@StringRes
internal fun SystemShortcut.label(): Int = when (this) {
    SystemShortcut.Network -> R.string.shortcut_network
    SystemShortcut.Bluetooth -> R.string.shortcut_bluetooth
    SystemShortcut.Notifications -> R.string.shortcut_notifications
    SystemShortcut.Display -> R.string.shortcut_display
    SystemShortcut.Sound -> R.string.shortcut_sound
    SystemShortcut.ScreenSaver -> R.string.shortcut_screensaver
    SystemShortcut.DateTime -> R.string.shortcut_date
    SystemShortcut.Language -> R.string.shortcut_language
    SystemShortcut.Keyboard -> R.string.shortcut_keyboard
    SystemShortcut.Accessibility -> R.string.shortcut_accessibility
    SystemShortcut.Apps -> R.string.shortcut_apps
    SystemShortcut.Storage -> R.string.shortcut_storage
    SystemShortcut.Privacy -> R.string.shortcut_privacy
    SystemShortcut.About -> R.string.shortcut_about
    SystemShortcut.AllSettings -> R.string.shortcut_all
}

private fun SystemShortcut.icon(): ImageVector = when (this) {
    SystemShortcut.Network -> SystemIcons.Wifi
    SystemShortcut.Bluetooth -> SystemIcons.Bluetooth
    SystemShortcut.Notifications -> SystemIcons.Bell
    SystemShortcut.Display -> SystemIcons.Display
    SystemShortcut.Sound -> SystemIcons.Sound
    SystemShortcut.ScreenSaver -> SystemIcons.Moon
    SystemShortcut.DateTime -> SystemIcons.Clock
    SystemShortcut.Language -> SystemIcons.Globe
    SystemShortcut.Keyboard -> SystemIcons.Keyboard
    SystemShortcut.Accessibility -> SystemIcons.Accessibility
    SystemShortcut.Apps -> SystemIcons.Apps
    SystemShortcut.Storage -> SystemIcons.Storage
    SystemShortcut.Privacy -> SystemIcons.Shield
    SystemShortcut.About -> SystemIcons.Info
    SystemShortcut.AllSettings -> SystemIcons.Gear
}
