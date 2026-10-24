package tv.oriel.controlcenter

import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import tv.oriel.controlcenter.theme.ControlCenterTheme
import tv.oriel.controlcenter.ui.App

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "Oriel Control Center",
        state = rememberWindowState(width = 1200.dp, height = 820.dp),
    ) {
        val scope = rememberCoroutineScope()
        val state = remember { ControlCenterState(AdbLocator.find()?.let(::ProcessCommandRunner), scope) }
        ControlCenterTheme { App(state) }
    }
}
