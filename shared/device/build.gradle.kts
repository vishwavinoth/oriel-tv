import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// The device-safety core shared by Control Center (ADR 0006): the command allowlist, validation, device
// parsing, operation plans, execution, and backups. Plain Kotlin, so it's tested without a device.
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
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
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.core)

    testImplementation(kotlin("test-junit"))
    testImplementation(libs.kotlinx.coroutines.test)
}
