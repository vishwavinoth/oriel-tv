package tv.oriel.launcher.home

import androidx.compose.runtime.mutableStateMapOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import tv.oriel.launcher.data.AppArtwork
import tv.oriel.launcher.data.AppEntry
import tv.oriel.launcher.data.AppRepository
import tv.oriel.launcher.prefs.LauncherPreferences
import tv.oriel.launcher.prefs.PreferencesRepository

class HomeViewModel(
    private val apps: AppRepository,
    private val preferencesRepository: PreferencesRepository,
) : ViewModel() {
    private val installed = MutableStateFlow<List<AppEntry>?>(null)
    private val loadingArtwork = mutableSetOf<String>()

    val preferences: StateFlow<LauncherPreferences?> =
        preferencesRepository.preferences.stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val home: StateFlow<HomeModel?> =
        combine(installed, preferencesRepository.preferences) { list, preferences ->
            list?.let { HomeArrangement.arrange(it, preferences) }
        }.stateIn(viewModelScope, SharingStarted.Eagerly, null)

    /** Artwork loads lazily, per tile, off the main thread (PRD section 6.5). */
    val artwork = mutableStateMapOf<String, AppArtwork>()

    /** Called whenever the launcher comes to the front, so installs and removals show up. */
    fun refreshApps() {
        viewModelScope.launch {
            val list = apps.loadApps()
            installed.value = list
            artwork.keys.retainAll(list.map { it.key }.toSet())
            preferencesRepository.update { current ->
                if (current.favoritesInitialized) current
                else current.copy(favorites = HomeArrangement.suggestFavorites(list), favoritesInitialized = true)
            }
        }
    }

    fun loadArtwork(app: AppEntry) {
        if (app.key in artwork || !loadingArtwork.add(app.key)) return
        viewModelScope.launch {
            apps.loadArtwork(app)?.let { artwork[app.key] = it }
            loadingArtwork.remove(app.key)
        }
    }

    fun updatePreferences(transform: (LauncherPreferences) -> LauncherPreferences) {
        viewModelScope.launch { preferencesRepository.update(transform) }
    }

    fun launchIntent(app: AppEntry) = apps.launchIntent(app)
}
