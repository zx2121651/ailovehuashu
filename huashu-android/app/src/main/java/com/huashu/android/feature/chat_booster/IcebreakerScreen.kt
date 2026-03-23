package com.huashu.android.feature.chat_booster

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

data class IcebreakerTopic(val category: String, val color: Color, val text: String)

val topics = listOf(
    IcebreakerTopic("幽默", Color(0xFF64B5F6), "你觉得最糟糕的约会经历是什么？"),
    IcebreakerTopic("深度", Color(0xFFBA68C8), "你理想中的下午茶是什么样的？"),
    IcebreakerTopic("生活", Color(0xFF81C784), "如果不考虑金钱，你最想去哪里旅行？"),
    IcebreakerTopic("情感", Color(0xFFFFB74D), "你相信一见钟情还是日久生情？"),
    IcebreakerTopic("搞怪", Color(0xFFFF8A65), "如果能拥有一项超能力，你选隐身还是会飞？")
)

@Composable
fun IcebreakerScreen(onNavigateBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFEF4F6)) // Light pink bg
    ) {
        // Top App Bar
        IcebreakerTopBar(onNavigateBack)

        LazyColumn(
            contentPadding = PaddingValues(DimenTokens.SpacingMedium),
            verticalArrangement = Arrangement.spacedBy(DimenTokens.SpacingMedium),
            modifier = Modifier.fillMaxSize()
        ) {
            item {
                // Random Button
                RandomTopicButton()
                Spacer(modifier = Modifier.height(24.dp))
                Text("推荐话题", style = TypeTokens.TitleMedium.copy(color = ColorTokens.TextPrimary))
                Spacer(modifier = Modifier.height(8.dp))
            }

            items(topics.size) { index ->
                TopicCard(topics[index])
            }
        }
    }
}

@Composable
fun IcebreakerTopBar(onNavigateBack: () -> Unit) {
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
        Text("冷场救星", style = TypeTokens.TitleMedium)
        Spacer(modifier = Modifier.weight(1f))
        Spacer(modifier = Modifier.padding(20.dp))
    }
}

@Composable
fun RandomTopicButton() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp)
            .clip(RoundedCornerShape(DimenTokens.CornerMedium))
            .background(Brush.linearGradient(ColorTokens.GradientPinkOrange))
            .clickable { /* action */ }
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // Planet/Box Icon placeholder
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(Color.White.copy(alpha = 0.3f), RoundedCornerShape(24.dp))
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "随机抽取话题",
                style = TypeTokens.TitleMedium.copy(color = Color.White)
            )
        }
    }
}

@Composable
fun TopicCard(topic: IcebreakerTopic) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(topic.color.copy(alpha = 0.2f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(topic.category, style = TypeTokens.LabelSmall.copy(color = topic.color))
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(topic.text, style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextPrimary))
            }
            Spacer(modifier = Modifier.width(16.dp))
            OutlinedButton(
                onClick = { /* Copy */ },
                shape = RoundedCornerShape(50),
                modifier = Modifier.height(32.dp),
                contentPadding = PaddingValues(horizontal = 12.dp)
            ) {
                Text("复制", style = TypeTokens.LabelSmall.copy(color = ColorTokens.BrandPink))
            }
        }
    }
}
