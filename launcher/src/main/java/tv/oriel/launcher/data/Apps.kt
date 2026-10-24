package tv.oriel.launcher.data

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.os.Build
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.core.graphics.drawable.toBitmap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** An app that can be opened from a home screen. `key` is "package/activity". */
data class AppEntry(
    val key: String,
    val packageName: String,
    val activityName: String,
    val label: String,
    /** True for apps made for TV (they declare a TV launcher entry), false for phone apps. */
    val isTvApp: Boolean,
)

/** A TV banner (16:9), or an app icon when the app has no banner. */
data class AppArtwork(val image: ImageBitmap, val isBanner: Boolean)

/**
 * Finds and opens launchable apps through the platform's own APIs. It reads only what any home screen
 * can see and never touches other apps' data (PRD section 6.2).
 */
class AppRepository(private val context: Context) {
    private val packageManager = context.packageManager

    suspend fun loadApps(): List<AppEntry> = withContext(Dispatchers.IO) {
        val entries = LinkedHashMap<String, AppEntry>()
        val sources = query(Intent.CATEGORY_LEANBACK_LAUNCHER).map { it to true } + query(Intent.CATEGORY_LAUNCHER).map { it to false }
        for ((info, isTvApp) in sources) {
            val activity = info.activityInfo ?: continue
            if (activity.packageName == context.packageName) continue
            val key = "${activity.packageName}/${activity.name}"
            if (key in entries) continue
            val label = info.loadLabel(packageManager).toString().trim().ifEmpty { activity.packageName }
            entries[key] = AppEntry(key, activity.packageName, activity.name, label, isTvApp)
        }
        // An app with both a TV and a phone entry appears once, as its TV app.
        entries.values.groupBy { it.packageName }.values.flatMap { group -> group.filter { it.isTvApp }.ifEmpty { group } }
    }

    fun launchIntent(app: AppEntry): Intent =
        Intent(Intent.ACTION_MAIN)
            .addCategory(if (app.isTvApp) Intent.CATEGORY_LEANBACK_LAUNCHER else Intent.CATEGORY_LAUNCHER)
            .setComponent(ComponentName(app.packageName, app.activityName))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)

    suspend fun loadArtwork(app: AppEntry): AppArtwork? = withContext(Dispatchers.IO) {
        runCatching {
            val info = activityInfo(ComponentName(app.packageName, app.activityName))
            val banner = info.loadBanner(packageManager) ?: info.applicationInfo.loadBanner(packageManager)
            if (banner != null) {
                AppArtwork(banner.toBitmap(BANNER_WIDTH, BANNER_HEIGHT).asImageBitmap(), isBanner = true)
            } else {
                AppArtwork(info.loadIcon(packageManager).toBitmap(ICON_SIZE, ICON_SIZE).asImageBitmap(), isBanner = false)
            }
        }.getOrNull()
    }

    private fun query(category: String): List<ResolveInfo> {
        val intent = Intent(Intent.ACTION_MAIN).addCategory(category)
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.queryIntentActivities(intent, PackageManager.ResolveInfoFlags.of(0))
        } else {
            @Suppress("DEPRECATION")
            packageManager.queryIntentActivities(intent, 0)
        }
    }

    private fun activityInfo(component: ComponentName): ActivityInfo =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.getActivityInfo(component, PackageManager.ComponentInfoFlags.of(0))
        } else {
            @Suppress("DEPRECATION")
            packageManager.getActivityInfo(component, 0)
        }

    private companion object {
        const val BANNER_WIDTH = 320
        const val BANNER_HEIGHT = 180
        const val ICON_SIZE = 144
    }
}
