package tv.oriel.controlcenter

import kotlin.test.Test
import kotlin.test.assertTrue

class LicensesTest {
    @Test
    fun `the bundled license list covers the app's libraries, all under allowed licenses`() {
        val libraries = OpenSourceLicenses.load()
        assertTrue(libraries.any { it.coordinates.startsWith("org.jetbrains.kotlin:kotlin-stdlib:") }, "kotlin-stdlib is missing")
        assertTrue(libraries.any { it.coordinates.startsWith("org.jetbrains.compose.") }, "Compose is missing")
        val allowed = setOf("Apache-2.0", "MIT", "BSD-2-Clause", "BSD-3-Clause")
        assertTrue(libraries.all { library -> library.spdxLicenses.any { it.identifier in allowed } })
    }
}
