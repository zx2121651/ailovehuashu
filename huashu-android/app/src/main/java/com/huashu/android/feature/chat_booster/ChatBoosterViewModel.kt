package com.huashu.android.feature.chat_booster

import androidx.compose.ui.graphics.Color
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ChatBoosterUiState(
    val inputText: String = "",
    val isLoading: Boolean = false,
    val replies: List<ReplySuggestion> = emptyList()
)

class ChatBoosterViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ChatBoosterUiState())
    val uiState: StateFlow<ChatBoosterUiState> = _uiState.asStateFlow()

    fun onInputTextChanged(newText: String) {
        _uiState.update { it.copy(inputText = newText) }
    }

    fun generateReply() {
        val currentText = _uiState.value.inputText
        if (currentText.isBlank()) return

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            // Mock network delay
            delay(1000)

            val mockReplies = listOf(
                ReplySuggestion(1, "Humorous", Color(0xFF64B5F6), "Working late again? If your boss keeps this up, I might have to stage a rescue mission!"),
                ReplySuggestion(2, "Caring", Color(0xFF81C784), "Don't work too hard! Make sure you take a break and get something good to eat. We can catch up when you're free."),
                ReplySuggestion(3, "Witty", Color(0xFFBA68C8), "Is your middle name 'Overtime'? Because you're always working! Let me know when you escape.")
            )

            _uiState.update {
                it.copy(
                    isLoading = false,
                    replies = mockReplies,
                    inputText = "" // Clear input after success
                )
            }
        }
    }
}
