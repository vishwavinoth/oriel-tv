package tv.oriel.launcher.home

import java.text.Collator
import tv.oriel.launcher.data.AppEntry
import tv.oriel.launcher.prefs.LauncherPreferences

/** What the home screen shows: the favorites dock, and every visible app in the grid. */
data class HomeModel(val dock: List<AppEntry>, val grid: List<AppEntry>)

/** Options for an app, opened with the Menu button or by pressing and holding OK. */
enum class AppOption { AddFavorite, RemoveFavorite, MoveLeft, MoveRight, Hide }

/**
 * Pure home screen rules, kept free of Android so they can be unit tested. Nothing here removes or
 * changes apps on the device; hiding only affects what Oriel shows (PRD section 6.2).
 */
object HomeArrangement {
    private const val SUGGESTED_FAVORITES = 5

    private val labelOrder: Comparator<String> = Collator.getInstance().let { collator ->
        Comparator { a, b -> collator.compare(a, b) }
    }

    fun arrange(apps: List<AppEntry>, preferences: LauncherPreferences): HomeModel {
        val visible = apps.filter { it.key !in preferences.hidden }
        val byKey = visible.associateBy { it.key }
        return HomeModel(
            dock = preferences.favorites.mapNotNull { byKey[it] },
            grid = visible.sortedWith(compareBy(labelOrder) { it.label }),
        )
    }

    /** First launch fills the dock with TV apps in alphabetical order. Nothing is promoted. */
    fun suggestFavorites(apps: List<AppEntry>): List<String> {
        val candidates = apps.filter { it.isTvApp }.ifEmpty { apps }
        return candidates.sortedWith(compareBy(labelOrder) { it.label }).take(SUGGESTED_FAVORITES).map { it.key }
    }

    fun options(preferences: LauncherPreferences, key: String, fromDock: Boolean): List<AppOption> {
        val position = preferences.favorites.indexOf(key)
        return buildList {
            add(if (position == -1) AppOption.AddFavorite else AppOption.RemoveFavorite)
            if (fromDock && position > 0) add(AppOption.MoveLeft)
            if (fromDock && position != -1 && position < preferences.favorites.lastIndex) add(AppOption.MoveRight)
            add(AppOption.Hide)
        }
    }

    fun apply(preferences: LauncherPreferences, key: String, option: AppOption): LauncherPreferences = when (option) {
        AppOption.AddFavorite -> if (key in preferences.favorites) preferences else preferences.copy(favorites = preferences.favorites + key)
        AppOption.RemoveFavorite -> preferences.copy(favorites = preferences.favorites - key)
        AppOption.MoveLeft -> move(preferences, key, -1)
        AppOption.MoveRight -> move(preferences, key, 1)
        AppOption.Hide -> preferences.copy(hidden = preferences.hidden + key, favorites = preferences.favorites - key)
    }

    /** Resets every setting. The next app refresh suggests favorites again. */
    fun restoreDefaults(): LauncherPreferences = LauncherPreferences()

    private fun move(preferences: LauncherPreferences, key: String, offset: Int): LauncherPreferences {
        val favorites = preferences.favorites.toMutableList()
        val from = favorites.indexOf(key)
        val to = from + offset
        if (from == -1 || to !in favorites.indices) return preferences
        favorites[from] = favorites[to].also { favorites[to] = favorites[from] }
        return preferences.copy(favorites = favorites)
    }
}
