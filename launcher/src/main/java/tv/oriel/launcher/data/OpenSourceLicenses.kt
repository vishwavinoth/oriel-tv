package tv.oriel.launcher.data

import android.content.Context
import org.json.JSONArray

data class OssLibrary(val name: String, val coordinates: String, val licenses: List<String>)

/**
 * The libraries inside Oriel and their licenses. Licensee checks every dependency against the allowed licenses when
 * the app is built and bundles this list, so the screen always matches the build (PRD section 9.2, rule 4).
 */
object OpenSourceLicenses {
    private const val ASSET = "app/cash/licensee/artifacts.json"

    fun load(context: Context): List<OssLibrary> = runCatching {
        val array = JSONArray(context.assets.open(ASSET).bufferedReader().use { it.readText() })
        List(array.length()) { index ->
            val item = array.getJSONObject(index)
            val coordinates = "${item.getString("groupId")}:${item.getString("artifactId")}:${item.getString("version")}"
            val licenses = buildList {
                item.optJSONArray("spdxLicenses")?.let { spdx -> for (i in 0 until spdx.length()) add(spdx.getJSONObject(i).optString("name")) }
                item.optJSONArray("unknownLicenses")?.let { other -> for (i in 0 until other.length()) add(other.getJSONObject(i).optString("url")) }
            }.filter(String::isNotBlank)
            OssLibrary(name = item.optString("name").ifBlank { coordinates }, coordinates = coordinates, licenses = licenses)
        }.sortedBy { it.name.lowercase() }
    }.getOrDefault(emptyList())
}
