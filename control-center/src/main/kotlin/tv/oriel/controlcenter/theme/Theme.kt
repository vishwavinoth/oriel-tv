package tv.oriel.controlcenter.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

/**
 * Control Center uses the shared dark palette. On the desktop, panels use solid material colors rather than
 * blur, which keeps text crisp at every window size (ADR 0005, reduced-transparency equivalent).
 */
@Composable
fun ControlCenterTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = OrielTokens.Accent.Default.onDark,
            onPrimary = OrielTokens.DarkColor.OnAccent,
            background = OrielTokens.DarkColor.Background,
            onBackground = OrielTokens.DarkColor.TextPrimary,
            surface = OrielTokens.DarkColor.Surface,
            onSurface = OrielTokens.DarkColor.TextPrimary,
            surfaceVariant = OrielTokens.DarkColor.BackgroundRaised,
            onSurfaceVariant = OrielTokens.DarkColor.TextSecondary,
            outline = OrielTokens.DarkColor.Border,
            error = OrielTokens.DarkColor.Danger,
        ),
        content = content,
    )
}
