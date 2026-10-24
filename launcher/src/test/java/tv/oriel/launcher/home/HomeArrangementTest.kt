package tv.oriel.launcher.home

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import tv.oriel.launcher.data.AppEntry
import tv.oriel.launcher.prefs.LauncherPreferences

class HomeArrangementTest {
    private fun app(name: String, tv: Boolean = true) =
        AppEntry(key = "com.example.$name/.Main", packageName = "com.example.$name", activityName = ".Main", label = name, isTvApp = tv)

    private val cinema = app("Cinema")
    private val music = app("music")
    private val browser = app("Browser", tv = false)
    private val news = app("News")
    private val apps = listOf(news, cinema, music, browser)

    @Test
    fun `grid lists every visible app alphabetically, ignoring case`() {
        val home = HomeArrangement.arrange(apps, LauncherPreferences())
        assertEquals(listOf("Browser", "Cinema", "music", "News"), home.grid.map { it.label })
    }

    @Test
    fun `dock keeps the favorites order and drops apps that aren't installed`() {
        val prefs = LauncherPreferences(favorites = listOf(music.key, "com.gone/.Main", cinema.key))
        assertEquals(listOf(music, cinema), HomeArrangement.arrange(apps, prefs).dock)
    }

    @Test
    fun `hidden apps leave both the dock and the grid`() {
        val prefs = LauncherPreferences(favorites = listOf(cinema.key), hidden = setOf(cinema.key))
        val home = HomeArrangement.arrange(apps, prefs)
        assertTrue(home.dock.isEmpty())
        assertFalse(cinema in home.grid)
    }

    @Test
    fun `suggested favorites are TV apps in alphabetical order`() {
        assertEquals(listOf(cinema.key, music.key, news.key), HomeArrangement.suggestFavorites(apps))
        assertEquals(listOf(browser.key), HomeArrangement.suggestFavorites(listOf(browser)))
    }

    @Test
    fun `options depend on whether the app is a favorite and where it sits in the dock`() {
        val prefs = LauncherPreferences(favorites = listOf(cinema.key, music.key))
        assertEquals(
            listOf(AppOption.RemoveFavorite, AppOption.MoveRight, AppOption.Hide),
            HomeArrangement.options(prefs, cinema.key, fromDock = true),
        )
        assertEquals(
            listOf(AppOption.RemoveFavorite, AppOption.MoveLeft, AppOption.Hide),
            HomeArrangement.options(prefs, music.key, fromDock = true),
        )
        assertEquals(listOf(AppOption.RemoveFavorite, AppOption.Hide), HomeArrangement.options(prefs, cinema.key, fromDock = false))
        assertEquals(listOf(AppOption.AddFavorite, AppOption.Hide), HomeArrangement.options(prefs, news.key, fromDock = false))
    }

    @Test
    fun `favorites can be added once, moved, and removed`() {
        var prefs = LauncherPreferences()
        prefs = HomeArrangement.apply(prefs, cinema.key, AppOption.AddFavorite)
        prefs = HomeArrangement.apply(prefs, music.key, AppOption.AddFavorite)
        prefs = HomeArrangement.apply(prefs, music.key, AppOption.AddFavorite)
        assertEquals(listOf(cinema.key, music.key), prefs.favorites)

        prefs = HomeArrangement.apply(prefs, music.key, AppOption.MoveLeft)
        assertEquals(listOf(music.key, cinema.key), prefs.favorites)
        assertEquals(prefs, HomeArrangement.apply(prefs, music.key, AppOption.MoveLeft))

        prefs = HomeArrangement.apply(prefs, music.key, AppOption.RemoveFavorite)
        assertEquals(listOf(cinema.key), prefs.favorites)
    }

    @Test
    fun `hiding an app also removes it from favorites`() {
        val prefs = HomeArrangement.apply(LauncherPreferences(favorites = listOf(cinema.key)), cinema.key, AppOption.Hide)
        assertTrue(cinema.key in prefs.hidden)
        assertTrue(prefs.favorites.isEmpty())
    }

    @Test
    fun `restoring defaults clears favorites so they're suggested again`() {
        val restored = HomeArrangement.restoreDefaults()
        assertEquals(LauncherPreferences(), restored)
        assertFalse(restored.favoritesInitialized)
    }
}
