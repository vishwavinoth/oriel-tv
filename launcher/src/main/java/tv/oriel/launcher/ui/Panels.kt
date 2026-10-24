package tv.oriel.launcher.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import androidx.tv.material3.Border
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import tv.oriel.launcher.R
import tv.oriel.launcher.data.AppEntry
import tv.oriel.launcher.home.AppOption
import tv.oriel.launcher.prefs.LauncherPreferences
import tv.oriel.launcher.prefs.ThemeMode
import tv.oriel.launcher.prefs.matches
import tv.oriel.launcher.prefs.withPack
import tv.oriel.launcher.ui.theme.LocalOrielColors
import tv.oriel.launcher.ui.theme.LocalOrielEffects
import tv.oriel.launcher.ui.theme.OrielTokens
import tv.oriel.launcher.ui.theme.OrielType

/** A focusable control inside a glass panel. It uses a tinted fill, never glass of its own (ADR 0004, rule 3). */
@Composable
internal fun PanelControl(
    onClick: () -> Unit,
    shape: Shape,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    container: Color? = null,
    content: @Composable () -> Unit,
) {
    val colors = LocalOrielColors.current
    val reduceMotion = LocalOrielEffects.current.reduceMotion
    val base = container ?: if (selected) colors.accent else colors.textPrimary.copy(alpha = 0.1f)
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = ClickableSurfaceDefaults.shape(shape),
        colors = ClickableSurfaceDefaults.colors(
            containerColor = base,
            contentColor = if (selected && container == null) colors.onAccent else colors.textPrimary,
            focusedContainerColor = container ?: if (selected) colors.accent else colors.textPrimary.copy(alpha = 0.18f),
            focusedContentColor = if (selected && container == null) colors.onAccent else colors.textPrimary,
        ),
        scale = ClickableSurfaceDefaults.scale(focusedScale = if (reduceMotion) 1f else 1.06f),
        border = ClickableSurfaceDefaults.border(
            border = if (selected && container != null) Border(BorderStroke(2.dp, colors.textPrimary), shape = shape) else Border.None,
            focusedBorder = Border(BorderStroke(OrielTokens.Focus.RingWidth, colors.focusRing), shape = shape),
        ),
    ) {
        content()
    }
}

@Composable
internal fun SettingLabel(text: String) {
    Text(text, style = OrielType.Label, color = LocalOrielColors.current.textSecondary)
}

@Composable
private fun ToggleRow(label: String, on: Boolean, onToggle: () -> Unit) {
    val colors = LocalOrielColors.current
    val state = stringResource(if (on) R.string.state_on else R.string.state_off)
    PanelControl(
        onClick = onToggle,
        shape = RoundedCornerShape(OrielTokens.Radius.Md),
        container = colors.textPrimary.copy(alpha = 0f),
        modifier = Modifier
            .fillMaxWidth()
            .semantics {
                role = Role.Switch
                stateDescription = state
            },
    ) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(label, style = OrielType.Body, color = colors.textPrimary)
            Box(
                Modifier
                    .size(width = 46.dp, height = 26.dp)
                    .background(if (on) colors.accent else colors.textPrimary.copy(alpha = 0.22f), CircleShape)
                    .padding(3.dp),
                contentAlignment = if (on) Alignment.CenterEnd else Alignment.CenterStart,
            ) {
                Box(Modifier.size(20.dp).background(Color.White, CircleShape))
            }
        }
    }
}

/**
 * The settings panel: regular glass, because it carries text (HIG). It opens with focus on the first
 * option, and closing it with Back returns focus to the Settings button.
 */
@Composable
fun SettingsPanel(
    preferences: LauncherPreferences,
    onUpdate: ((LauncherPreferences) -> LauncherPreferences) -> Unit,
    onRestore: () -> Unit,
    onLicenses: () -> Unit,
    onClose: () -> Unit,
) {
    val colors = LocalOrielColors.current
    val first = remember { FocusRequester() }

    OrielDialog(onDismiss = onClose) {
        GlassSurface(
            shape = RoundedCornerShape(OrielTokens.Radius.Xl),
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(24.dp)
                .width(440.dp)
                .fillMaxHeight(),
        ) {
            Column(
                Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(28.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                    Text(stringResource(R.string.settings), style = OrielType.Headline, color = colors.textPrimary)
                    Text(stringResource(R.string.settings_close_hint), style = OrielType.Caption, color = colors.textSecondary)
                }

                // Theme packs come first: one choice sets the theme, accent, and wallpaper together.
                val currentPack = OrielTokens.ThemePack.All.firstOrNull { preferences.matches(it) }
                SettingLabel(stringResource(R.string.settings_theme_pack))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OrielTokens.ThemePack.All.forEachIndexed { index, pack ->
                        val wallpaper = wallpaperById(pack.wallpaperId)
                        val accent = OrielTokens.Accent.All.firstOrNull { it.id == pack.accentId } ?: OrielTokens.Accent.Default
                        val packLabel = tokenText("pack_${pack.id}", pack.label)
                        PanelControl(
                            onClick = { onUpdate { it.withPack(pack) } },
                            shape = RoundedCornerShape(OrielTokens.Radius.Sm),
                            selected = currentPack == pack,
                            container = wallpaper.base,
                            modifier = Modifier
                                .size(width = 52.dp, height = 36.dp)
                                .semantics { contentDescription = packLabel }
                                .then(if (index == 0) Modifier.focusRequester(first) else Modifier),
                        ) {
                            Canvas(Modifier.fillMaxSize()) {
                                drawWallpaper(wallpaper)
                                drawCircle(
                                    color = if (pack.isLight) accent.onLight else accent.onDark,
                                    radius = 5.dp.toPx(),
                                    center = Offset(size.width - 9.dp.toPx(), size.height - 9.dp.toPx()),
                                )
                            }
                        }
                    }
                }
                Text(
                    currentPack?.let {
                        stringResource(R.string.theme_pack_caption, tokenText("pack_${it.id}", it.label), tokenText("pack_${it.id}_description", it.description))
                    } ?: stringResource(R.string.theme_pack_custom),
                    style = OrielType.Caption,
                    color = colors.textSecondary,
                )

                SettingLabel(stringResource(R.string.settings_theme))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    ThemeMode.entries.forEach { mode ->
                        PanelControl(
                            onClick = { onUpdate { it.copy(theme = mode) } },
                            shape = RoundedCornerShape(OrielTokens.Radius.Pill),
                            selected = preferences.theme == mode,
                        ) {
                            Text(
                                stringResource(if (mode == ThemeMode.Dark) R.string.theme_dark else R.string.theme_light),
                                style = OrielType.Label,
                                modifier = Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                            )
                        }
                    }
                }

                SettingLabel(stringResource(R.string.settings_accent))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OrielTokens.Accent.All.forEach { accent ->
                        val accentLabel = tokenText("accent_${accent.id}", accent.label)
                        PanelControl(
                            onClick = { onUpdate { it.copy(accentId = accent.id) } },
                            shape = CircleShape,
                            selected = preferences.accentId == accent.id,
                            container = if (colors.isLight) accent.onLight else accent.onDark,
                            modifier = Modifier.size(40.dp).semantics { contentDescription = accentLabel },
                        ) {}
                    }
                }

                SettingLabel(stringResource(R.string.settings_wallpaper))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OrielTokens.Wallpaper.All.forEach { wallpaper ->
                        val wallpaperLabel = tokenText("wallpaper_${wallpaper.id}", wallpaper.label)
                        PanelControl(
                            onClick = { onUpdate { it.copy(wallpaperId = wallpaper.id) } },
                            shape = RoundedCornerShape(OrielTokens.Radius.Sm),
                            selected = preferences.wallpaperId == wallpaper.id,
                            container = wallpaper.base,
                            modifier = Modifier.size(width = 56.dp, height = 36.dp).semantics { contentDescription = wallpaperLabel },
                        ) {
                            Canvas(Modifier.fillMaxSize()) { drawWallpaper(wallpaper) }
                        }
                    }
                }

                ToggleRow(stringResource(R.string.settings_clock), preferences.showClock) { onUpdate { it.copy(showClock = !it.showClock) } }
                ToggleRow(stringResource(R.string.settings_reduce_transparency), preferences.reduceTransparency) {
                    onUpdate { it.copy(reduceTransparency = !it.reduceTransparency) }
                }
                ToggleRow(stringResource(R.string.settings_reduce_motion), preferences.reduceMotion) {
                    onUpdate { it.copy(reduceMotion = !it.reduceMotion) }
                }

                PanelControl(
                    onClick = onLicenses,
                    shape = RoundedCornerShape(OrielTokens.Radius.Md),
                    container = colors.textPrimary.copy(alpha = 0f),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(
                        stringResource(R.string.settings_licenses),
                        style = OrielType.Body,
                        color = colors.textSecondary,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    )
                }

                PanelControl(
                    onClick = onRestore,
                    shape = RoundedCornerShape(OrielTokens.Radius.Md),
                    container = colors.textPrimary.copy(alpha = 0f),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(
                        stringResource(R.string.settings_restore),
                        style = OrielType.Body,
                        color = colors.textSecondary,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    )
                }
            }
        }
        LaunchedEffect(Unit) { runCatching { first.requestFocus() } }
    }
}

/** Options for one app, opened with Menu or by pressing and holding OK. A menu, so regular glass. */
@Composable
fun AppOptionsMenu(app: AppEntry, choices: List<AppOption>, onChoose: (AppOption) -> Unit, onDismiss: () -> Unit) {
    val colors = LocalOrielColors.current
    val first = remember { FocusRequester() }

    OrielDialog(onDismiss = onDismiss) {
        GlassSurface(
            shape = RoundedCornerShape(OrielTokens.Radius.Lg),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp)
                .widthIn(min = 360.dp),
        ) {
            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    app.label.uppercase(),
                    style = OrielType.Caption,
                    color = colors.textSecondary,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                )
                choices.forEachIndexed { index, option ->
                    PanelControl(
                        onClick = { onChoose(option) },
                        shape = RoundedCornerShape(OrielTokens.Radius.Md),
                        container = colors.textPrimary.copy(alpha = 0f),
                        modifier = Modifier
                            .fillMaxWidth()
                            .then(if (index == 0) Modifier.focusRequester(first) else Modifier),
                    ) {
                        Text(
                            stringResource(option.label()),
                            style = OrielType.Body,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                        )
                    }
                }
            }
        }
        LaunchedEffect(Unit) { runCatching { first.requestFocus() } }
    }
}

private fun AppOption.label(): Int = when (this) {
    AppOption.AddFavorite -> R.string.option_add_favorite
    AppOption.RemoveFavorite -> R.string.option_remove_favorite
    AppOption.MoveLeft -> R.string.option_move_left
    AppOption.MoveRight -> R.string.option_move_right
    AppOption.Hide -> R.string.option_hide
}
