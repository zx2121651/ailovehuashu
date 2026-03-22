package com.huashu.android.feature.chat_booster

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

@Composable
fun ApologySimulatorScreen(
    onNavigateBack: () -> Unit
) {
    var inputText by remember { mutableStateOf("") }

    val messages = remember { mutableStateListOf(
        Message("你知不知道错哪了？", isAi = true),
        Message("我知道错了，下次不敢了...", isAi = false),
        Message("就这？没诚意！", isAi = true)
    ) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFF9FA)) // Warm white background
    ) {
        // Top App Bar
        ApologyTopBar(onNavigateBack)

        // Anger Meter
        AngerMeter(level = 80)

        // Chat Section
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(DimenTokens.SpacingMedium)
        ) {
            items(messages.size) { index ->
                ChatBubble(message = messages[index])
                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        // Bottom Input
        ApologyInputBar(
            inputText = inputText,
            onTextChange = { inputText = it },
            onSend = {
                if (inputText.isNotBlank()) {
                    messages.add(Message(inputText, isAi = false))
                    inputText = ""
                }
            }
        )
    }
}

@Composable
fun ApologyTopBar(onNavigateBack: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .height(56.dp)
            .padding(horizontal = DimenTokens.SpacingMedium)
    ) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "返回",
            tint = ColorTokens.TextPrimary,
            modifier = Modifier.clickable { onNavigateBack() }.padding(8.dp)
        )
        Spacer(modifier = Modifier.weight(1f))
        Text("哄哄模拟器", style = TypeTokens.TitleMedium)
        Spacer(modifier = Modifier.weight(1f))
        Spacer(modifier = Modifier.padding(20.dp))
    }
}

@Composable
fun AngerMeter(level: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = DimenTokens.SpacingMedium, vertical = DimenTokens.SpacingSmall),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("当前生气值：$level% 😠", style = TypeTokens.TitleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { level / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = Color(0xFFFF6B9D),
                trackColor = Color(0xFFF2ECED)
            )
        }
    }
}

data class Message(val text: String, val isAi: Boolean)

@Composable
fun ChatBubble(message: Message) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isAi) Arrangement.Start else Arrangement.End,
        verticalAlignment = Alignment.Bottom
    ) {
        if (message.isAi) {
            // AI Avatar
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(Color.LightGray, RoundedCornerShape(18.dp))
            )
            Spacer(modifier = Modifier.width(8.dp))
        }

        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(
                    RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (message.isAi) 0.dp else 16.dp,
                        bottomEnd = if (message.isAi) 16.dp else 0.dp
                    )
                )
                .background(if (message.isAi) Color(0xFFEDE7E8) else Color(0xFFFF6B9D))
                .padding(12.dp)
        ) {
            Text(
                text = message.text,
                color = if (message.isAi) ColorTokens.TextPrimary else Color.White,
                style = TypeTokens.BodyMedium
            )
        }

        if (!message.isAi) {
            Spacer(modifier = Modifier.width(8.dp))
            // User Avatar placeholder
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(Color.LightGray, RoundedCornerShape(18.dp))
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApologyInputBar(inputText: String, onTextChange: (String) -> Unit, onSend: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .navigationBarsPadding()
            .imePadding()
            .padding(DimenTokens.SpacingMedium),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = inputText,
            onValueChange = onTextChange,
            placeholder = { Text("输入你的回复，试着哄好TA...") },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(24.dp),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = Color(0xFFFF6B9D),
                unfocusedBorderColor = Color.LightGray,
                containerColor = Color(0xFFF2ECED)
            )
        )
        Spacer(modifier = Modifier.width(8.dp))
        IconButton(
            onClick = onSend,
            modifier = Modifier
                .background(Color(0xFFFF6B9D), RoundedCornerShape(24.dp))
                .size(48.dp)
        ) {
            Icon(
                Icons.AutoMirrored.Filled.Send,
                contentDescription = "发送",
                tint = Color.White
            )
        }
    }
}
