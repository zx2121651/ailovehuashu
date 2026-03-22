package com.huashu.android.ime

import android.inputmethodservice.InputMethodService
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.*
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.huashu.android.ime.core.Rime
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class LovekeyIMEService : InputMethodService(), LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner {

    private val lifecycleRegistry = LifecycleRegistry(this)
    private val store = ViewModelStore()
    private val savedStateRegistryController = SavedStateRegistryController.create(this)

    override val lifecycle: Lifecycle
        get() = lifecycleRegistry

    override val viewModelStore: ViewModelStore
        get() = store

    override val savedStateRegistry: SavedStateRegistry
        get() = savedStateRegistryController.savedStateRegistry

    override fun onCreate() {
        super.onCreate()
        savedStateRegistryController.performRestore(null)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)

        // Copy Rime assets to internal storage so the JNI engine can access them
        copyRimeAssets()

        // Initialize Rime Engine
        try {
            Rime.startup(this, false)
            Rime.selectSchema("pinyin")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun copyRimeAssets() {
        val destDir = File(filesDir, "rime")
        if (!destDir.exists()) destDir.mkdirs()

        try {
            val assetsList = assets.list("rime") ?: return
            for (file in assetsList) {
                val destFile = File(destDir, file)
                if (!destFile.exists()) {
                    var input: InputStream? = null
                    var out: FileOutputStream? = null
                    try {
                        input = assets.open("rime/$file")
                        out = FileOutputStream(destFile)
                        input.copyTo(out)
                    } finally {
                        input?.close()
                        out?.close()
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onCreateInputView(): View {
        val composeView = ComposeView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )

            setViewTreeLifecycleOwner(this@LovekeyIMEService)
            setViewTreeViewModelStoreOwner(this@LovekeyIMEService)
            setViewTreeSavedStateRegistryOwner(this@LovekeyIMEService)

            setContent {
                KeyboardScreen(
                    onCommitText = { text ->
                        currentInputConnection?.commitText(text, 1)
                    },
                    onDelete = {
                        currentInputConnection?.deleteSurroundingText(1, 0)
                    }
                )
            }
        }

        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)

        return composeView
    }

    override fun onDestroy() {
        super.onDestroy()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        store.clear()

        try {
            Rime.destroy()
        } catch (e: Exception) {}
    }
}
