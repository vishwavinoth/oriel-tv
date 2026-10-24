import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// Oriel Control Center: a desktop companion for safe, explained, confirmed device changes (ADR 0006).
// Run it with: ./gradlew :control-center:run
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.compose.multiplatform)
    alias(libs.plugins.licensee)
}

// Every dependency must use a license compatible with Apache-2.0 (PRD section 9.2), or the build fails.
licensee {
    allow("Apache-2.0")
    allow("MIT")
    allow("BSD-2-Clause")
    allow("BSD-3-Clause")
    unusedAction(app.cash.licensee.UnusedAction.IGNORE)
}

// Ships the verified dependency list inside the app for its Open-source licenses view (PRD section 9.2, rule 4).
val bundleLicenses by tasks.registering(Copy::class) {
    from(tasks.named("licensee")) {
        include("artifacts.json")
        rename { "open-source-licenses.json" }
    }
    into(layout.buildDirectory.dir("generated/licenses"))
}

sourceSets.main {
    resources.srcDir(bundleLicenses)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(project(":shared:device"))
    implementation(compose.desktop.currentOs)
    implementation(compose.material3)
    implementation(libs.kotlinx.coroutines.swing)
    implementation(libs.kotlinx.serialization.json)

    testImplementation(kotlin("test-junit"))
    testImplementation(libs.kotlinx.coroutines.test)
}

compose.desktop {
    application {
        mainClass = "tv.oriel.controlcenter.MainKt"
        nativeDistributions {
            // macOS installers need Apple signing and notarization first, so macOS gets a runnable jar (docs/releasing.md).
            targetFormats(TargetFormat.Deb, TargetFormat.Msi)
            packageName = "oriel-control-center"
            packageVersion = "0.1.0"
            description = "Safe, explained changes for Android TV and Google TV"
            vendor = "Oriel TV contributors"
            licenseFile.set(rootProject.file("LICENSE"))
            linux {
                menuGroup = "Utility"
            }
            windows {
                menu = true
                // Fixed, so a newer installer upgrades the installed copy instead of adding a second one.
                upgradeUuid = "a040fbad-1cc7-4779-82fb-cc88dc0f9074"
            }
        }
    }
}
