package com.huashu.keyboard

import android.content.Context
import android.inputmethodservice.InputMethodService
import android.view.View
import android.widget.LinearLayout
import android.widget.Button
import android.widget.TextView
import android.widget.ScrollView
import android.widget.HorizontalScrollView
import android.graphics.Color
import android.view.ViewGroup
import android.view.Gravity
import android.view.inputmethod.InputMethodManager

/**
 * 恋爱话术 - 搭载极简中文拼音引擎的双模键盘
 */
class HuashuIME : InputMethodService() {

    private lateinit var rootLayout: LinearLayout
    private lateinit var contentContainer: LinearLayout
    private var isTypingMode = false

    // 中文拼音打字引擎相关状态
    private var currentPinyinBuffer = StringBuilder()
    private lateinit var composingView: TextView
    private lateinit var candidateLayout: LinearLayout
    private lateinit var candidateScroll: HorizontalScrollView

    private val dp2px = { dp: Int -> (dp * resources.displayMetrics.density).toInt() }

    // 极简拼音词库 (MVP级映射)
    private val pinyinDict = mapOf(
        "wo" to listOf("我", "握", "卧"),
        "ni" to listOf("你", "泥", "拟"),
        "ta" to listOf("他", "她", "它", "踏"),
        "ai" to listOf("爱", "哎", "唉"),
        "shi" to listOf("是", "事", "时", "十", "实"),
        "bu" to listOf("不", "步", "布"),
        "hao" to listOf("好", "号", "毫"),
        "nihao" to listOf("你好", "泥好"),
        "zai" to listOf("在", "再", "灾"),
        "ganma" to listOf("干嘛", "赶马"),
        "ma" to listOf("吗", "妈", "马", "码"),
        "ba" to listOf("吧", "把", "爸"),
        "xihuan" to listOf("喜欢"),
        "wanshang" to listOf("晚上", "玩赏"),
        "wanan" to listOf("晚安")
    )

    override fun onCreateInputView(): View {
        rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#F4F4F6"))
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(320))
        }

        // 工具栏
        val topBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(Color.parseColor("#FFFFFF"))
            setPadding(dp2px(8), dp2px(4), dp2px(8), dp2px(4))
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(44))
        }

        val modeSwitchBtn = Button(this).apply {
            text = "⌨️ 话术 / 中文打字"
            textSize = 14f
            setTextColor(Color.parseColor("#DB2777"))
            setBackgroundColor(Color.TRANSPARENT)
            setOnClickListener {
                isTypingMode = !isTypingMode
                resetPinyinState()
                renderContent()
            }
        }
        topBar.addView(modeSwitchBtn)
        rootLayout.addView(topBar)

        contentContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
        }
        rootLayout.addView(contentContainer)

        renderContent()
        return rootLayout
    }

    private fun renderContent() {
        contentContainer.removeAllViews()
        if (isTypingMode) {
            contentContainer.addView(createPinyinKeyboard())
        } else {
            contentContainer.addView(createScriptPanel())
        }
    }

    /** 话术辅助面板 */
    private fun createScriptPanel(): View {
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }
        // ... (此处为保持篇幅精简，话术版面与此前相同) ...
        val hint = TextView(this).apply {
            text = "【这里是点击一键上屏的恋爱话术库】\n点击上方切回中文打字..."
            setPadding(dp2px(20), dp2px(40), dp2px(20), dp2px(20))
            textSize = 16f
            gravity = Gravity.CENTER
            setTextColor(Color.GRAY)
        }
        panel.addView(hint)
        return panel
    }

    /**
     * 生成真正的拼音中文键盘
     */
    private fun createPinyinKeyboard(): View {
        val keyboardLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#D1D5DB"))
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }

        // ================= 拼音输入显示区 & 候选词条区 =================
        val pinyinArea = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#FFFFFF"))
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }

        // 1. 显示当前敲打的英文字母拼音 (Composing Text)
        composingView = TextView(this).apply {
            textSize = 18f
            setTextColor(Color.parseColor("#DB2777"))
            setPadding(dp2px(12), dp2px(4), dp2px(12), dp2px(0))
            visibility = View.GONE
        }
        pinyinArea.addView(composingView)

        // 2. 显示匹配出的中文候选词列表 (横向滚动)
        candidateScroll = HorizontalScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(44))
            isHorizontalScrollBarEnabled = false
            visibility = View.GONE
        }
        candidateLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp2px(8), 0, dp2px(8), 0)
        }
        candidateScroll.addView(candidateLayout)
        pinyinArea.addView(candidateScroll)

        keyboardLayout.addView(pinyinArea)

        // ================= 26键面板区 =================
        val rows = listOf(
            listOf("q", "w", "e", "r", "t", "y", "u", "i", "o", "p"),
            listOf("a", "s", "d", "f", "g", "h", "j", "k", "l"),
            listOf("z", "x", "c", "v", "b", "n", "m", "⌫"),
            listOf("?", ",", "空格", ".", "发送")
        )

        for (rowKeys in rows) {
            val rowLayout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
            }
            for (key in rowKeys) {
                val keyBtn = Button(this).apply {
                    text = key; textSize = 18f; isAllCaps = false
                    setTextColor(Color.BLACK)
                    setBackgroundColor(if (key == "⌫" || key == "发送" || key == "空格") Color.parseColor("#9CA3AF") else Color.WHITE)
                    val weight = if (key == "空格") 3f else if (key == "⌫" || key == "发送") 1.5f else 1f
                    layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, weight).apply {
                        setMargins(dp2px(3), dp2px(4), dp2px(3), dp2px(4))
                    }

                    setOnClickListener {
                        handleKeyPress(key)
                    }
                }
                rowLayout.addView(keyBtn)
            }
            keyboardLayout.addView(rowLayout)
        }
        return keyboardLayout
    }

    /** 处理键盘敲击逻辑 (核心中文引擎) */
    private fun handleKeyPress(key: String) {
        val conn = currentInputConnection ?: return

        when (key) {
            "⌫" -> {
                if (currentPinyinBuffer.isNotEmpty()) {
                    // 如果正在打拼音，退格只删拼音字母
                    currentPinyinBuffer.deleteCharAt(currentPinyinBuffer.length - 1)
                    updatePinyinUI()
                } else {
                    // 如果没有拼音缓存，则删除输入框里的字
                    conn.deleteSurroundingText(1, 0)
                }
            }
            "空格" -> {
                if (currentPinyinBuffer.isNotEmpty()) {
                    // 按空格默认上屏第一个候选中文词
                    val firstCandidate = getCandidates(currentPinyinBuffer.toString()).firstOrNull()
                    if (firstCandidate != null) {
                        commitChineseWord(firstCandidate)
                    } else {
                        // 如果词库里没找到，就直接把英文发上去
                        commitChineseWord(currentPinyinBuffer.toString())
                    }
                } else {
                    conn.commitText(" ", 1)
                }
            }
            "发送" -> {
                if (currentPinyinBuffer.isNotEmpty()) commitChineseWord(currentPinyinBuffer.toString())
                conn.performEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_SEND)
                conn.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, android.view.KeyEvent.KEYCODE_ENTER))
                conn.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_UP, android.view.KeyEvent.KEYCODE_ENTER))
            }
            "?", ",", "." -> {
                if (currentPinyinBuffer.isNotEmpty()) commitChineseWord(currentPinyinBuffer.toString())
                val symbol = if (key == "?") "？" else if (key == ",") "，" else "。" // 中文符号转换
                conn.commitText(symbol, 1)
            }
            else -> {
                // 输入字母 (a-z)
                currentPinyinBuffer.append(key)
                updatePinyinUI()
            }
        }
    }

    /** 刷新拼音和候选词 UI */
    private fun updatePinyinUI() {
        val pinyinStr = currentPinyinBuffer.toString()
        if (pinyinStr.isEmpty()) {
            resetPinyinState()
            return
        }

        // 1. 显示当前正在敲的英文字母
        composingView.visibility = View.VISIBLE
        composingView.text = pinyinStr
        // 通知底层的应用当前正在组词中（出现下划线）
        currentInputConnection?.setComposingText(pinyinStr, 1)

        // 2. 查找中文候选词
        candidateLayout.removeAllViews()
        candidateScroll.visibility = View.VISIBLE

        val candidates = getCandidates(pinyinStr)

        if (candidates.isEmpty()) {
            // 如果词库没有，默认给出一个纯英文的选项
            addCandidateButton(pinyinStr)
        } else {
            // 将查找到的中文词填充到候选栏
            for (word in candidates) {
                addCandidateButton(word)
            }
        }
    }

    /** 添加单个中文候选词按钮 */
    private fun addCandidateButton(word: String) {
        val btn = Button(this).apply {
            text = word
            textSize = 18f
            setTextColor(Color.parseColor("#333333"))
            setBackgroundColor(Color.TRANSPARENT)
            setPadding(dp2px(16), 0, dp2px(16), 0)

            setOnClickListener {
                commitChineseWord(word)
            }
        }
        candidateLayout.addView(btn)
    }

    /** 提交中文上屏，并重置缓存 */
    private fun commitChineseWord(word: String) {
        currentInputConnection?.commitText(word, 1)
        resetPinyinState()
    }

    /** 重置打字引擎状态 */
    private fun resetPinyinState() {
        currentPinyinBuffer.clear()
        if (this::composingView.isInitialized) {
            composingView.visibility = View.GONE
            candidateScroll.visibility = View.GONE
            candidateLayout.removeAllViews()
        }
        currentInputConnection?.finishComposingText()
    }

    /** 极简词库匹配算法 (优先全拼，无全拼匹配前缀) */
    private fun getCandidates(pinyin: String): List<String> {
        val exactMatch = pinyinDict[pinyin]
        if (exactMatch != null) return exactMatch

        val prefixMatch = mutableListOf<String>()
        for ((key, words) in pinyinDict) {
            if (key.startsWith(pinyin)) {
                prefixMatch.addAll(words)
            }
        }
        // 返回前缀匹配的前 10 个词
        return prefixMatch.take(10).distinct()
    }
}
