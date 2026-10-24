@file:OptIn(ExperimentalComposeUiApi::class)

package tv.oriel.launcher.ui

import android.text.format.DateFormat
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.focusGroup
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusProperties
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.focusRestorer
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.toSize
import androidx.tv.material3.Border
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.Icon
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import tv.oriel.launcher.R
import tv.oriel.launcher.data.AppArtwork
import tv.oriel.launcher.data.AppEntry
import tv.oriel.launcher.home.AppOption
import tv.oriel.launcher.home.HomeArrangement
import tv.oriel.launcher.home.HomeModel
import tv.oriel.launcher.prefs.LauncherPreferences
import tv.oriel.launcher.system.AvailableShortcut
import tv.oriel.launcher.system.Connection
import tv.oriel.launcher.ui.theme.LocalOrielColors
import tv.oriel.launcher.ui.theme.LocalOrielEffects
import tv.oriel.launcher.ui.theme.OrielTokens
import tv.oriel.launcher.ui.theme.OrielType

private const val COLUMNS = 6

/** Margins that keep content inside the area every TV shows (about 5% of a 960dp-wide screen). */
private val SafeHorizontal = 56.dp
private val SafeVertical = 32.dp
private val TileGap = 16.dp
private val DockPadding = 12.dp

@Composable
fun HomeScreen(
    preferences: LauncherPreferences,
    home: HomeModel?,
    artwork: Map<String, AppArtwork>,
    homePresses: Flow<Unit>,
    connection: Connection,
    shortcuts: List<AvailableShortcut>,
    onOpen: (AppEntry) -> Boolean,
    onShortcut: (AvailableShortcut) -> Boolean,
    onLoadArtwork: (AppEntry) -> Unit,
    onUpdatePreferences: ((LauncherPreferences) -> LauncherPreferences) -> Unit,
) {
    val colors = LocalOrielColors.current
    val context = LocalContext.current
    var screenSize by remember { mutableStateOf(Size.Zero) }
    var focused by remember { mutableStateOf<AppEntry?>(null) }
    var showSettings by rememberSaveable { mutableStateOf(false) }
    var showControlPanel by rememberSaveable { mutableStateOf(false) }
    var showLicenses by rememberSaveable { mutableStateOf(false) }
    var options by remember { mutableStateOf<Pair<AppEntry, Boolean>?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    var initialFocusDone by rememberSaveable { mutableStateOf(false) }
    val firstTile = remember { FocusRequester() }
    val listState = rememberLazyListState()

    fun focusFirstTile() {
        runCatching { firstTile.requestFocus() }
    }

    // Pressing Home while Oriel is open closes panels and returns to the first tile.
    LaunchedEffect(homePresses) {
        homePresses.collect {
            showSettings = false
            showControlPanel = false
            showLicenses = false
            options = null
            listState.scrollToItem(0)
            focusFirstTile()
        }
    }
    LaunchedEffect(home != null) {
        if (home != null && !initialFocusDone) {
            initialFocusDone = true
            focusFirstTile()
        }
    }
    LaunchedEffect(message) {
        if (message != null) {
            delay(3_200)
            message = null
        }
    }

    val backdrop = Backdrop(wallpaperById(preferences.wallpaperId), colors.scrim, screenSize)

    CompositionLocalProvider(LocalBackdrop provides backdrop) {
        Box(Modifier.fillMaxSize().onSizeChanged { screenSize = it.toSize() }) {
            WallpaperLayer(backdrop)

            if (home == null) {
                Text(
                    text = stringResource(R.string.loading_apps),
                    style = OrielType.Body,
                    color = colors.textSecondary,
                    modifier = Modifier.align(Alignment.Center),
                )
            } else {
                BoxWithConstraints(Modifier.fillMaxSize()) {
                    val tileWidth = (maxWidth - SafeHorizontal * 2 - DockPadding * 2 - TileGap * (COLUMNS - 1)) / COLUMNS
                    val rows = home.grid.chunked(COLUMNS)
                    LazyColumn(
                        state = listState,
                        contentPadding = PaddingValues(horizontal = SafeHorizontal, vertical = SafeVertical),
                        verticalArrangement = Arrangement.spacedBy(20.dp),
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        item(key = "top") {
                            TopRow(
                                showClock = preferences.showClock,
                                brightWallpaper = backdrop.wallpaper.isLight,
                                connection = connection,
                                onControlPanel = { showControlPanel = true },
                                onSettings = { showSettings = true },
                            )
                        }
                        item(key = "spotlight") { Spotlight(focused) }
                        item(key = "dock") {
                            Dock(
                                apps = home.dock,
                                artwork = artwork,
                                tileWidth = tileWidth,
                                firstTile = firstTile,
                                onOpen = { app -> if (!onOpen(app)) message = context.getString(R.string.message_open_failed, app.label) },
                                onOptions = { app -> options = app to true },
                                onFocused = { focused = it },
                                onLoadArtwork = onLoadArtwork,
                            )
                        }
                        item(key = "all-apps") { SectionLabel(stringResource(R.string.all_apps)) }
                        if (rows.isEmpty()) {
                            item(key = "empty") { Text(stringResource(R.string.no_apps), style = OrielType.Body, color = colors.textSecondary) }
                        }
                        items(count = rows.size, key = { "row-$it" }) { index ->
                            AppRow(
                                apps = rows[index],
                                artwork = artwork,
                                tileWidth = tileWidth,
                                firstTile = if (home.dock.isEmpty() && index == 0) firstTile else null,
                                onOpen = { app -> if (!onOpen(app)) message = context.getString(R.string.message_open_failed, app.label) },
                                onOptions = { app -> options = app to false },
                                onFocused = { focused = it },
                                onLoadArtwork = onLoadArtwork,
                                modifier = Modifier.padding(horizontal = DockPadding),
                            )
                        }
                    }
                }
            }

            message?.let { text ->
                GlassSurface(
                    shape = RoundedCornerShape(OrielTokens.Radius.Pill),
                    modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 36.dp),
                ) {
                    Text(text, style = OrielType.Label, color = colors.textPrimary, modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp))
                }
            }
        }

        if (showControlPanel) {
            ControlPanel(
                connection = connection,
                shortcuts = shortcuts,
                onShortcut = { shortcut ->
                    if (!onShortcut(shortcut)) message = context.getString(R.string.message_shortcut_failed, context.getString(shortcut.shortcut.label()))
                },
                onOrielSettings = {
                    showControlPanel = false
                    showSettings = true
                },
                onClose = { showControlPanel = false },
            )
        }

        if (showSettings) {
            SettingsPanel(
                preferences = preferences,
                onUpdate = onUpdatePreferences,
                onRestore = {
                    onUpdatePreferences { HomeArrangement.restoreDefaults() }
                    message = context.getString(R.string.message_restored)
                },
                onLicenses = {
                    showSettings = false
                    showLicenses = true
                },
                onClose = { showSettings = false },
            )
        }

        if (showLicenses) LicensesPanel(onClose = { showLicenses = false })

        options?.let { (app, fromDock) ->
            AppOptionsMenu(
                app = app,
                choices = HomeArrangement.options(preferences, app.key, fromDock),
                onChoose = { option ->
                    options = null
                    onUpdatePreferences { HomeArrangement.apply(it, app.key, option) }
                    if (option == AppOption.Hide) message = context.getString(R.string.message_hidden, app.label)
                    // A tile that leaves the dock or the grid takes focus with it, so start again from the first tile.
                    if (option == AppOption.Hide || (fromDock && option == AppOption.RemoveFavorite)) focusFirstTile()
                },
                onDismiss = { options = null },
            )
        }
    }
}

/** Left on the first item and Right on the last item stop at the edge instead of jumping rows. */
private fun Modifier.rowEdges(index: Int, count: Int): Modifier = focusProperties {
    if (index == 0) left = FocusRequester.Cancel
    if (index == count - 1) right = FocusRequester.Cancel
}

@Composable
private fun SectionLabel(text: String) {
    Text(text.uppercase(), style = OrielType.Caption, color = LocalOrielColors.current.textSecondary)
}

@Composable
private fun TopRow(showClock: Boolean, brightWallpaper: Boolean, connection: Connection, onControlPanel: () -> Unit, onSettings: () -> Unit) {
    val colors = LocalOrielColors.current
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
        Box(Modifier.heightIn(min = 64.dp)) { if (showClock) Clock() }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            // Status, not a control, so it can't take focus.
            GlassSurface(shape = RoundedCornerShape(OrielTokens.Radius.Pill), variant = GlassVariant.Clear, dim = brightWallpaper) {
                Row(
                    Modifier.heightIn(min = 56.dp).padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(connection.icon(), contentDescription = null, tint = colors.textPrimary, modifier = Modifier.size(20.dp))
                    Text(stringResource(connection.label()), style = OrielType.Label, color = colors.textPrimary)
                }
            }
            TopButton(SystemIcons.Controls, stringResource(R.string.control_panel), brightWallpaper, onControlPanel)
            TopButton(SystemIcons.Sliders, stringResource(R.string.settings), brightWallpaper, onSettings)
        }
    }
}

@Composable
private fun TopButton(icon: ImageVector, description: String, brightWallpaper: Boolean, onClick: () -> Unit) {
    val colors = LocalOrielColors.current
    // A small control over the wallpaper: clear glass, dimmed when the wallpaper is bright (ADR 0005).
    GlassSurface(shape = CircleShape, variant = GlassVariant.Clear, dim = brightWallpaper) {
        Surface(
            onClick = onClick,
            modifier = Modifier.padding(4.dp).size(48.dp),
            shape = ClickableSurfaceDefaults.shape(CircleShape),
            colors = ClickableSurfaceDefaults.colors(
                containerColor = colors.textPrimary.copy(alpha = 0f),
                contentColor = colors.textPrimary,
                focusedContainerColor = colors.textPrimary,
                focusedContentColor = colors.background,
            ),
            scale = ClickableSurfaceDefaults.scale(focusedScale = if (LocalOrielEffects.current.reduceMotion) 1f else 1.1f),
            border = ClickableSurfaceDefaults.border(focusedBorder = Border(BorderStroke(2.dp, colors.focusRing), shape = CircleShape)),
        ) {
            Icon(imageVector = icon, contentDescription = description, modifier = Modifier.align(Alignment.Center).size(24.dp))
        }
    }
}

@Composable
private fun Clock() {
    val colors = LocalOrielColors.current
    val context = LocalContext.current
    val now by produceState(System.currentTimeMillis()) {
        while (true) {
            value = System.currentTimeMillis()
            delay(60_000 - value % 60_000)
        }
    }
    val time = remember(now) { DateFormat.getTimeFormat(context).format(Date(now)) }
    val date = remember(now) {
        SimpleDateFormat(DateFormat.getBestDateTimePattern(Locale.getDefault(), "EEEEMMMMd"), Locale.getDefault()).format(Date(now))
    }
    Column {
        Text(time, style = OrielType.Display, color = colors.textPrimary)
        Text(date, style = OrielType.Label, color = colors.textSecondary)
    }
}

@Composable
private fun Spotlight(app: AppEntry?) {
    val colors = LocalOrielColors.current
    Column(Modifier.height(96.dp), verticalArrangement = Arrangement.Bottom) {
        if (app != null) {
            Text(
                stringResource(if (app.isTvApp) R.string.tv_app else R.string.android_app).uppercase(),
                style = OrielType.Caption,
                color = colors.textSecondary,
            )
            Text(app.label, style = OrielType.Headline, color = colors.textPrimary, maxLines = 1)
            Text(stringResource(R.string.options_hint), style = OrielType.Caption, color = colors.textSecondary)
        }
    }
}

@Composable
private fun Dock(
    apps: List<AppEntry>,
    artwork: Map<String, AppArtwork>,
    tileWidth: androidx.compose.ui.unit.Dp,
    firstTile: FocusRequester,
    onOpen: (AppEntry) -> Unit,
    onOptions: (AppEntry) -> Unit,
    onFocused: (AppEntry) -> Unit,
    onLoadArtwork: (AppEntry) -> Unit,
) {
    val colors = LocalOrielColors.current
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        SectionLabel(stringResource(R.string.favorites))
        if (apps.isEmpty()) {
            Text(stringResource(R.string.no_favorites), style = OrielType.Body, color = colors.textSecondary)
        } else {
            // The dock is navigation, so it sits in the glass layer, and focus returns to the last tile used.
            GlassSurface(
                shape = RoundedCornerShape(OrielTokens.Radius.Lg),
                modifier = Modifier.focusRestorer().focusGroup(),
            ) {
                AppRow(
                    apps = apps,
                    artwork = artwork,
                    tileWidth = tileWidth,
                    firstTile = firstTile,
                    onOpen = onOpen,
                    onOptions = onOptions,
                    onFocused = onFocused,
                    onLoadArtwork = onLoadArtwork,
                    modifier = Modifier.padding(DockPadding),
                )
            }
        }
    }
}

@Composable
private fun AppRow(
    apps: List<AppEntry>,
    artwork: Map<String, AppArtwork>,
    tileWidth: androidx.compose.ui.unit.Dp,
    firstTile: FocusRequester?,
    onOpen: (AppEntry) -> Unit,
    onOptions: (AppEntry) -> Unit,
    onFocused: (AppEntry) -> Unit,
    onLoadArtwork: (AppEntry) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(TileGap)) {
        apps.forEachIndexed { index, app ->
            key(app.key) {
                LaunchedEffect(app.key) { onLoadArtwork(app) }
                AppTile(
                    app = app,
                    artwork = artwork[app.key],
                    width = tileWidth,
                    onOpen = { onOpen(app) },
                    onOptions = { onOptions(app) },
                    onFocused = { onFocused(app) },
                    modifier = Modifier
                        .rowEdges(index, apps.size)
                        .then(if (index == 0 && firstTile != null) Modifier.focusRequester(firstTile) else Modifier),
                )
            }
        }
    }
}
