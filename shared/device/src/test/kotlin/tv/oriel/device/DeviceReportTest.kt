package tv.oriel.device

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import tv.oriel.device.DeviceSnapshotTest.Companion.sampleDevice

class DeviceReportTest {
    @Test
    fun `report describes the device without its address, serial number, or app list`() {
        val report = DeviceReport.text(
            sampleDevice(network = true, disabled = setOf("com.google.android.apps.tv.launcherx", "com.example.tv")),
        )
        assertTrue("Google Chromecast HD" in report)
        assertTrue("Android: 14 (API 34), build UTTK.1" in report)
        assertTrue("Connection: network debugging" in report)
        assertTrue("com.google.android.apps.tv.launcherx (off)" in report)
        assertTrue("Apps turned off: 2" in report)
        assertTrue("isn’t encrypted" in report)
        assertFalse("192.168.1.50" in report)
        assertFalse("SHOULD-NOT-BE-KEPT" in report)
        assertFalse("com.example.tv" in report)
    }

    @Test
    fun `version name parses from dumpsys output`() {
        assertEquals("0.1.0-dev", Parsers.versionName("  versionCode=1 minSdk=26\n    versionName=0.1.0-dev\n    versionName=9"))
        assertNull(Parsers.versionName("Unable to find package"))
    }
}
