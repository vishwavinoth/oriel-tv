package tv.oriel.device

data class CommandResult(val exitCode: Int, val output: String, val timedOut: Boolean = false) {
    /** adb exits with 0 even when the TV reports a failure, so the output is checked too. */
    val succeeded: Boolean
        get() = !timedOut && exitCode == 0 && FAILURE_MARKERS.none { output.contains(it) }

    private companion object {
        val FAILURE_MARKERS = listOf("Failure", "Error:", "Exception", "error:", "failed to", "cannot ", "Unknown command", "No activity found")
    }
}

fun interface CommandRunner {
    suspend fun run(command: HostCommand): CommandResult
}

data class StepResult(val command: HostCommand, val result: CommandResult)

/** What happened, reported honestly, including which steps ran before a failure (PRD section 7.5). */
sealed interface ExecutionResult {
    val completed: List<StepResult>

    data class Succeeded(override val completed: List<StepResult>) : ExecutionResult

    data class Failed(override val completed: List<StepResult>, val failed: StepResult, val notRun: List<HostCommand>) : ExecutionResult
}

object OperationExecutor {
    /** Runs a plan's steps in order and stops at the first failure, so nothing runs after something goes wrong. */
    suspend fun execute(plan: OperationPlan, runner: CommandRunner): ExecutionResult {
        val completed = mutableListOf<StepResult>()
        plan.steps.forEachIndexed { index, command ->
            val step = StepResult(command, runner.run(command))
            if (!step.result.succeeded) return ExecutionResult.Failed(completed, step, plan.steps.drop(index + 1))
            completed += step
        }
        return ExecutionResult.Succeeded(completed)
    }
}

/** Reads everything Control Center shows about a device. Every command here only reads. */
object DeviceReader {
    suspend fun devices(runner: CommandRunner): List<ConnectedDevice> = Parsers.devices(runner.run(HostCommand.ListDevices()).output)

    suspend fun snapshot(device: ConnectedDevice, runner: CommandRunner): DeviceSnapshot {
        val serial = device.serial
        val properties = runner.run(HostCommand.ReadProperties(serial))
        if (!properties.succeeded) throw IllegalStateException("Couldn’t read ${device.model ?: serial}: ${properties.output.trim().take(200)}")
        return DeviceSnapshot.from(
            device = device,
            properties = Parsers.properties(properties.output),
            features = Parsers.features(runner.run(HostCommand.ListFeatures(serial)).output),
            installed = Parsers.packages(runner.run(HostCommand.ListPackages(serial)).output),
            disabled = Parsers.packages(runner.run(HostCommand.ListPackages(serial, disabledOnly = true)).output),
            screenSize = Parsers.screenSize(runner.run(HostCommand.ReadScreenSize(serial)).output),
            memoryMb = Parsers.memoryTotalMb(runner.run(HostCommand.ReadMemory(serial)).output),
            homeActivity = Parsers.homeActivity(runner.run(HostCommand.ResolveHome(serial)).output),
        )
    }
}
