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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.components.BottomInputBar
import com.huashu.android.core.ui.components.ResultBubbleCard
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

data class MockReply(val id: Int, val tone: String, val text: String)

@Composable
fun ChatBoosterScreen(
    onNavigateBack: () -> Unit
) {
    var replies by remember { mutableStateOf<List<MockReply>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }

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
            if (replies.isEmpty() && !isLoading) {
                // Empty State
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "粘贴对方的话\nAI一秒帮你生成高情商回复",
                        style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextSecondary),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            } else {
                // Suggestions List
                LazyColumn(
                    contentPadding = PaddingValues(DimenTokens.SpacingMedium),
                    verticalArrangement = Arrangement.spacedBy(DimenTokens.SpacingMedium),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(replies) { reply ->
                        ResultBubbleCard(
                            tone = reply.tone,
                            text = reply.text,
                            onCopyClick = { /* Handle copy */ },
                            onRewriteClick = { /* Handle rewrite */ }
                        )
                    }
                }
            }
        }

        // Bottom Input Area
        BottomInputBar(
            onSend = { inputText ->
                isLoading = true
                // Mock generating delay
                replies = listOf(
                    MockReply(1, "温柔体贴", "别太累了，工作永远做不完的。等忙完了我带你去吃好吃的好不好？"),
                    MockReply(2, "俏皮幽默", "又加班？看来老板是想把你榨干呀，要不我把你偷跑吧！"),
                    MockReply(3, "边界感", "辛苦了，注意劳逸结合。")
                )
                isLoading = false
            }
        )
    }
}

@Composable
fun ChatBoosterTopBar(onNavigateBack: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .background(ColorTokens.SurfaceWhite)
            .statusBarsPadding()
            .height(56.dp)
            .padding(horizontal = DimenTokens.SpacingMedium)
    ) {
        Icon(
            imageVector = Icons.Default.ArrowBack,
            contentDescription = "Back",
            tint = ColorTokens.TextPrimary,
            modifier = Modifier
                .clickable { onNavigateBack() }
                .padding(8.dp)
        )

        Spacer(modifier = Modifier.weight(1f))

        Text(
            text = "聊天神器",
            style = TypeTokens.TitleMedium,
            color = ColorTokens.TextPrimary
        )

        Spacer(modifier = Modifier.weight(1f))

        // Placeholder for symmetry
        Spacer(modifier = Modifier.padding(20.dp))
    }
}
