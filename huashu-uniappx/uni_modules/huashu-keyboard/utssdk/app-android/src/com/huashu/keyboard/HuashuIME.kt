package com.huashu.keyboard

import android.inputmethodservice.InputMethodService
import android.view.View
import android.widget.LinearLayout
import android.widget.Button
import android.widget.ScrollView
import android.graphics.Color
import android.view.ViewGroup

/**
 * 恋爱话术核心原生输入法服务
 */
class HuashuIME : InputMethodService() {

    override fun onCreateInputView(): View {
        // 创建键盘根布局
        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#F5F7FA")) // 柔和背景色
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                800 // 键盘高度
            )
        }

        // 顶部工具栏 (可包含切换分类等)
        val toolbar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(Color.parseColor("#FBCFE8"))
            setPadding(20, 20, 20, 20)
        }

        val titleBtn = Button(this).apply {
            text = "✨ 恋爱话术库键盘"
            setBackgroundColor(Color.TRANSPARENT)
            setTextColor(Color.parseColor("#DB2777"))
        }
        toolbar.addView(titleBtn)

        // 话术内容滚动区
        val scrollView = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }

        val contentLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(20, 20, 20, 20)
        }

        // --- 模拟数据: 实际应用中需要从本地 SQLite 或网络请求获取 ---
        val mockScripts = listOf(
            "刚吃完饭，正在思考宇宙的终极奥秘，顺便想想你。",
            "怎么啦？是不是在我的脑海里跑了一整天累坏了？",
            "摸摸头，辛苦啦。今晚的月亮很温柔，早点休息，我们在梦里见。",
            "本来以为只是图你长得好看，后来发现你还挺有趣的，这下亏大了。",
            "月亮不睡我不睡，但你得睡了。晚安好梦~"
        )

        for (script in mockScripts) {
            val scriptBtn = Button(this).apply {
                text = script
                isAllCaps = false
                setBackgroundColor(Color.WHITE)
                setTextColor(Color.DKGRAY)
                setPadding(30, 30, 30, 30)
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 0, 0, 20)
                }

                // 核心业务：点击后直接上屏到微信聊天框
                setOnClickListener {
                    val inputConnection = currentInputConnection
                    if (inputConnection != null) {
                        // 将文本提交到当前光标位置
                        inputConnection.commitText(script, 1)
                    }
                }
            }
            contentLayout.addView(scriptBtn)
        }

        scrollView.addView(contentLayout)
        rootLayout.addView(toolbar)
        rootLayout.addView(scrollView)

        return rootLayout
    }
}
