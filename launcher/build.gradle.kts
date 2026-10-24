import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.licensee)
}

// Every dependency must use a license compatible with Apache-2.0 (PRD section 9.2), or the build fails. The
// verified list ships inside the app for its Open-source licenses screen (rule 4).
licensee {
    allow("Apache-2.0")
    allow("MIT")
    allow("BSD-2-Clause")
    allow("BSD-3-Clause")
    unusedAction(app.cash.licensee.UnusedAction.IGNORE)
    bundleAndroidAsset.set(true)
}

android {
    namespace = "tv.oriel.launcher"
    compileSdk = 36

    defaultConfig {
        // Provisional until the project secures a matching domain (PRD section 4.1).
        applicationId = "tv.oriel.launcher"
        minSdk = 21
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0-dev"
    }

    // Lists Oriel's languages for Android 13's per-app language setting, from the values-<language> folders.
    androidResources {
        generateLocaleConfig = true
    }

    // Release signing comes only from the environment (the release workflow's secrets), never from the repository.
    val releaseKeystore = System.getenv("ORIEL_KEYSTORE_FILE")
    signingConfigs {
        if (releaseKeystore != null) {
            create("release") {
                storeFile = file(releaseKeystore)
                storePassword = System.getenv("ORIEL_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("ORIEL_KEY_ALIAS")
                keyPassword = System.getenv("ORIEL_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (releaseKeystore != null) signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
    }

    lint {
        abortOnError = true
        checkReleaseBuilds = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.datastore.preferences)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.tv.material)
    debugImplementation(libs.androidx.compose.ui.tooling)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
}
