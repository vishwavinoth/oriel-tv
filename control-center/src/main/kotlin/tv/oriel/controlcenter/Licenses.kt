package tv.oriel.controlcenter

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class SpdxLicense(val identifier: String, val name: String = identifier)

@Serializable
data class UnknownLicense(val name: String? = null, val url: String? = null)

@Serializable
data class LicensedLibrary(
    val groupId: String,
    val artifactId: String,
    val version: String,
    val name: String? = null,
    val spdxLicenses: List<SpdxLicense> = emptyList(),
    val unknownLicenses: List<UnknownLicense> = emptyList(),
) {
    val coordinates: String get() = "$groupId:$artifactId:$version"
    val displayName: String get() = name?.takeIf(String::isNotBlank) ?: "$groupId:$artifactId"
    val licenses: List<String> get() = spdxLicenses.map { it.name } + unknownLicenses.mapNotNull { it.name ?: it.url }
}

/** The libraries inside Control Center, as Licensee verified them when it was built (PRD section 9.2, rule 4). */
object OpenSourceLicenses {
    private val json = Json { ignoreUnknownKeys = true }

    fun load(): List<LicensedLibrary> = runCatching {
        val text = OpenSourceLicenses::class.java.getResourceAsStream("/open-source-licenses.json")?.bufferedReader()?.use { it.readText() }
        text?.let { json.decodeFromString<List<LicensedLibrary>>(it) }.orEmpty().sortedBy { it.displayName.lowercase() }
    }.getOrDefault(emptyList())
}
