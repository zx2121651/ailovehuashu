package com.huashu.android.ime.core

import android.content.Context
import java.io.File

class Rime(fullCheck: Boolean) {

    init {
        // We defer startup to explicit calls
    }

    companion object {
        private var instance: Rime? = null

        @JvmStatic
        fun getInstance(fullCheck: Boolean = false): Rime {
            if (instance == null) instance = Rime(fullCheck)
            return instance!!
        }

        init {
            System.loadLibrary("yuyanime")
        }

        fun startup(context: Context, fullCheck: Boolean) {
            val rimeDir = File(context.filesDir, "rime").absolutePath
            startupRime(context, rimeDir, rimeDir, fullCheck)
        }

        @JvmStatic
        fun destroy() {
            exitRime()
            instance = null
        }

        fun selectSchema(schemaId: String): Boolean {
            return selectRimeSchema(schemaId)
        }

        fun processKey(keycode: Int, mask: Int): Boolean {
            return processRimeKey(keycode, mask)
        }

        fun getContext(): RimeContext? {
            return getRimeContext()
        }

        @JvmStatic
        private external fun startupRime(context: Context, sharedDataDir: String, userDataDir: String, fullCheck: Boolean)

        @JvmStatic
        private external fun exitRime()

        @JvmStatic
        private external fun selectRimeSchema(schemaId: String): Boolean

        @JvmStatic
        private external fun processRimeKey(keycode: Int, mask: Int): Boolean

        @JvmStatic
        private external fun getRimeContext(): RimeContext?
    }
}

data class RimeContext(
    val composition: String?,
    val candidates: List<CandidateListItem>?
)

data class CandidateListItem(
    val text: String,
    val comment: String?
)
