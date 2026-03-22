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

        // Initialize LibPinyin-Android-2026 decoder here
        // PinyinDecoder.init(this)
    }

    override fun onCreateInputView(): View {
        val composeView = ComposeView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )

            // Set up Compose required ViewTree owners
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

        // Ensure lifecycle is started when view is created
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)

        return composeView
    }

    override fun onDestroy() {
        super.onDestroy()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        store.clear()

        // Cleanup LibPinyin-Android-2026 decoder here
        // PinyinDecoder.release()
    }
}
