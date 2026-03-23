package com.huashu.android.feature.chat_booster

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

@Composable
fun IdentityCardScreen(onNavigateBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0E0E10)) // Deep night background
            .padding(bottom = DimenTokens.SpacingLarge)
    ) {
        // Top App Bar
        IdentityCardTopBar(onNavigateBack)

        // Main Card
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(DimenTokens.SpacingLarge)
        ) {
            MainIdentityCard()
        }

        // Action Buttons
        IdentityCardActions()
    }
}

@Composable
fun IdentityCardTopBar(onNavigateBack: () -> Unit) {
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
            tint = Color(0xFFF6F3F5),
            modifier = Modifier.clickable { onNavigateBack() }.padding(8.dp)
        )
        Spacer(modifier = Modifier.weight(1f))
        Text("聊天身份卡", style = TypeTokens.TitleMedium.copy(color = Color(0xFFF6F3F5)))
        Spacer(modifier = Modifier.weight(1f))
        Spacer(modifier = Modifier.padding(20.dp))
    }
}

@Composable
fun MainIdentityCard() {
    Card(
        modifier = Modifier.fillMaxSize(),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF262528)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(listOf(Color(0x33FF89AF), Color(0x33F98C49))))
                .padding(24.dp)
        ) {
            Column(
                modifier = Modifier.align(Alignment.TopCenter),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(32.dp))
                Text(
                    text = "你的聊天人格是",
                    style = TypeTokens.TitleSmall.copy(color = Color(0xFFACAAD)),
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "高冷段子手",
                    style = TypeTokens.HeadlineLarge.copy(color = Color(0xFFFF89AF), fontWeight = FontWeight.Bold),
                    textAlign = TextAlign.Center
                )
            }

            Column(
                modifier = Modifier.align(Alignment.BottomStart)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TagChip("幽默", Color(0xFFFF89AF))
                    TagChip("慢热", Color(0xFFAC89FF))
                    TagChip("脑洞大", Color(0xFFF98C49))
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "表面高冷，内心火热，总能在冷场时一语致胜。你不是不爱说话，你只是在憋大招。",
                    style = TypeTokens.BodyMedium.copy(color = Color(0xFFF6F3F5)),
                    textAlign = TextAlign.Start
                )
            }
        }
    }
}

@Composable
fun TagChip(text: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(color.copy(alpha = 0.2f))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(text = text, style = TypeTokens.LabelSmall.copy(color = color))
    }
}

@Composable
fun IdentityCardActions() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = DimenTokens.SpacingLarge),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        OutlinedButton(
            onClick = { /* Retest */ },
            modifier = Modifier
                .weight(1f)
                .height(56.dp),
            shape = RoundedCornerShape(28.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFF6F3F5)),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF48474A))
        ) {
            Text("重新测试", style = TypeTokens.TitleMedium)
        }

        Button(
            onClick = { /* Share */ },
            modifier = Modifier
                .weight(1f)
                .height(56.dp),
            shape = RoundedCornerShape(28.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            contentPadding = PaddingValues()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Brush.linearGradient(listOf(Color(0xFFFF89AF), Color(0xFFF98C49)))),
                contentAlignment = Alignment.Center
            ) {
                Text("分享到朋友圈", style = TypeTokens.TitleMedium.copy(color = Color(0xFF61002F)))
            }
        }
    }
}
