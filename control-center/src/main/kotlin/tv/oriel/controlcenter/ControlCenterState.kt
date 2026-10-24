package tv.oriel.controlcenter

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption
import java.time.Instant
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import tv.oriel.device.BackupCodec
import tv.oriel.device.CommandRunner
import tv.oriel.device.ConnectedDevice
import tv.oriel.device.DeviceReader
import tv.oriel.device.DeviceSnapshot
import tv.oriel.device.ExecutionResult
import tv.oriel.device.HostCommand
import tv.oriel.device.InvalidArgumentException
import tv.oriel.device.InvalidBackupException
import tv.oriel.device.OperationExecutor
import tv.oriel.device.OperationOption
import tv.oriel.device.OperationPlan
import tv.oriel.device.OperationPlanner

/** One finished operation. It names the device by model only; no serial numbers are stored (PRD section 7.3). */
@Serializable
data class HistoryEntry(val timestamp: String, val deviceModel: String, val operation: String, val outcome: String)

/** The operation history, kept on this computer as one JSON object per line. */
class HistoryStore(private val file: Path = Path.of(System.getProperty("user.home"), ".oriel", "control-center", "history.jsonl")) {
    private val json = Json { ignoreUnknownKeys = true }

    fun load(): List<HistoryEntry> = runCatching {
        if (!Files.exists(file)) return emptyList()
        Files.readAllLines(file).mapNotNull { line -> runCatching { json.decodeFromString(HistoryEntry.serializer(), line) }.getOrNull() }.takeLast(200)
    }.getOrDefault(emptyList())

    fun append(entry: HistoryEntry) {
        runCatching {
            Files.createDirectories(file.parent)
            Files.writeString(file, json.encodeToString(HistoryEntry.serializer(), entry) + "\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND)
        }
    }
}

/** Everything the Control Center window shows, and the actions it can take. */
class ControlCenterState(
    private val runner: CommandRunner?,
    private val scope: CoroutineScope,
    private val history: HistoryStore = HistoryStore(),
) {
    var devices by mutableStateOf<List<ConnectedDevice>>(emptyList())
        private set
    var selected by mutableStateOf<ConnectedDevice?>(null)
        private set
    var snapshot by mutableStateOf<DeviceSnapshot?>(null)
        private set
    var busy by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
    var notice by mutableStateOf<String?>(null)
    var apk by mutableStateOf(defaultApk())
    var review by mutableStateOf<OperationPlan?>(null)
        private set
    var result by mutableStateOf<ExecutionResult?>(null)
        private set
    var entries by mutableStateOf(history.load())
        private set
    var showLicenses by mutableStateOf(false)

    val adbMissing: Boolean get() = runner == null

    val options: List<OperationOption>
        get() = snapshot?.let { OperationPlanner.options(it, apk) } ?: emptyList()

    fun refreshDevices() = act {
        devices = DeviceReader.devices(requireRunner())
        selected?.let { current -> if (devices.none { it.serial == current.serial }) clearSelection() }
    }

    fun connect(host: String) = act {
        val result = requireRunner().run(HostCommand.Connect(host))
        if (result.succeeded) notice = "Connected to ${host.trim()}. Accept the prompt on the TV if it asks." else error = result.output.trim().ifEmpty { "Couldn’t connect." }
        devices = DeviceReader.devices(requireRunner())
    }

    fun select(device: ConnectedDevice) = act {
        selected = device
        snapshot = null
        closeReview()
        if (!device.isReady) {
            error = "This device is “${device.state}”. Allow debugging on the TV, then refresh."
            return@act
        }
        snapshot = DeviceReader.snapshot(device, requireRunner())
    }

    fun review(plan: OperationPlan) {
        review = plan
        result = null
    }

    fun closeReview() {
        review = null
        result = null
    }

    /** Runs only the plan the person reviewed and confirmed, then re-reads the device to show its new state. */
    fun runReviewed() = act {
        val plan = review ?: return@act
        val device = snapshot ?: return@act
        val outcome = OperationExecutor.execute(plan, requireRunner())
        result = outcome
        history.append(
            HistoryEntry(
                timestamp = Instant.now().toString(),
                deviceModel = device.label,
                operation = plan.title,
                outcome = if (outcome is ExecutionResult.Succeeded) "Succeeded" else "Failed after ${outcome.completed.size} of ${plan.steps.size} steps",
            ),
        )
        entries = history.load()
        selected?.let { snapshot = DeviceReader.snapshot(it, requireRunner()) }
    }

    fun exportBackup(file: Path) = act {
        val device = snapshot ?: return@act
        Files.writeString(file, BackupCodec.encode(BackupCodec.create(device)))
        history.append(HistoryEntry(Instant.now().toString(), device.label, "Export backup", "Saved"))
        entries = history.load()
        notice = "Backup saved to $file."
    }

    fun reviewRestore(file: Path) = act {
        val device = snapshot ?: return@act
        val backup = BackupCodec.decode(Files.readString(file))
        when (val option = OperationPlanner.restore(device, backup)) {
            is OperationOption.Available -> review(option.plan)
            is OperationOption.Unavailable -> notice = option.reason
        }
    }

    private fun clearSelection() {
        selected = null
        snapshot = null
        closeReview()
    }

    private fun requireRunner(): CommandRunner = runner ?: throw IllegalStateException("adb wasn’t found.")

    private fun act(block: suspend () -> Unit) {
        scope.launch {
            busy = true
            error = null
            try {
                block()
            } catch (failure: InvalidArgumentException) {
                error = failure.message
            } catch (failure: InvalidBackupException) {
                error = failure.message
            } catch (failure: Exception) {
                error = failure.message ?: "Something went wrong."
            } finally {
                busy = false
            }
        }
    }

    private companion object {
        fun defaultApk(): Path? = listOf(
            Path.of("..", "launcher", "build", "outputs", "apk", "debug", "launcher-debug.apk"),
            Path.of("launcher", "build", "outputs", "apk", "debug", "launcher-debug.apk"),
        ).firstOrNull { Files.isRegularFile(it) }?.toAbsolutePath()?.normalize()
    }
}
