package com.huashu.keyboard

import android.content.Context
import android.inputmethodservice.InputMethodService
import android.view.View
import android.widget.LinearLayout
import android.widget.Button
import android.widget.ScrollView
import android.widget.HorizontalScrollView
import android.graphics.Color
import android.view.ViewGroup
import android.view.Gravity
import android.view.inputmethod.InputMethodManager

/**
 * 恋爱话术 - 混合式原生输入法 (支持自打字 + 话术一键发送)
 */
class HuashuIME : InputMethodService() {

    private lateinit var rootLayout: LinearLayout
    private lateinit var contentContainer: LinearLayout
    private var isTypingMode = false

    private val dp2px = { dp: Int -> (dp * resources.displayMetrics.density).toInt() }

    override fun onCreateInputView(): View {
        rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#F4F4F6"))
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(300))
        }

        // 1. 顶部工具栏：包含模式切换
        val topBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(Color.parseColor("#FFFFFF"))
            setPadding(dp2px(8), dp2px(4), dp2px(8), dp2px(4))
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(44))
        }

        val modeSwitchBtn = Button(this).apply {
            text = "⌨️ 切换打字/话术"
            textSize = 14f
            setTextColor(Color.parseColor("#DB2777"))
            setBackgroundColor(Color.TRANSPARENT)
            setOnClickListener {
                isTypingMode = !isTypingMode
                renderContent()
            }
        }
        topBar.addView(modeSwitchBtn)
        rootLayout.addView(topBar)

        // 2. 内容容器 (用于挂载 话术板 或 键盘板)
        contentContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
        }
        rootLayout.addView(contentContainer)

        // 首次渲染：默认显示话术面板
        renderContent()

        return rootLayout
    }

    /**
     * 根据当前模式切换中央内容区域
     */
    private fun renderContent() {
        contentContainer.removeAllViews()
        if (isTypingMode) {
            contentContainer.addView(createQwertyKeyboard())
        } else {
            contentContainer.addView(createScriptPanel())
        }
    }

    /**
     * 生成：话术面板 (搜狗风格)
     */
    private fun createScriptPanel(): View {
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }

        // 类别栏
        val categoryScroll = HorizontalScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(40))
            setBackgroundColor(Color.parseColor("#FAFAFA"))
            isHorizontalScrollBarEnabled = false
        }
        val categoryLayout = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        listOf("最近使用", "高情商首聊", "幽默化解", "暧昧升温").forEach { cat ->
            categoryLayout.addView(Button(this).apply {
                text = cat; textSize = 13f; setBackgroundColor(Color.TRANSPARENT)
            })
        }
        categoryScroll.addView(categoryLayout)

        // 话术列表
        val contentScroll = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
            setPadding(dp2px(12), dp2px(8), dp2px(12), dp2px(8))
        }
        val listLayout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        listOf("刚吃完饭，正在思考宇宙的终极奥秘，顺便想想你。", "摸摸头，辛苦啦。今晚的月亮很温柔，我们在梦里见。").forEach { script ->
            listLayout.addView(Button(this).apply {
                text = script; textSize = 15f; isAllCaps = false
                gravity = Gravity.LEFT or Gravity.CENTER_VERTICAL
                setBackgroundColor(Color.WHITE)
                setPadding(dp2px(16), dp2px(12), dp2px(16), dp2px(12))
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { setMargins(0, 0, 0, dp2px(8)) }
                setOnClickListener { currentInputConnection?.commitText(script, 1) }
            })
        }
        contentScroll.addView(listLayout)

        // 底部快捷栏
        val bottomBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp2px(50))
            setBackgroundColor(Color.parseColor("#E5E5E9"))
            setPadding(dp2px(8), dp2px(6), dp2px(8), dp2px(6))
        }

        val sysBtn = Button(this).apply { text = "🌐 切系统输入法"; layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f); setBackgroundColor(Color.parseColor("#D1D5DB")) }
        sysBtn.setOnClickListener { (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager).showInputMethodPicker() }

        val delBtn = Button(this).apply { text = "⌫ 删除"; layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f).apply { setMargins(dp2px(8), 0, dp2px(8), 0) }; setBackgroundColor(Color.parseColor("#D1D5DB")) }
        delBtn.setOnClickListener { currentInputConnection?.deleteSurroundingText(1, 0) }

        bottomBar.addView(sysBtn); bottomBar.addView(delBtn)

        panel.addView(categoryScroll)
        panel.addView(contentScroll)
        panel.addView(bottomBar)
        return panel
    }

    /**
     * 生成：真正的 26 键 QWERTY 全键盘 (目前为基础字母+标点打字功能)
     */
    private fun createQwertyKeyboard(): View {
        val keyboardLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#D1D5DB")) // 经典输入法背景灰
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            setPadding(0, dp2px(8), 0, dp2px(8))
        }

        val rows = listOf(
            listOf("Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"),
            listOf("A", "S", "D", "F", "G", "H", "J", "K", "L"),
            listOf("Z", "X", "C", "V", "B", "N", "M", "⌫"),
            listOf("?", ",", "空格", ".", "发送")
        )

        for (rowKeys in rows) {
            val rowLayout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
            }

            for (key in rowKeys) {
                val keyBtn = Button(this).apply {
                    text = key
                    textSize = 18f
                    isAllCaps = false
                    setTextColor(Color.BLACK)
                    setBackgroundColor(if (key == "⌫" || key == "发送" || key == "空格") Color.parseColor("#9CA3AF") else Color.WHITE)

                    val weight = if (key == "空格") 3f else if (key == "⌫" || key == "发送") 1.5f else 1f
                    layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, weight).apply {
                        setMargins(dp2px(3), dp2px(4), dp2px(3), dp2px(4))
                    }

                    setOnClickListener {
                        val conn = currentInputConnection
                        when (key) {
                            "⌫" -> conn?.deleteSurroundingText(1, 0)
                            "空格" -> conn?.commitText(" ", 1)
                            "发送" -> {
                                // 模拟按下回车键/发送键
                                conn?.performEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_SEND)
                                // 作为备用回退机制，如果 App 不支持 ACTION_SEND，则发送回车
                                conn?.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, android.view.KeyEvent.KEYCODE_ENTER))
                                conn?.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_UP, android.view.KeyEvent.KEYCODE_ENTER))
                            }
                            else -> conn?.commitText(key.toLowerCase(), 1) // 正常打字输入
                        }
                    }
                }
                rowLayout.addView(keyBtn)
            }
            keyboardLayout.addView(rowLayout)
        }
        return keyboardLayout
    }
}
