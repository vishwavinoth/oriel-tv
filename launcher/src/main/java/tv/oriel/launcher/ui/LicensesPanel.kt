package tv.oriel.launcher.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.tv.material3.Text
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import tv.oriel.launcher.R
import tv.oriel.launcher.data.OpenSourceLicenses
import tv.oriel.launcher.data.OssLibrary
import tv.oriel.launcher.ui.theme.LocalOrielColors
import tv.oriel.launcher.ui.theme.OrielTokens
import tv.oriel.launcher.ui.theme.OrielType

/** The libraries Oriel is built with and their licenses. Each row takes focus, so the D-pad scrolls the list. */
@Composable
fun LicensesPanel(onClose: () -> Unit) {
    val colors = LocalOrielColors.current
    val context = LocalContext.current
    val first = remember { FocusRequester() }
    val libraries by produceState<List<OssLibrary>?>(null) { value = withContext(Dispatchers.IO) { OpenSourceLicenses.load(context) } }

    OrielDialog(onDismiss = onClose) {
        GlassSurface(
            shape = RoundedCornerShape(OrielTokens.Radius.Xl),
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(24.dp)
                .width(560.dp)
                .fillMaxHeight(),
        ) {
            LazyColumn(
                contentPadding = PaddingValues(28.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxSize(),
            ) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                        Text(stringResource(R.string.settings_licenses), style = OrielType.Headline, color = colors.textPrimary)
                        Text(stringResource(R.string.settings_close_hint), style = OrielType.Caption, color = colors.textSecondary)
                    }
                }
                item {
                    Text(
                        stringResource(R.string.licenses_intro),
                        style = OrielType.Body,
                        color = colors.textSecondary,
                        modifier = Modifier.padding(vertical = 8.dp),
                    )
                }
                val list = libraries
                when {
                    list == null -> Unit
                    list.isEmpty() -> item { Text(stringResource(R.string.licenses_missing), style = OrielType.Body, color = colors.textSecondary) }
                    else -> itemsIndexed(list, key = { _, library -> library.coordinates }) { index, library ->
                        PanelControl(
                            onClick = {},
                            shape = RoundedCornerShape(OrielTokens.Radius.Md),
                            container = colors.textPrimary.copy(alpha = 0f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .then(if (index == 0) Modifier.focusRequester(first) else Modifier),
                        ) {
                            Column(Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                                Text(library.name, style = OrielType.Body, color = colors.textPrimary)
                                Text(
                                    "${library.licenses.joinToString()} · ${library.coordinates}",
                                    style = OrielType.Caption,
                                    color = colors.textSecondary,
                                )
                            }
                        }
                    }
                }
            }
        }
        LaunchedEffect(libraries) { if (!libraries.isNullOrEmpty()) runCatching { first.requestFocus() } }
    }
}
