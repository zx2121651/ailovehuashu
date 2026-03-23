package com.huashu.android.feature.chat_booster

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ApologyUiState(
    val inputText: String = "",
    val angerLevel: Int = 80,
    val isAiThinking: Boolean = false,
    val messages: List<Message> = emptyList()
)

class ApologySimulatorViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ApologyUiState())
    val uiState: StateFlow<ApologyUiState> = _uiState.asStateFlow()

    init {
        // Initial state messages
        _uiState.update {
            it.copy(
                messages = listOf(
                    Message("你知不知道错哪了？", isAi = true),
                    Message("我知道错了，下次不敢了...", isAi = false),
                    Message("就这？没诚意！", isAi = true)
                )
            )
        }
    }

    fun onInputTextChanged(newText: String) {
        _uiState.update { it.copy(inputText = newText) }
    }

    fun sendMessage() {
        val currentText = _uiState.value.inputText
        if (currentText.isBlank() || _uiState.value.isAiThinking) return

        // 1. Add user message and clear input
        val userMessage = Message(currentText, isAi = false)
        _uiState.update { state ->
            state.copy(
                messages = state.messages + userMessage,
                inputText = "",
                isAiThinking = true
            )
        }

        // 2. Simulate AI processing and response
        viewModelScope.launch {
            delay(1200) // Mock thinking time

            val aiResponseText = if (currentText.length > 10) {
                "哼，算你还有点诚意，这次就原谅你了。"
            } else {
                "你这是在敷衍我吗？"
            }

            val newAngerLevel = if (currentText.length > 10) {
                (_uiState.value.angerLevel - 30).coerceAtLeast(0)
            } else {
                (_uiState.value.angerLevel + 10).coerceAtMost(100)
            }

            val aiMessage = Message(aiResponseText, isAi = true)

            _uiState.update { state ->
                state.copy(
                    messages = state.messages + aiMessage,
                    angerLevel = newAngerLevel,
                    isAiThinking = false
                )
            }
        }
    }
}
