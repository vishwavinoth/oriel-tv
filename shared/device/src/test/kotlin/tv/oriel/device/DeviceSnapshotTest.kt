package tv.oriel.device

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class DeviceSnapshotTest {
    @Test
    fun `devices output parses USB and network devices and skips noise`() {
        val output = """
            * daemon started successfully
            List of devices attached
            emulator-5554          device product:sdk_google_atv model:Android_TV transport_id:1
            192.168.1.50:5555      unauthorized transport_id:2

        """.trimIndent()
        val devices = Parsers.devices(output)
        assertEquals(listOf("emulator-5554", "192.168.1.50:5555"), devices.map { it.serial })
        assertEquals("Android TV", devices[0].model)
        assertTrue(devices[0].isReady)
        assertTrue(devices[1].isNetwork)
        assertEquals(false, devices[1].isReady)
    }

    @Test
    fun `properties, packages, features, screen, memory, and home parse`() {
        val props = Parsers.properties("[ro.product.model]: [Chromecast]\n[ro.build.version.sdk]: [34]\nnot a property")
        assertEquals(mapOf("ro.product.model" to "Chromecast", "ro.build.version.sdk" to "34"), props)
        assertEquals(setOf("com.example.a", "com.example.b"), Parsers.packages("package:com.example.a\npackage:com.example.b\npackage:bad name\n"))
        assertEquals(setOf("android.software.leanback", "android.hardware.wifi"), Parsers.features("feature:android.software.leanback\nfeature:android.hardware.wifi=1"))
        assertEquals("1920x1080", Parsers.screenSize("Physical size: 3840x2160\nOverride size: 1920x1080"))
        assertEquals(1967, Parsers.memoryTotalMb("MemTotal:        2014932 kB\nMemFree: 1 kB"))
        assertEquals(
            "com.google.android.apps.tv.launcherx/.home.HomeActivity",
            Parsers.homeActivity("priority=0 preferredOrder=0\ncom.google.android.apps.tv.launcherx/.home.HomeActivity"),
        )
        assertNull(Parsers.homeActivity("No activity found"))
    }

    @Test
    fun `platform detection tells Google TV, Android TV, Fire TV, and other devices apart`() {
        assertEquals(Platform.FireTv, DeviceSnapshot.detectPlatform("Amazon", setOf("android.software.leanback"), emptySet()))
        assertEquals(Platform.GoogleTv, DeviceSnapshot.detectPlatform("Google", emptySet(), setOf("com.google.android.apps.tv.launcherx")))
        assertEquals(Platform.AndroidTv, DeviceSnapshot.detectPlatform("Sony", setOf("android.software.leanback"), emptySet()))
        assertEquals(Platform.OtherAndroid, DeviceSnapshot.detectPlatform("Google", emptySet(), emptySet()))
    }

    @Test
    fun `snapshots leave out the serial number property and warn about network debugging`() {
        val snapshot = sampleDevice(network = true)
        assertTrue(snapshot.warnings.any { it.contains("isn’t encrypted") })
        assertEquals("Google Chromecast HD", snapshot.label)
        assertTrue(DeviceSnapshot::class.java.declaredFields.none { it.name.contains("serialNumber", ignoreCase = true) })
    }

    companion object {
        fun sampleDevice(
            network: Boolean = false,
            installed: Set<String> = setOf("com.google.android.apps.tv.launcherx", "com.example.tv"),
            disabled: Set<String> = emptySet(),
            home: String? = "com.google.android.apps.tv.launcherx/.home.HomeActivity",
            manufacturer: String = "Google",
            sdk: String = "34",
        ): DeviceSnapshot = DeviceSnapshot.from(
            device = ConnectedDevice(if (network) "192.168.1.50:5555" else "emulator-5554", "device", "Chromecast_HD"),
            properties = mapOf(
                "ro.product.model" to "Chromecast HD",
                "ro.product.manufacturer" to manufacturer,
                "ro.build.version.release" to "14",
                "ro.build.version.sdk" to sdk,
                "ro.build.id" to "UTTK.1",
                "ro.serialno" to "SHOULD-NOT-BE-KEPT",
            ),
            features = setOf("android.software.leanback"),
            installed = installed,
            disabled = disabled,
            screenSize = "1920x1080",
            memoryMb = 1967,
            homeActivity = home,
        )
    }
}
