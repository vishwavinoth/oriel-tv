package tv.oriel.controlcenter

import java.io.File
import java.nio.file.Files
import java.nio.file.Path
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import tv.oriel.device.CommandResult
import tv.oriel.device.CommandRunner
import tv.oriel.device.HostCommand

/** Finds adb from the user's Android platform tools. Control Center never bundles or downloads it. */
object AdbLocator {
    private val executable = if (System.getProperty("os.name").orEmpty().startsWith("Windows")) "adb.exe" else "adb"

    fun find(env: Map<String, String> = System.getenv()): Path? {
        val home = System.getProperty("user.home").orEmpty()
        val candidates = buildList {
            env["ANDROID_HOME"]?.let { add(Path.of(it, "platform-tools", executable)) }
            env["ANDROID_SDK_ROOT"]?.let { add(Path.of(it, "platform-tools", executable)) }
            env["PATH"]?.split(File.pathSeparator)?.forEach { dir -> runCatching { add(Path.of(dir, executable)) } }
            add(Path.of(home, "AppData", "Local", "Android", "Sdk", "platform-tools", executable))
            add(Path.of(home, "Library", "Android", "sdk", "platform-tools", executable))
            add(Path.of(home, "Android", "Sdk", "platform-tools", executable))
        }
        return candidates.firstOrNull { Files.isRegularFile(it) }
    }
}

/**
 * Runs allowlisted commands with adb. Arguments go straight to the program as a list, never through this
 * computer's shell, and every command has a time limit.
 */
class ProcessCommandRunner(private val adb: Path) : CommandRunner {
    override suspend fun run(command: HostCommand): CommandResult = withContext(Dispatchers.IO) {
        val process = ProcessBuilder(listOf(adb.toString()) + command.args).redirectErrorStream(true).start()
        val output = CompletableFuture.supplyAsync { process.inputStream.bufferedReader().use { it.readText() } }
        if (!process.waitFor(command.timeoutSeconds, TimeUnit.SECONDS)) {
            process.destroyForcibly()
            return@withContext CommandResult(-1, output.getNow("").take(MAX_OUTPUT), timedOut = true)
        }
        CommandResult(process.exitValue(), output.get(5, TimeUnit.SECONDS).take(MAX_OUTPUT))
    }

    private companion object {
        const val MAX_OUTPUT = 200_000
    }
}
