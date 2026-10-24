package tv.oriel.controlcenter.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import tv.oriel.controlcenter.ControlCenterState
import tv.oriel.controlcenter.theme.OrielTokens
import tv.oriel.device.DeviceSnapshot
import tv.oriel.device.ExecutionResult
import tv.oriel.device.OperationPlan

/**
 * The review step for every operation (PRD section 7.3): what it does, the target device, the risks, whether
 * it can be undone, the exact commands, and recovery. Nothing runs until the person confirms.
 */
@Composable
fun OperationSheet(state: ControlCenterState, plan: OperationPlan, device: DeviceSnapshot) {
    var understood by remember(plan) { mutableStateOf(false) }
    val result = state.result

    Panel(plan.title) {
        Text("Target: ${device.label} (${device.serial})", color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
    Panel("What it does") { plan.explanation.forEach { Text(it) } }
    Panel("Risks and limitations") { plan.risks.forEach { Text("• $it") } }
    Panel("Can it be undone?") { Text(plan.reversibility.label) }
    Panel("Exact commands") { Mono(plan.preview.joinToString("\n")) }
    Panel("If something goes wrong") { plan.recovery.forEach { Text(it) } }

    if (result == null) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Checkbox(checked = understood, onCheckedChange = { understood = it })
            Text("I understand what this changes on ${device.label}.")
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = state::closeReview, enabled = !state.busy) { Text("Cancel") }
            Button(onClick = state::runReviewed, enabled = understood && !state.busy) { Text("Run on ${device.model}") }
        }
    } else {
        ResultPanel(result, plan)
        Button(onClick = state::closeReview) { Text("Done") }
    }
}

@Composable
private fun ResultPanel(result: ExecutionResult, plan: OperationPlan) {
    when (result) {
        is ExecutionResult.Succeeded -> Panel("Done") {
            Text("✓ All ${plan.steps.size} step(s) succeeded.", color = OrielTokens.DarkColor.Success, fontWeight = FontWeight.SemiBold)
            result.completed.forEach { Mono("${it.command.display()}\n${it.result.output.trim()}") }
        }
        is ExecutionResult.Failed -> Panel("Stopped at a failed step") {
            Text(
                "✕ ${result.completed.size} of ${plan.steps.size} step(s) finished before this one failed. Nothing after it ran.",
                color = OrielTokens.DarkColor.Danger,
                fontWeight = FontWeight.SemiBold,
            )
            Mono("${result.failed.command.display()}\n${result.failed.result.output.trim().ifEmpty { if (result.failed.result.timedOut) "Timed out." else "No output." }}")
            if (result.notRun.isNotEmpty()) Text("Not run: ${result.notRun.joinToString { it.display() }}")
            plan.recovery.forEach { Text(it) }
        }
    }
}
