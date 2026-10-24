package tv.oriel.launcher

import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.addCallback
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.flow.MutableSharedFlow
import tv.oriel.launcher.data.AppEntry
import tv.oriel.launcher.data.AppRepository
import tv.oriel.launcher.home.HomeViewModel
import tv.oriel.launcher.prefs.PreferencesRepository
import tv.oriel.launcher.system.AvailableShortcut
import tv.oriel.launcher.system.ConnectionMonitor
import tv.oriel.launcher.system.SystemShortcuts
import tv.oriel.launcher.ui.HomeScreen
import tv.oriel.launcher.ui.theme.OrielTheme

/** The home screen. It's both the HOME activity and an ordinary app entry, so it can be tried first. */
class MainActivity : ComponentActivity() {
    private val viewModel: HomeViewModel by viewModels {
        viewModelFactory {
            initializer { HomeViewModel(AppRepository(applicationContext), PreferencesRepository(applicationContext)) }
        }
    }

    private val homePresses = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    private val connectionMonitor by lazy { ConnectionMonitor(applicationContext) }

    /** The control panel's shortcuts that this TV can open, checked once per launch. */
    private val shortcuts by lazy { SystemShortcuts.available(::canOpen) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // The home screen has nowhere to go back to. Panels and menus handle Back themselves.
        onBackPressedDispatcher.addCallback(this) {}

        setContent {
            val preferences by viewModel.preferences.collectAsStateWithLifecycle()
            val home by viewModel.home.collectAsStateWithLifecycle()
            val connectionChanges = remember { connectionMonitor.changes() }
            val connection by connectionChanges.collectAsStateWithLifecycle(initialValue = connectionMonitor.current())
            preferences?.let { current ->
                OrielTheme(current, systemReduceMotion = systemAnimationsOff()) {
                    HomeScreen(
                        preferences = current,
                        home = home,
                        artwork = viewModel.artwork,
                        homePresses = homePresses,
                        connection = connection,
                        shortcuts = shortcuts,
                        onOpen = ::open,
                        onShortcut = ::openShortcut,
                        onLoadArtwork = viewModel::loadArtwork,
                        onUpdatePreferences = viewModel::updatePreferences,
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshApps()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (intent.hasCategory(Intent.CATEGORY_HOME)) homePresses.tryEmit(Unit)
    }

    /** Opens an app. Returns false when it can't be opened, so the home screen can say so (PRD section 6.2). */
    private fun open(app: AppEntry): Boolean = try {
        startActivity(viewModel.launchIntent(app))
        true
    } catch (_: ActivityNotFoundException) {
        false
    } catch (_: SecurityException) {
        false
    }

    /** Opens one of the TV's own settings screens from the control panel. Returns false if the TV refuses. */
    private fun openShortcut(shortcut: AvailableShortcut): Boolean = try {
        startActivity(Intent(shortcut.action).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (_: ActivityNotFoundException) {
        false
    } catch (_: SecurityException) {
        false
    }

    // resolveActivity(Intent, ResolveInfoFlags) needs Android 13, and Oriel supports Android 5.0.
    @Suppress("DEPRECATION")
    private fun canOpen(action: String): Boolean = packageManager.resolveActivity(Intent(action), PackageManager.MATCH_DEFAULT_ONLY) != null

    /** Follows the system's "remove animations" setting as well as Oriel's own Reduce motion. */
    private fun systemAnimationsOff(): Boolean =
        Settings.Global.getFloat(contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
}
