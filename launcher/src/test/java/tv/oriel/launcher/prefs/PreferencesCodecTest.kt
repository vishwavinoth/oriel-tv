package tv.oriel.launcher.prefs

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import tv.oriel.launcher.ui.theme.OrielTokens

class PreferencesCodecTest {
    @Test
    fun `nothing stored decodes to the defaults`() {
        assertEquals(LauncherPreferences(), PreferencesCodec.decode(emptyMap()))
    }

    @Test
    fun `values survive a round trip`() {
        val original = LauncherPreferences(
            theme = ThemeMode.Light,
            accentId = "amber",
            wallpaperId = "mist",
            showClock = false,
            reduceTransparency = true,
            reduceMotion = true,
            favorites = listOf("com.example.b/.Main", "com.example.a/.Main"),
            hidden = setOf("com.example.c/.Main"),
            favoritesInitialized = true,
        )
        assertEquals(original, PreferencesCodec.decode(PreferencesCodec.encode(original)))
    }

    @Test
    fun `unknown and wrongly typed values fall back to defaults`() {
        val decoded = PreferencesCodec.decode(
            mapOf(
                PreferencesCodec.THEME to "sepia",
                PreferencesCodec.ACCENT to "neon",
                PreferencesCodec.WALLPAPER to 42,
                PreferencesCodec.SHOW_CLOCK to "yes",
                PreferencesCodec.HIDDEN to "not a set",
            ),
        )
        assertEquals(ThemeMode.Dark, decoded.theme)
        assertEquals(OrielTokens.Accent.Default.id, decoded.accentId)
        assertEquals(OrielTokens.Wallpaper.Default.id, decoded.wallpaperId)
        assertTrue(decoded.showClock)
        assertTrue(decoded.hidden.isEmpty())
    }

    @Test
    fun `malformed and duplicate app keys are dropped`() {
        val decoded = PreferencesCodec.decode(
            mapOf(
                PreferencesCodec.FAVORITES to "com.example.a/.Main\n\nnot a key\ncom.example.a/.Main\n com.example.b/.Main ",
                PreferencesCodec.HIDDEN to setOf("com.example.c/.Main", "../etc/passwd", 7),
            ),
        )
        assertEquals(listOf("com.example.a/.Main", "com.example.b/.Main"), decoded.favorites)
        assertEquals(setOf("com.example.c/.Main"), decoded.hidden)
    }

    @Test
    fun `component keys must look like package and activity names`() {
        assertTrue(PreferencesCodec.isComponentKey("com.example.app/com.example.app.MainActivity"))
        assertTrue(PreferencesCodec.isComponentKey("com.example.app/.Main\$Inner"))
        assertFalse(PreferencesCodec.isComponentKey("com.example.app"))
        assertFalse(PreferencesCodec.isComponentKey("com.example app/.Main"))
    }
}
