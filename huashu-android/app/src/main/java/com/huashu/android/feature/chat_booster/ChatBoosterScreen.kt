package com.huashu.android.feature.chat_booster

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

data class ReplySuggestion(val id: Int, val tone: String, val toneColor: Color, val text: String)

@Composable
fun ChatBoosterScreen(
    onNavigateBack: () -> Unit,
    viewModel: ChatBoosterViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ColorTokens.Background)
    ) {
        // Top App Bar
        ChatBoosterTopBar(onNavigateBack)

        // Main Content Area
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            if (uiState.replies.isEmpty() && !uiState.isLoading) {
                // Empty State
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Paste their message below\nAI will craft the perfect reply in seconds.",
                        style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextSecondary),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            } else if (uiState.isLoading) {
                // Loading State
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Generating reply...", style = TypeTokens.BodyMedium)
                }
            } else {
                // Suggestions List
                LazyColumn(
                    contentPadding = PaddingValues(DimenTokens.SpacingMedium),
                    verticalArrangement = Arrangement.spacedBy(DimenTokens.SpacingMedium),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(uiState.replies) { reply ->
                        ReplyCard(reply = reply)
                    }
                }
            }
        }

        // Bottom Input Area
        ChatBoosterInputBar(
            inputText = uiState.inputText,
            onTextChange = viewModel::onInputTextChanged,
            onGenerate = viewModel::generateReply
        )
    }
}

@Composable
fun ChatBoosterTopBar(onNavigateBack: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .background(ColorTokens.SurfaceWhite.copy(alpha = 0.9f))
            .statusBarsPadding()
            .height(56.dp)
            .padding(horizontal = DimenTokens.SpacingMedium)
    ) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Back",
            tint = ColorTokens.TextPrimary,
            modifier = Modifier
                .clickable { onNavigateBack() }
                .padding(8.dp)
        )

        Spacer(modifier = Modifier.weight(1f))

        Text(
            text = "Chat Helper",
            style = TypeTokens.TitleMedium,
            color = ColorTokens.TextPrimary
        )

        Spacer(modifier = Modifier.weight(1f))

        Spacer(modifier = Modifier.padding(20.dp))
    }
}

@Composable
fun ReplyCard(reply: ReplySuggestion) {
    Card(
        shape = RoundedCornerShape(DimenTokens.CornerMedium),
        colors = CardDefaults.cardColors(containerColor = ColorTokens.SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(DimenTokens.SpacingMedium)
        ) {
            // Tone Tag
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(DimenTokens.CornerPill))
                    .background(reply.toneColor.copy(alpha = 0.2f))
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text(
                    text = reply.tone,
                    style = TypeTokens.LabelSmall.copy(color = reply.toneColor.copy(alpha = 1.0f))
                )
            }

            Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))

            // Reply Text
            Text(
                text = reply.text,
                style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextPrimary)
            )

            Spacer(modifier = Modifier.height(DimenTokens.SpacingMedium))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                OutlinedButton(
                    onClick = { /* Handle Rewrite */ },
                    shape = RoundedCornerShape(DimenTokens.CornerPill),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text("Rewrite", style = TypeTokens.LabelSmall)
                }
                Spacer(modifier = Modifier.width(DimenTokens.SpacingSmall))
                Button(
                    onClick = { /* Handle Copy */ },
                    shape = RoundedCornerShape(DimenTokens.CornerPill),
                    colors = ButtonDefaults.buttonColors(containerColor = ColorTokens.BrandPink),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text("Copy", style = TypeTokens.LabelSmall)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatBoosterInputBar(
    inputText: String,
    onTextChange: (String) -> Unit,
    onGenerate: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(ColorTokens.SurfaceWhite)
            .padding(DimenTokens.SpacingMedium)
    ) {
        OutlinedTextField(
            value = inputText,
            onValueChange = onTextChange,
            placeholder = { Text("Paste crush's message...", color = ColorTokens.TextSecondary) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(DimenTokens.CornerMedium),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = ColorTokens.BrandPink,
                unfocusedBorderColor = Color.LightGray,
                containerColor = ColorTokens.Background

            ),
            maxLines = 4
        )

        Spacer(modifier = Modifier.height(DimenTokens.SpacingMedium))

        Button(
            onClick = onGenerate,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(DimenTokens.CornerPill),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent
            ),
            contentPadding = PaddingValues()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Brush.linearGradient(ColorTokens.GradientPinkOrange)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Generate Reply",
                    style = TypeTokens.TitleSmall.copy(color = ColorTokens.TextWhite)
                )
            }
        }
    }
}
