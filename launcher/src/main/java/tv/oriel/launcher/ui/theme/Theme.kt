package tv.oriel.launcher.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.TextUnit
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.darkColorScheme
import androidx.tv.material3.lightColorScheme
import tv.oriel.launcher.prefs.LauncherPreferences
import tv.oriel.launcher.prefs.ThemeMode

/** Colors for the current theme and accent, resolved from the shared design tokens (ADR 0003). */
@Immutable
data class OrielColors(
    val isLight: Boolean,
    val background: Color,
    val surface: Color,
    val surfaceHover: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textTertiary: Color,
    val border: Color,
    val accent: Color,
    val onAccent: Color,
    val focusRing: Color,
    val glassRegular: Color,
    val glassClear: Color,
    val glassDim: Color,
    val glassEdge: Color,
    val glassHighlight: Color,
    val glassSolid: Color,
    val glassShadow: Color,
    val scrim: Color,
    val materialRegular: Color,
)

/** Accessibility choices that change how surfaces and motion render (ADR 0004 and ADR 0005). */
@Immutable
data class OrielEffects(val reduceTransparency: Boolean, val reduceMotion: Boolean)

val LocalOrielColors = staticCompositionLocalOf<OrielColors> { error("OrielTheme is missing") }
val LocalOrielEffects = staticCompositionLocalOf { OrielEffects(reduceTransparency = false, reduceMotion = false) }

fun orielColors(theme: ThemeMode, accentId: String): OrielColors {
    val accent = OrielTokens.Accent.All.firstOrNull { it.id == accentId } ?: OrielTokens.Accent.Default
    return if (theme == ThemeMode.Light) {
        OrielColors(
            isLight = true,
            background = OrielTokens.LightColor.Background,
            surface = OrielTokens.LightColor.Surface,
            surfaceHover = OrielTokens.LightColor.SurfaceHover,
            textPrimary = OrielTokens.LightColor.TextPrimary,
            textSecondary = OrielTokens.LightColor.TextSecondary,
            textTertiary = OrielTokens.LightColor.TextTertiary,
            border = OrielTokens.LightColor.Border,
            accent = accent.onLight,
            onAccent = OrielTokens.LightColor.OnAccent,
            focusRing = OrielTokens.LightColor.FocusRing,
            glassRegular = OrielTokens.LightGlass.Regular,
            glassClear = OrielTokens.LightGlass.Clear,
            glassDim = OrielTokens.LightGlass.Dim,
            glassEdge = OrielTokens.LightGlass.Edge,
            glassHighlight = OrielTokens.LightGlass.Highlight,
            glassSolid = OrielTokens.LightGlass.Solid,
            glassShadow = OrielTokens.LightGlass.Shadow,
            scrim = OrielTokens.LightGlass.Scrim,
            materialRegular = OrielTokens.LightMaterial.Regular,
        )
    } else {
        OrielColors(
            isLight = false,
            background = OrielTokens.DarkColor.Background,
            surface = OrielTokens.DarkColor.Surface,
            surfaceHover = OrielTokens.DarkColor.SurfaceHover,
            textPrimary = OrielTokens.DarkColor.TextPrimary,
            textSecondary = OrielTokens.DarkColor.TextSecondary,
            textTertiary = OrielTokens.DarkColor.TextTertiary,
            border = OrielTokens.DarkColor.Border,
            accent = accent.onDark,
            onAccent = OrielTokens.DarkColor.OnAccent,
            focusRing = OrielTokens.DarkColor.FocusRing,
            glassRegular = OrielTokens.DarkGlass.Regular,
            glassClear = OrielTokens.DarkGlass.Clear,
            glassDim = OrielTokens.DarkGlass.Dim,
            glassEdge = OrielTokens.DarkGlass.Edge,
            glassHighlight = OrielTokens.DarkGlass.Highlight,
            glassSolid = OrielTokens.DarkGlass.Solid,
            glassShadow = OrielTokens.DarkGlass.Shadow,
            scrim = OrielTokens.DarkGlass.Scrim,
            materialRegular = OrielTokens.DarkMaterial.Regular,
        )
    }
}

private fun style(size: TextUnit, lineHeight: TextUnit, weight: Int, tracking: TextUnit) =
    TextStyle(fontSize = size, lineHeight = lineHeight, fontWeight = FontWeight(weight), letterSpacing = tracking)

/** The TV type scale from the design tokens, sized for viewing from across a room. */
object OrielType {
    val Display = OrielTokens.TvType.Display.let { style(it.Size, it.LineHeight, it.Weight, it.Tracking) }
    val Headline = OrielTokens.TvType.Headline.let { style(it.Size, it.LineHeight, it.Weight, it.Tracking) }
    val Title = OrielTokens.TvType.Title.let { style(it.Size, it.LineHeight, it.Weight, it.Tracking) }
    val Body = OrielTokens.TvType.Body.let { style(it.Size, it.LineHeight, it.Weight, it.Tracking) }
    val Label = OrielTokens.TvType.Label.let { style(it.Size, it.LineHeight, it.Weight, it.Tracking) }
    val Caption = OrielTokens.TvType.Caption.let { style(it.Size, it.LineHeight, it.Weight, it.Tracking) }
}

@Composable
fun OrielTheme(preferences: LauncherPreferences, systemReduceMotion: Boolean, content: @Composable () -> Unit) {
    val colors = orielColors(preferences.theme, preferences.accentId)
    val scheme = if (colors.isLight) {
        lightColorScheme(
            primary = colors.accent,
            onPrimary = colors.onAccent,
            background = colors.background,
            onBackground = colors.textPrimary,
            surface = colors.surface,
            onSurface = colors.textPrimary,
            border = colors.border,
        )
    } else {
        darkColorScheme(
            primary = colors.accent,
            onPrimary = colors.onAccent,
            background = colors.background,
            onBackground = colors.textPrimary,
            surface = colors.surface,
            onSurface = colors.textPrimary,
            border = colors.border,
        )
    }
    CompositionLocalProvider(
        LocalOrielColors provides colors,
        LocalOrielEffects provides OrielEffects(
            reduceTransparency = preferences.reduceTransparency,
            reduceMotion = preferences.reduceMotion || systemReduceMotion,
        ),
    ) {
        MaterialTheme(colorScheme = scheme, content = content)
    }
}
