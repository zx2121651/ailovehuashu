package com.huashu.android.feature.chat_booster

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

@Composable
fun ScreenshotAnalyzerScreen(
    onNavigateBack: () -> Unit
) {
    var isAnalyzing by remember { mutableStateOf(false) }
    var hasResults by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFDF7F8)) // Warm grey/pale pink background
    ) {
        // Top App Bar
        ScreenshotTopBar(onNavigateBack)

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(DimenTokens.SpacingMedium)
        ) {
            item {
                // Upload Area
                UploadScreenshotCard()
                Spacer(modifier = Modifier.height(32.dp))
            }

            item {
                // Action Button
                AnalyzeButton(
                    isAnalyzing = isAnalyzing,
                    onClick = {
                        isAnalyzing = true
                        // Simulate network call
                        hasResults = true
                        isAnalyzing = false
                    }
                )
                Spacer(modifier = Modifier.height(32.dp))
            }

            if (hasResults) {
                item {
                    AnalysisResultSection()
                }
            }
        }
    }
}

@Composable
fun ScreenshotTopBar(onNavigateBack: () -> Unit) {
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
            contentDescription = "Back",
            tint = ColorTokens.TextPrimary,
            modifier = Modifier
                .clickable { onNavigateBack() }
                .padding(8.dp)
        )
        Spacer(modifier = Modifier.weight(1f))
        Text(
            text = "截图帮回",
            style = TypeTokens.TitleMedium,
            color = ColorTokens.TextPrimary
        )
        Spacer(modifier = Modifier.weight(1f))
        Spacer(modifier = Modifier.padding(20.dp))
    }
}

@Composable
fun UploadScreenshotCard() {
    val stroke = androidx.compose.foundation.BorderStroke(
        width = 2.dp,
        color = Color.LightGray
    )
    val dashPathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .clip(RoundedCornerShape(DimenTokens.CornerMedium))
            .background(Color.White)
            // Simulating dashed border
            .padding(2.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Upload",
                modifier = Modifier.size(48.dp),
                tint = ColorTokens.TextSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "点击上传微信聊天截图",
                style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextSecondary)
            )
        }
    }
}

@Composable
fun AnalyzeButton(isAnalyzing: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = !isAnalyzing,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(28.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues()
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.linearGradient(listOf(Color(0xFFFF4D8C), Color(0xFFFF85AD)))),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (isAnalyzing) "分析中..." else "AI分析TA的心思",
                style = TypeTokens.TitleMedium.copy(color = ColorTokens.TextWhite)
            )
        }
    }
}

@Composable
fun AnalysisResultSection() {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "分析结果",
            style = TypeTokens.TitleMedium.copy(color = ColorTokens.TextPrimary)
        )
        Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))

        Card(
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(DimenTokens.CornerMedium),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "分析结果：TA在试探你的态度，建议用幽默化解。",
                style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextPrimary),
                modifier = Modifier.padding(DimenTokens.SpacingMedium)
            )
        }

        Spacer(modifier = Modifier.height(DimenTokens.SpacingLarge))

        Text(
            text = "回复建议",
            style = TypeTokens.TitleMedium.copy(color = ColorTokens.TextPrimary)
        )
        Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))

        ReplyBubble("那你猜猜看呀~")
        Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))
        ReplyBubble("我就不告诉你~")
    }
}

@Composable
fun ReplyBubble(text: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp, bottomStart = 2.dp, bottomEnd = 16.dp))
                .background(ColorTokens.SurfaceWhite)
                .padding(16.dp)
        ) {
            Text(text = text, style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextPrimary))
        }
        Spacer(modifier = Modifier.width(DimenTokens.SpacingSmall))
        OutlinedButton(
            onClick = { /* Copy action */ },
            shape = RoundedCornerShape(DimenTokens.CornerPill)
        ) {
            Text("一键复制", style = TypeTokens.LabelSmall.copy(color = ColorTokens.BrandPink))
        }
    }
}
