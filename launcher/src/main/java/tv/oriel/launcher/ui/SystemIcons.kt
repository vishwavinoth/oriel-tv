package tv.oriel.launcher.ui

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes
import androidx.compose.ui.unit.dp

private fun strokeIcon(name: String, path: String): ImageVector = ImageVector.Builder(
    name = name,
    defaultWidth = 24.dp,
    defaultHeight = 24.dp,
    viewportWidth = 24f,
    viewportHeight = 24f,
).addPath(
    pathData = addPathNodes(path),
    stroke = SolidColor(Color.White),
    strokeLineWidth = 1.8f,
    strokeLineCap = StrokeCap.Round,
    strokeLineJoin = StrokeJoin.Round,
).build()

/** Line icons drawn for Oriel, all in one stroke style. `h.01` draws a dot with the round cap. */
internal object SystemIcons {
    val Sliders = strokeIcon("Sliders", "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4")
    val Controls = strokeIcon("Controls", "M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 0 6H6a3 3 0 0 1-3-3zM3 16a3 3 0 0 1 3-3h12a3 3 0 0 1 0 6H6a3 3 0 0 1-3-3zM16 8h.01M8 16h.01")
    val Wifi = strokeIcon("Wifi", "M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01")
    val Ethernet = strokeIcon("Ethernet", "M6 4h12v10H6zM9 14v3h6v-3M12 17v3M9.5 8v2M12 8v2M14.5 8v2")
    val Offline = strokeIcon("Offline", "M2.5 9a14 14 0 0 1 19 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M4 4l16 16")
    val Globe = strokeIcon("Globe", "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18")
    val Bluetooth = strokeIcon("Bluetooth", "M7 7l10 10-5 4V3l5 4L7 17")
    val Bell = strokeIcon("Bell", "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0")
    val Display = strokeIcon("Display", "M3 5h18v12H3zM8 21h8M12 17v4")
    val Sound = strokeIcon("Sound", "M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12")
    val Moon = strokeIcon("Moon", "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z")
    val Clock = strokeIcon("Clock", "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2")
    val Keyboard = strokeIcon("Keyboard", "M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M8 14h8")
    val Accessibility = strokeIcon("Accessibility", "M10.5 4.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M5 8l7 1.5L19 8M12 9.5V14M9 20l3-6 3 6")
    val Apps = strokeIcon("Apps", "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z")
    val Storage = strokeIcon("Storage", "M4 6h16v4H4zM4 14h16v4H4zM7 8h.01M7 16h.01")
    val Shield = strokeIcon("Shield", "M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6z")
    val Info = strokeIcon("Info", "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 11v5M12 8h.01")
    val Gear = strokeIcon("Gear", "M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1")
}
