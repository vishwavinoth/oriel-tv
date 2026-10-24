package tv.oriel.launcher.ui

import android.os.Build
import android.view.ViewGroup
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.BlurredEdgeTreatment
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.window.DialogWindowProvider
import tv.oriel.launcher.ui.theme.LocalOrielColors
import tv.oriel.launcher.ui.theme.LocalOrielEffects
import tv.oriel.launcher.ui.theme.OrielTokens
import tv.oriel.launcher.ui.theme.WallpaperToken

fun wallpaperById(id: String): WallpaperToken =
    OrielTokens.Wallpaper.All.firstOrNull { it.id == id } ?: OrielTokens.Wallpaper.Default

/** Draws a wallpaper as elliptical glows over a base color, matching the website's CSS gradients. */
fun DrawScope.drawWallpaper(wallpaper: WallpaperToken, area: Size = size) {
    if (area.width <= 0f || area.height <= 0f) return
    drawRect(wallpaper.base, size = area)
    for (glow in wallpaper.glows) {
        val center = Offset(glow.x * area.width, glow.y * area.height)
        val radius = glow.radius * area.width
        if (radius <= 0f) continue
        withTransform({ scale(1f, area.height / area.width, center) }) {
            drawCircle(
                brush = Brush.radialGradient(listOf(glow.color, glow.color.copy(alpha = 0f)), center = center, radius = radius),
                radius = radius,
                center = center,
            )
        }
    }
}

/** The screen-sized wallpaper. Glass surfaces read it to blur what's behind them. */
@Immutable
class Backdrop(val wallpaper: WallpaperToken, val scrim: Color, val screenSize: Size)

val LocalBackdrop = compositionLocalOf<Backdrop?> { null }

@Composable
fun WallpaperLayer(backdrop: Backdrop, modifier: Modifier = Modifier) {
    Canvas(modifier.fillMaxSize()) {
        drawWallpaper(backdrop.wallpaper)
        drawRect(backdrop.scrim)
    }
}

/** Regular glass carries text; clear glass is for small controls over the wallpaper (ADR 0005). */
enum class GlassVariant { Regular, Clear }

/**
 * A surface in the functional layer. On Android 12 and newer, it blurs the actual wallpaper behind it.
 * The wallpaper doesn't change from frame to frame, so the blur only redraws when the surface moves
 * (ADR 0004, rule 7). Older TVs, and Reduce transparency, get a tinted or solid fill instead.
 */
@Composable
fun GlassSurface(
    shape: Shape,
    modifier: Modifier = Modifier,
    variant: GlassVariant = GlassVariant.Regular,
    dim: Boolean = false,
    content: @Composable BoxScope.() -> Unit,
) {
    val colors = LocalOrielColors.current
    val solid = LocalOrielEffects.current.reduceTransparency
    val backdrop = LocalBackdrop.current
    var origin by remember { mutableStateOf(Offset.Zero) }
    val tint = when {
        solid -> colors.glassSolid
        variant == GlassVariant.Regular -> colors.glassRegular
        else -> colors.glassClear
    }
    val blurRadius = if (variant == GlassVariant.Regular) OrielTokens.Blur.Regular else OrielTokens.Blur.Clear

    Box(
        modifier
            .onGloballyPositioned { origin = it.positionInRoot() }
            .shadow(elevation = 18.dp, shape = shape, ambientColor = colors.glassShadow, spotColor = colors.glassShadow)
            .clip(shape)
            .border(1.dp, colors.glassEdge, shape),
    ) {
        if (!solid && backdrop != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Canvas(Modifier.matchParentSize().blur(blurRadius, BlurredEdgeTreatment.Rectangle)) {
                translate(-origin.x, -origin.y) {
                    drawWallpaper(backdrop.wallpaper, backdrop.screenSize)
                    drawRect(backdrop.scrim, size = backdrop.screenSize)
                }
            }
        }
        // Clear glass over a bright background gets the HIG's dimming layer.
        if (dim && !solid) Box(Modifier.matchParentSize().background(colors.glassDim))
        Box(
            Modifier
                .matchParentSize()
                .background(tint)
                .drawBehind {
                    drawLine(colors.glassHighlight, Offset(0f, 0.5f), Offset(size.width, 0.5f), strokeWidth = 1.dp.toPx())
                },
        )
        content()
    }
}

/**
 * A full-screen overlay window for panels and menus. It dims the home screen behind it, keeps focus
 * inside until it closes, and closes with Back.
 */
@Composable
fun OrielDialog(onDismiss: () -> Unit, content: @Composable BoxScope.() -> Unit) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
    ) {
        val window = (LocalView.current.parent as? DialogWindowProvider)?.window
        SideEffect {
            window?.setDimAmount(0f)
            window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }
        Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.42f)), content = content)
    }
}
