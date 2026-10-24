package tv.oriel.launcher.system

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged

enum class Connection { Wifi, Ethernet, Other, Offline }

/**
 * Which kind of connection the TV is using, for the status in the top row. It only reads the connection type, with
 * ACCESS_NETWORK_STATE; Oriel still has no INTERNET permission and can't send anything (PRIVACY.md).
 */
class ConnectionMonitor(context: Context) {
    private val manager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager?

    @Suppress("DEPRECATION")
    fun current(): Connection {
        val manager = manager ?: return Connection.Offline
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val capabilities = manager.getNetworkCapabilities(manager.activeNetwork) ?: return Connection.Offline
            return when {
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> Connection.Ethernet
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> Connection.Wifi
                else -> Connection.Other
            }
        }
        val info = manager.activeNetworkInfo?.takeIf { it.isConnected } ?: return Connection.Offline
        return when (info.type) {
            ConnectivityManager.TYPE_ETHERNET -> Connection.Ethernet
            ConnectivityManager.TYPE_WIFI -> Connection.Wifi
            else -> Connection.Other
        }
    }

    /** The current connection, then every change to it, for as long as it's collected. */
    fun changes(): Flow<Connection> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(current())
            }

            override fun onLost(network: Network) {
                trySend(current())
            }

            override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) {
                trySend(current())
            }
        }
        trySend(current())
        val registered = runCatching { manager?.registerNetworkCallback(NetworkRequest.Builder().build(), callback) }.isSuccess
        awaitClose { if (registered) runCatching { manager?.unregisterNetworkCallback(callback) } }
    }.distinctUntilChanged()
}
