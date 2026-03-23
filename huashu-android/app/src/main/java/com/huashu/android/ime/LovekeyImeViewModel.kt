package com.huashu.android.ime

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SmartReply(val id: Int, val text: String, val tags: List<String>)

data class ImeUiState(
    val isFetchingSmartReplies: Boolean = false,
    val smartReplies: List<SmartReply> = emptyList(),
    val errorMessage: String? = null
)

class LovekeyImeViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(ImeUiState())
    val uiState: StateFlow<ImeUiState> = _uiState.asStateFlow()

    /**
     * Request the huashu-backend API to get high EQ reply recommendations.
     * In a real app, this would take the current context (e.g. from clipboard or an Accessibility Service reading the screen)
     */
    fun fetchSmartReplies(contextQuery: String = "默认求助场景") {
        viewModelScope.launch {
            _uiState.update { it.copy(isFetchingSmartReplies = true, errorMessage = null, smartReplies = emptyList()) }

            try {
                // Simulate network latency calling huashu-backend API
                delay(1200)

                // Simulated response from backend
                val mockResponse = listOf(
                    SmartReply(1, "工作再忙也要记得想我哦，不然我会吃醋的哼！", listOf("撒娇", "关心")),
                    SmartReply(2, "你这么厉害，是不是偷偷背着我报了补习班？", listOf("幽默", "夸奖")),
                    SmartReply(3, "没事，慢慢来，我一直在你身后挺你呢。", listOf("温柔", "支持")),
                    SmartReply(4, "今天天气这么好，要不要出来走走？", listOf("主动邀约", "轻松"))
                )

                _uiState.update {
                    it.copy(
                        isFetchingSmartReplies = false,
                        smartReplies = mockResponse
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isFetchingSmartReplies = false,
                        errorMessage = "网络请求失败，请稍后重试"
                    )
                }
            }
        }
    }

    fun clearSmartReplies() {
        _uiState.update { it.copy(smartReplies = emptyList(), errorMessage = null) }
    }
}
