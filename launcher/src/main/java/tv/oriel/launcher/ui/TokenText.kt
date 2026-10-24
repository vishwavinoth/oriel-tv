package tv.oriel.launcher.ui

import android.annotation.SuppressLint
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource

/**
 * The translated name of a design token, such as "accent_amber" or "pack_cinema_description". Tokens are written in
 * English in tokens.json; a new one shows its English text until someone adds strings for it.
 */
@Composable
internal fun tokenText(name: String, fallback: String): String {
    val context = LocalContext.current
    // Looked up by name so new tokens work before they're translated. res/raw/keep.xml stops shrinking from removing them.
    @SuppressLint("DiscouragedApi")
    val id = remember(name) { context.resources.getIdentifier(name, "string", context.packageName) }
    return if (id != 0) stringResource(id) else fallback
}
