package tv.oriel.launcher.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.tv.material3.Border
import androidx.tv.material3.Card
import androidx.tv.material3.CardDefaults
import androidx.tv.material3.Glow
import androidx.tv.material3.Text
import tv.oriel.launcher.data.AppArtwork
import tv.oriel.launcher.data.AppEntry
import tv.oriel.launcher.ui.theme.LocalOrielColors
import tv.oriel.launcher.ui.theme.LocalOrielEffects
import tv.oriel.launcher.ui.theme.OrielTokens
import tv.oriel.launcher.ui.theme.OrielType

/**
 * An app tile. Tiles are content; on focus they lift, scale, and gain a light edge, which is how glass
 * shows up on TV (HIG, tvOS; ADR 0004, rule 6). Press and hold OK, or press Menu, for options.
 */
@Composable
fun AppTile(
    app: AppEntry,
    artwork: AppArtwork?,
    width: Dp,
    onOpen: () -> Unit,
    onOptions: () -> Unit,
    onFocused: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = LocalOrielColors.current
    val reduceMotion = LocalOrielEffects.current.reduceMotion
    val shape = RoundedCornerShape(OrielTokens.Radius.Sm)

    Card(
        onClick = onOpen,
        onLongClick = onOptions,
        modifier = modifier
            .width(width)
            .aspectRatio(16f / 9f)
            .semantics { contentDescription = app.label }
            .onFocusChanged { if (it.isFocused) onFocused() }
            .onPreviewKeyEvent { event ->
                if (event.key == Key.Menu && event.type == KeyEventType.KeyUp) {
                    onOptions()
                    true
                } else {
                    false
                }
            },
        shape = CardDefaults.shape(shape),
        colors = CardDefaults.colors(containerColor = colors.surface, focusedContainerColor = colors.surfaceHover),
        scale = CardDefaults.scale(focusedScale = if (reduceMotion) 1f else OrielTokens.Focus.Scale),
        border = CardDefaults.border(
            focusedBorder = Border(BorderStroke(OrielTokens.Focus.RingWidth, colors.focusRing), shape = shape),
        ),
        glow = CardDefaults.glow(focusedGlow = Glow(elevationColor = colors.glassShadow, elevation = 16.dp)),
    ) {
        if (artwork?.isBanner == true) {
            Image(bitmap = artwork.image, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Brush.verticalGradient(listOf(colors.surfaceHover, colors.surface)))
                    .padding(8.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(Modifier.size(36.dp), contentAlignment = Alignment.Center) {
                    artwork?.let { Image(bitmap = it.image, contentDescription = null, modifier = Modifier.fillMaxSize()) }
                }
                Text(
                    text = app.label,
                    style = OrielType.Caption,
                    color = colors.textPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 6.dp),
                )
            }
        }
    }
}
