package tv.oriel.launcher.prefs

import android.content.Context
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.MutablePreferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import java.io.IOException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import tv.oriel.launcher.ui.theme.OrielTokens
import tv.oriel.launcher.ui.theme.ThemePackToken

enum class ThemeMode(val id: String) {
    Dark("dark"),
    Light("light");

    companion object {
        fun fromId(id: String?): ThemeMode = entries.firstOrNull { it.id == id } ?: Dark
    }
}

/** Everything the launcher remembers. It's stored only on the TV (PRIVACY.md). */
data class LauncherPreferences(
    val theme: ThemeMode = ThemeMode.Dark,
    val accentId: String = OrielTokens.Accent.Default.id,
    val wallpaperId: String = OrielTokens.Wallpaper.Default.id,
    val showClock: Boolean = true,
    val reduceTransparency: Boolean = false,
    val reduceMotion: Boolean = false,
    /** Favorite apps in dock order, as "package/activity" keys. */
    val favorites: List<String> = emptyList(),
    val hidden: Set<String> = emptySet(),
    /** False until the dock has been filled with suggested favorites once. */
    val favoritesInitialized: Boolean = false,
)

/** A theme pack sets the theme, accent, and wallpaper together, and leaves everything else as it is. */
fun LauncherPreferences.withPack(pack: ThemePackToken): LauncherPreferences =
    copy(theme = if (pack.isLight) ThemeMode.Light else ThemeMode.Dark, accentId = pack.accentId, wallpaperId = pack.wallpaperId)

/** True when these preferences already look exactly like the pack. */
fun LauncherPreferences.matches(pack: ThemePackToken): Boolean = this == withPack(pack)

/**
 * Converts preferences to and from plain stored values. Unknown, missing, or malformed values fall back
 * to the defaults, so a damaged settings file can never stop the launcher from starting (PRD section 6.4).
 */
object PreferencesCodec {
    const val THEME = "theme"
    const val ACCENT = "accent"
    const val WALLPAPER = "wallpaper"
    const val SHOW_CLOCK = "show_clock"
    const val REDUCE_TRANSPARENCY = "reduce_transparency"
    const val REDUCE_MOTION = "reduce_motion"
    const val FAVORITES = "favorites"
    const val HIDDEN = "hidden"
    const val FAVORITES_INITIALIZED = "favorites_initialized"

    private const val SEPARATOR = "\n"
    private val componentKey = Regex("^[A-Za-z0-9_.]+/[A-Za-z0-9_.$]+$")

    fun isComponentKey(value: String): Boolean = componentKey.matches(value)

    fun decode(values: Map<String, Any?>): LauncherPreferences {
        val defaults = LauncherPreferences()
        fun string(key: String) = values[key] as? String
        fun flag(key: String, fallback: Boolean) = values[key] as? Boolean ?: fallback

        return LauncherPreferences(
            theme = ThemeMode.fromId(string(THEME)),
            accentId = string(ACCENT)?.takeIf { id -> OrielTokens.Accent.All.any { it.id == id } } ?: defaults.accentId,
            wallpaperId = string(WALLPAPER)?.takeIf { id -> OrielTokens.Wallpaper.All.any { it.id == id } } ?: defaults.wallpaperId,
            showClock = flag(SHOW_CLOCK, defaults.showClock),
            reduceTransparency = flag(REDUCE_TRANSPARENCY, defaults.reduceTransparency),
            reduceMotion = flag(REDUCE_MOTION, defaults.reduceMotion),
            favorites = string(FAVORITES)
                ?.split(SEPARATOR)
                ?.map(String::trim)
                ?.filter(::isComponentKey)
                ?.distinct()
                ?: defaults.favorites,
            hidden = (values[HIDDEN] as? Set<*>)
                ?.filterIsInstance<String>()
                ?.filter(::isComponentKey)
                ?.toSet()
                ?: defaults.hidden,
            favoritesInitialized = flag(FAVORITES_INITIALIZED, defaults.favoritesInitialized),
        )
    }

    fun encode(preferences: LauncherPreferences): Map<String, Any> = mapOf(
        THEME to preferences.theme.id,
        ACCENT to preferences.accentId,
        WALLPAPER to preferences.wallpaperId,
        SHOW_CLOCK to preferences.showClock,
        REDUCE_TRANSPARENCY to preferences.reduceTransparency,
        REDUCE_MOTION to preferences.reduceMotion,
        FAVORITES to preferences.favorites.joinToString(SEPARATOR),
        HIDDEN to preferences.hidden,
        FAVORITES_INITIALIZED to preferences.favoritesInitialized,
    )
}

private val Context.dataStore by preferencesDataStore(
    name = "oriel_preferences",
    // A corrupted file is replaced with defaults instead of crashing the home screen.
    corruptionHandler = ReplaceFileCorruptionHandler { emptyPreferences() },
)

class PreferencesRepository(private val context: Context) {
    val preferences: Flow<LauncherPreferences> = context.dataStore.data
        .catch { error -> if (error is IOException) emit(emptyPreferences()) else throw error }
        .map { stored -> PreferencesCodec.decode(stored.asMap().mapKeys { it.key.name }) }

    suspend fun update(transform: (LauncherPreferences) -> LauncherPreferences) {
        context.dataStore.edit { stored ->
            val current = PreferencesCodec.decode(stored.asMap().mapKeys { it.key.name })
            write(stored, PreferencesCodec.encode(transform(current)))
        }
    }

    private fun write(stored: MutablePreferences, values: Map<String, Any>) {
        stored.clear()
        for ((key, value) in values) {
            when (value) {
                is String -> stored[stringPreferencesKey(key)] = value
                is Boolean -> stored[booleanPreferencesKey(key)] = value
                is Set<*> -> stored[stringSetPreferencesKey(key)] = value.filterIsInstance<String>().toSet()
            }
        }
    }
}
