package tv.oriel.controlcenter.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.awt.FileDialog
import java.awt.Frame
import java.awt.Toolkit
import java.awt.datatransfer.StringSelection
import java.nio.file.Path
import tv.oriel.controlcenter.ControlCenterState
import tv.oriel.controlcenter.theme.OrielTokens
import tv.oriel.device.ConnectedDevice
import tv.oriel.device.DeviceReport
import tv.oriel.device.DeviceSnapshot
import tv.oriel.device.OperationOption

private val PanelShape = RoundedCornerShape(OrielTokens.Radius.Md)

@Composable
fun App(state: ControlCenterState) {
    LaunchedEffect(Unit) { if (!state.adbMissing) state.refreshDevices() }
    Row(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        Sidebar(state)
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(32.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
            if (state.busy) LinearProgressIndicator(Modifier.fillMaxWidth())
            state.error?.let { Banner(it, OrielTokens.DarkColor.Danger) { state.error = null } }
            state.notice?.let { Banner(it, OrielTokens.DarkColor.Info) { state.notice = null } }
            val snapshot = state.snapshot
            val review = state.review
            when {
                state.adbMissing -> AdbMissing()
                review != null && snapshot != null -> OperationSheet(state, review, snapshot)
                snapshot != null -> DeviceView(state, snapshot)
                else -> Welcome()
            }
        }
    }
}

@Composable
private fun Sidebar(state: ControlCenterState) {
    var host by remember { mutableStateOf("") }
    Column(
        Modifier.width(300.dp).fillMaxHeight().background(MaterialTheme.colorScheme.surfaceVariant).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Oriel Control Center", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Development build. Every change is explained and confirmed first.", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("DEVICES", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
            TextButton(onClick = state::refreshDevices, enabled = !state.adbMissing && !state.busy) { Text("Refresh") }
        }
        if (state.devices.isEmpty()) {
            Text("No devices yet. Connect over the network below, or plug in a USB cable.", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        state.devices.forEach { device -> DeviceRow(device, selected = state.selected?.serial == device.serial) { state.select(device) } }
        Spacer(Modifier.height(4.dp))
        OutlinedTextField(value = host, onValueChange = { host = it }, label = { Text("TV address, e.g. 192.168.1.50") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        Button(onClick = { state.connect(host) }, enabled = host.isNotBlank() && !state.adbMissing && !state.busy, modifier = Modifier.fillMaxWidth()) { Text("Connect") }
        Spacer(Modifier.weight(1f))
        Text("Network debugging isn’t encrypted. Turn it off on the TV when you’re done.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun DeviceRow(device: ConnectedDevice, selected: Boolean, onClick: () -> Unit) {
    val border = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
    Column(Modifier.fillMaxWidth().border(1.dp, border, PanelShape).clickable(onClick = onClick).padding(12.dp)) {
        Text(device.model ?: device.serial, fontWeight = FontWeight.SemiBold)
        Text(
            "${device.serial} · ${if (device.isReady) "ready" else device.state}${if (device.isNetwork) " · network" else ""}",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
internal fun Panel(title: String, content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface, PanelShape).border(1.dp, MaterialTheme.colorScheme.outline, PanelShape).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(title, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
        content()
    }
}

@Composable
private fun Banner(text: String, tone: Color, onDismiss: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().background(tone.copy(alpha = 0.14f), PanelShape).border(1.dp, tone.copy(alpha = 0.5f), PanelShape).padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text, modifier = Modifier.weight(1f))
        TextButton(onClick = onDismiss) { Text("Dismiss") }
    }
}

@Composable
private fun AdbMissing() = Panel("Android platform tools weren’t found") {
    Text("Control Center uses adb from Android platform tools, which it doesn’t bundle or download.")
    Text("Install platform tools from developer.android.com/tools/releases/platform-tools, or set ANDROID_HOME to your Android SDK folder, then restart Control Center.")
}

@Composable
private fun Welcome() = Panel("Connect a TV") {
    Text("1. On the TV, open Settings, then About, and select the build number seven times to turn on developer options.")
    Text("2. In Developer options, turn on USB debugging or network debugging.")
    Text("3. Enter the TV’s address on the left and select Connect, or plug in a USB cable and select Refresh.")
    Text("4. Accept the prompt on the TV, then choose the device from the list.")
}

@Composable
private fun DeviceView(state: ControlCenterState, device: DeviceSnapshot) {
    Panel(device.label) {
        Fact("Platform", device.platform.label)
        Fact("Android", "${device.androidVersion} (API ${device.sdk}), build ${device.buildId}")
        Fact("Screen", device.screenSize ?: "Couldn’t read")
        Fact("Memory", device.memoryMb?.let { "$it MB" } ?: "Couldn’t read")
        Fact("Connection", if (device.isNetwork) "Network (${device.serial})" else "USB (${device.serial})")
        Fact("Home app", device.homeActivity ?: "Couldn’t read")
        Fact("Oriel", if (device.orielInstalled) "Installed, version ${device.orielVersion ?: "unknown"}" else "Not installed")
        device.warnings.forEach { Text("⚠ $it", color = OrielTokens.DarkColor.Warning) }
    }

    Panel("Operations") {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("APK: ${state.apk?.fileName ?: "not chosen"}", modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
            OutlinedButton(onClick = { chooseFile("Choose the Oriel APK", save = false)?.let { state.apk = it } }) { Text("Choose APK") }
        }
        state.options.forEach { option ->
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(option.title, fontWeight = FontWeight.SemiBold)
                    if (option is OperationOption.Unavailable) Text(option.reason, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                if (option is OperationOption.Available) Button(onClick = { state.review(option.plan) }, enabled = !state.busy) { Text("Review") }
            }
        }
    }

    Panel("Backup") {
        Text("Saves which apps are turned off and which app is the home screen. It can’t back up Android itself or other apps’ data.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = { chooseFile("Save backup", save = true, suggested = "oriel-backup.json")?.let(state::exportBackup) }, enabled = !state.busy) { Text("Export backup") }
            OutlinedButton(onClick = { chooseFile("Open backup", save = false)?.let(state::reviewRestore) }, enabled = !state.busy) { Text("Restore from backup") }
        }
    }

    Panel("Device report") {
        Text("A summary to share in a compatibility report or when asking for help. It leaves out the device’s address, serial number, and your list of apps.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        val report = DeviceReport.text(device)
        Mono(report)
        OutlinedButton(onClick = { copyText(report); state.notice = "Device report copied." }) { Text("Copy report") }
    }

    Panel("History") {
        if (state.entries.isEmpty()) Text("No operations yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        state.entries.asReversed().take(20).forEach { entry ->
            Text("${entry.timestamp.take(19).replace('T', ' ')} · ${entry.deviceModel} · ${entry.operation} · ${entry.outcome}", fontSize = 13.sp)
        }
    }
}

@Composable
private fun Fact(label: String, value: String) {
    Row {
        Text(label, modifier = Modifier.width(140.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value)
    }
}

private fun copyText(text: String) = Toolkit.getDefaultToolkit().systemClipboard.setContents(StringSelection(text), null)

/** The system's own file dialog, so Control Center never needs broad file access. */
internal fun chooseFile(title: String, save: Boolean, suggested: String? = null): Path? {
    val dialog = FileDialog(null as Frame?, title, if (save) FileDialog.SAVE else FileDialog.LOAD)
    suggested?.let { dialog.file = it }
    dialog.isVisible = true
    val name = dialog.file ?: return null
    return Path.of(dialog.directory, name)
}

@Composable
internal fun Mono(text: String) {
    Box(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.background, PanelShape).padding(12.dp)) {
        Text(text, fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace, fontSize = 13.sp)
    }
}
