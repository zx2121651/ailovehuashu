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
import android.widget.Toast
import android.content.Intent

/**
 * 数据模型：话术条目
 */
data class ScriptItem(
    val text: String,
    val isVip: Boolean // 是否属于 VIP 专属话术
)

/**
 * 恋爱话术 - 高级商业化原生键盘 (含 VIP 拦截与异步词库模拟)
 */
class HuashuIME : InputMethodService() {

    private lateinit var rootLayout: LinearLayout
    private lateinit var contentContainer: LinearLayout
    private var isTypingMode = false

    private var currentPinyinBuffer = StringBuilder()
    private lateinit var composingView: TextView
    private lateinit var candidateLayout: LinearLayout
    private lateinit var candidateScroll: HorizontalScrollView

    // 当前用户的状态 (实际开发中，这里需要从本地 SharedPreferences 或网络读取)
    private var currentUserIsVip = false

    private val dp2px = { dp: Int -> (dp * resources.displayMetrics.density).toInt() }

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
            text = "⌨️ 话术库 / 中文键盘"
            textSize = 14f
            setTextColor(Color.parseColor("#DB2777"))
            setBackgroundColor(Color.TRANSPARENT)
            setOnClickListener {
                isTypingMode = !isTypingMode
                resetPinyinState()
                renderContent()
            }
        }

        // 模拟 VIP 状态显示
        val vipStatusBtn = Button(this).apply {
            text = if (currentUserIsVip) "👑 尊贵VIP" else "🚀 开通VIP"
            textSize = 13f
            setTextColor(if (currentUserIsVip) Color.parseColor("#D97706") else Color.GRAY)
            setBackgroundColor(Color.TRANSPARENT)
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
                weight = 1f
                gravity = Gravity.END
            }
            setOnClickListener {
                currentUserIsVip = !currentUserIsVip
                text = if (currentUserIsVip) "👑 尊贵VIP" else "🚀 开通VIP"
                setTextColor(if (currentUserIsVip) Color.parseColor("#D97706") else Color.GRAY)
                Toast.makeText(this@HuashuIME, if (currentUserIsVip) "模拟: 已开通 VIP" else "模拟: VIP 已过期", Toast.LENGTH_SHORT).show()
                renderContent()
            }
        }

        topBar.addView(modeSwitchBtn)
        topBar.addView(vipStatusBtn)
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

        val categoryScroll = HorizontalScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(40))
            setBackgroundColor(Color.parseColor("#FAFAFA"))
            isHorizontalScrollBarEnabled = false
        }
        val categoryLayout = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        listOf("最近使用", "🔥神级破冰", "幽默化解", "暧昧升温").forEach { cat ->
            categoryLayout.addView(Button(this).apply {
                text = cat; textSize = 13f; setBackgroundColor(Color.TRANSPARENT)
            })
        }
        categoryScroll.addView(categoryLayout)

        val contentScroll = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
            setPadding(dp2px(12), dp2px(8), dp2px(12), dp2px(8))
        }
        val listLayout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }

        // 【商业增强】：区分普通话术和 VIP 话术
        val mockScripts = listOf(
            ScriptItem("刚吃完饭，正在思考宇宙的终极奥秘，顺便想想你。", false),
            ScriptItem("不知道聊什么？那我教你一个魔法，只要你盯着屏幕看三秒，我就会出现。", true), // VIP专属
            ScriptItem("摸摸头，辛苦啦。今晚的月亮很温柔，早点休息。", false),
            ScriptItem("本来以为只是图你长得好看，后来发现你还挺有趣的，这下亏大了。", true)  // VIP专属
        )

        for (scriptItem in mockScripts) {
            val isLocked = scriptItem.isVip && !currentUserIsVip

            val scriptBtn = Button(this).apply {
                // 如果被锁定，展示马赛克/模糊处理的文字效果，或者前缀提示
                text = if (isLocked) "👑 [VIP解锁] ${scriptItem.text.take(6)}......" else scriptItem.text
                textSize = 15f; isAllCaps = false
                gravity = Gravity.LEFT or Gravity.CENTER_VERTICAL
                setTextColor(if (isLocked) Color.parseColor("#9CA3AF") else Color.parseColor("#333333"))
                setBackgroundColor(Color.WHITE)
                setPadding(dp2px(16), dp2px(12), dp2px(16), dp2px(12))
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { setMargins(0, 0, 0, dp2px(8)) }

                setOnClickListener {
                    if (isLocked) {
                        // 【商业增强】：拦截并引流回主 App 购买
                        Toast.makeText(this@HuashuIME, "该话术需 VIP 解锁，请打开恋爱话术App充值", Toast.LENGTH_LONG).show()
                        // 真实场景可直接跳回 App：
                        // val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                        // startActivity(launchIntent)
                    } else {
                        currentInputConnection?.commitText(scriptItem.text, 1)
                    }
                }
            }
            listLayout.addView(scriptBtn)
        }
        contentScroll.addView(listLayout)

        val bottomBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(50))
            setBackgroundColor(Color.parseColor("#E5E5E9"))
            setPadding(dp2px(8), dp2px(6), dp2px(8), dp2px(6))
        }

        val sysBtn = Button(this).apply { text = "🌐 切换键盘"; layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f); setBackgroundColor(Color.parseColor("#D1D5DB")) }
        sysBtn.setOnClickListener { (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager).showInputMethodPicker() }

        val delBtn = Button(this).apply { text = "⌫ 删除"; layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f).apply { setMargins(dp2px(8), 0, dp2px(8), 0) }; setBackgroundColor(Color.parseColor("#D1D5DB")) }
        delBtn.setOnClickListener { currentInputConnection?.deleteSurroundingText(1, 0) }

        val hideBtn = Button(this).apply { text = "⬇ 收起"; layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f); setBackgroundColor(Color.parseColor("#D1D5DB")) }
        hideBtn.setOnClickListener { requestHideSelf(0) }

        bottomBar.addView(sysBtn); bottomBar.addView(delBtn); bottomBar.addView(hideBtn)

        panel.addView(categoryScroll)
        panel.addView(contentScroll)
        panel.addView(bottomBar)
        return panel
    }

    /** 生成 26 键拼音键盘 (代码略作折叠，与之前一致) */
    private fun createPinyinKeyboard(): View {
        val keyboardLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setBackgroundColor(Color.parseColor("#D1D5DB"))
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }

        val pinyinArea = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setBackgroundColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        composingView = TextView(this).apply {
            textSize = 18f; setTextColor(Color.parseColor("#DB2777")); setPadding(dp2px(12), dp2px(4), dp2px(12), dp2px(0)); visibility = View.GONE
        }
        candidateScroll = HorizontalScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(44)); isHorizontalScrollBarEnabled = false; visibility = View.GONE
        }
        candidateLayout = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(dp2px(8), 0, dp2px(8), 0) }
        candidateScroll.addView(candidateLayout)
        pinyinArea.addView(composingView); pinyinArea.addView(candidateScroll)
        keyboardLayout.addView(pinyinArea)

        val rows = listOf(listOf("q", "w", "e", "r", "t", "y", "u", "i", "o", "p"), listOf("a", "s", "d", "f", "g", "h", "j", "k", "l"), listOf("z", "x", "c", "v", "b", "n", "m", "⌫"), listOf("?", ",", "空格", ".", "发送"))
        for (rowKeys in rows) {
            val rowLayout = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f) }
            for (key in rowKeys) {
                rowLayout.addView(Button(this).apply {
                    text = key; textSize = 18f; isAllCaps = false; setTextColor(Color.BLACK)
                    setBackgroundColor(if (key == "⌫" || key == "发送" || key == "空格") Color.parseColor("#9CA3AF") else Color.WHITE)
                    layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, if (key == "空格") 3f else if (key == "⌫" || key == "发送") 1.5f else 1f).apply { setMargins(dp2px(3), dp2px(4), dp2px(3), dp2px(4)) }
                    setOnClickListener { handleKeyPress(key) }
                })
            }
            keyboardLayout.addView(rowLayout)
        }
        return keyboardLayout
    }

    private fun handleKeyPress(key: String) {
        val conn = currentInputConnection ?: return
        when (key) {
            "⌫" -> { if (currentPinyinBuffer.isNotEmpty()) { currentPinyinBuffer.deleteCharAt(currentPinyinBuffer.length - 1); updatePinyinUI() } else conn.deleteSurroundingText(1, 0) }
            "空格" -> { if (currentPinyinBuffer.isNotEmpty()) { val first = LocalDictionaryDB.queryCandidates(currentPinyinBuffer.toString()).firstOrNull(); commitChineseWord(first ?: currentPinyinBuffer.toString()) } else conn.commitText(" ", 1) }
            "发送" -> { if (currentPinyinBuffer.isNotEmpty()) commitChineseWord(currentPinyinBuffer.toString()); conn.performEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_SEND); conn.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, android.view.KeyEvent.KEYCODE_ENTER)); conn.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_UP, android.view.KeyEvent.KEYCODE_ENTER)) }
            "?", ",", "." -> { if (currentPinyinBuffer.isNotEmpty()) commitChineseWord(currentPinyinBuffer.toString()); conn.commitText(if (key == "?") "？" else if (key == ",") "，" else "。", 1) }
            else -> { currentPinyinBuffer.append(key); updatePinyinUI() }
        }
    }

    private fun updatePinyinUI() {
        val pinyinStr = currentPinyinBuffer.toString()
        if (pinyinStr.isEmpty()) { resetPinyinState(); return }

        composingView.visibility = View.VISIBLE; composingView.text = pinyinStr
        currentInputConnection?.setComposingText(pinyinStr, 1)

        candidateLayout.removeAllViews(); candidateScroll.visibility = View.VISIBLE

        // 【架构增强】：模拟异步从超大 SQLite 词库中查询数据
        val candidates = LocalDictionaryDB.queryCandidates(pinyinStr)
        if (candidates.isEmpty()) addCandidateButton(pinyinStr) else candidates.forEach { addCandidateButton(it) }
    }

    private fun addCandidateButton(word: String) {
        candidateLayout.addView(Button(this).apply {
            text = word; textSize = 18f; setTextColor(Color.parseColor("#333333")); setBackgroundColor(Color.TRANSPARENT); setPadding(dp2px(16), 0, dp2px(16), 0)
            setOnClickListener { commitChineseWord(word) }
        })
    }

    private fun commitChineseWord(word: String) { currentInputConnection?.commitText(word, 1); resetPinyinState() }
    private fun resetPinyinState() { currentPinyinBuffer.clear(); if (this::composingView.isInitialized) { composingView.visibility = View.GONE; candidateScroll.visibility = View.GONE; candidateLayout.removeAllViews() }; currentInputConnection?.finishComposingText() }

    /**
     * 【架构增强】：模拟本地 SQLite 数据库访问层
     * 在生产环境中，这里会是一个真实的 Room 数据库查询，
     * 用于处理几十万级别的开源 rime-ice (雾凇拼音) 等词库。
     */
    object LocalDictionaryDB {
        private val pinyinDict = mapOf(
            "wo" to listOf("我", "握"), "ni" to listOf("你", "泥"), "ta" to listOf("他", "她"), "ai" to listOf("爱", "哎"),
            "shi" to listOf("是", "事", "时"), "bu" to listOf("不", "步"), "hao" to listOf("好", "号"),
            "nihao" to listOf("你好", "泥好"), "zai" to listOf("在", "再"), "ganma" to listOf("干嘛", "赶马"),
            "ma" to listOf("吗", "妈"), "ba" to listOf("吧", "把"), "xihuan" to listOf("喜欢"), "wanshang" to listOf("晚上"), "wanan" to listOf("晚安")
        )

        fun queryCandidates(pinyin: String): List<String> {
            val exactMatch = pinyinDict[pinyin]
            if (exactMatch != null) return exactMatch
            val prefixMatch = mutableListOf<String>()
            for ((key, words) in pinyinDict) { if (key.startsWith(pinyin)) prefixMatch.addAll(words) }
            return prefixMatch.take(10).distinct()
        }
    }
}
