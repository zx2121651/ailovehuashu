package com.huashu.android.feature.home

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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.components.GradientHeroCard
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

data class AbilityCardData(
    val id: String,
    val title: String,
    val subtitle: String,
    val colors: List<Color>
)

val abilityCards = listOf(
    AbilityCardData("chat_hero", "聊天神器", "输入对方发的话", ColorTokens.GradientPinkOrange),
    AbilityCardData("screenshot_helper", "截图帮回", "一键识别对方想法", ColorTokens.GradientBluePurple),
    AbilityCardData("simulator", "哄哄模拟器", "她生气了怎么办？", ColorTokens.GradientGreenBlue),
    AbilityCardData("icebreaker", "冷场救星", "不知道聊什么看这里", ColorTokens.GradientSunset),
    AbilityCardData("identity_card", "聊天身份卡", "测测你的聊天人格", ColorTokens.GradientPurplePink),
    AbilityCardData("love_classroom", "恋爱课堂", "每日脱单干货", ColorTokens.GradientPinkOrange),
    AbilityCardData("coach", "恋爱军师", "1对1情感指导", ColorTokens.GradientBluePurple),
    AbilityCardData("progress", "关系进度条", "测算你们的进度", ColorTokens.GradientGreenBlue),
    AbilityCardData("secret_book", "脱单秘籍", "海量案例库", ColorTokens.GradientSunset),
    AbilityCardData("decoder", "关系解码器", "Ta的潜台词是什么", ColorTokens.GradientPurplePink)
)

@Composable
fun HomeScreen(
    onNavigateToChatBooster: () -> Unit,
    onNavigateToScreenshotAnalyzer: () -> Unit,
    onNavigateToApologySimulator: () -> Unit,
    onNavigateToIcebreaker: () -> Unit,
    onNavigateToIdentityCard: () -> Unit
) {
    var isMaleMode by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ColorTokens.Background)
            .statusBarsPadding()
    ) {
        // Top Bar / Header with Toggle
        HomeHeader(
            isMaleMode = isMaleMode,
            onToggleMode = { isMaleMode = it }
        )

        // 10-Grid Content
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(DimenTokens.SpacingMedium),
            horizontalArrangement = Arrangement.spacedBy(DimenTokens.SpacingMedium),
            verticalArrangement = Arrangement.spacedBy(DimenTokens.SpacingMedium),
            modifier = Modifier.fillMaxSize()
        ) {
            items(abilityCards) { card ->
                GradientHeroCard(
                    title = card.title,
                    subtitle = card.subtitle,
                    colors = card.colors,
                    onClick = {
                        when (card.id) {
                            "chat_hero" -> onNavigateToChatBooster()
                            "screenshot_helper" -> onNavigateToScreenshotAnalyzer()
                            "simulator" -> onNavigateToApologySimulator()
                            "icebreaker" -> onNavigateToIcebreaker()
                            "identity_card" -> onNavigateToIdentityCard()
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun HomeHeader(
    isMaleMode: Boolean,
    onToggleMode: (Boolean) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                top = DimenTokens.SpacingSmall,
                start = DimenTokens.SpacingMedium,
                end = DimenTokens.SpacingMedium,
                bottom = DimenTokens.SpacingSmall
            )
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "恋爱键盘",
                style = TypeTokens.HeadlineLarge,
                color = ColorTokens.TextPrimary
            )

            // Gender Toggle
            GenderToggle(isMaleMode = isMaleMode, onToggle = onToggleMode)
        }
        Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))
        Text(
            text = "高情商聊天回复神器",
            style = TypeTokens.BodyMedium.copy(fontWeight = FontWeight.Medium),
            color = ColorTokens.TextSecondary
        )
    }
}

@Composable
fun GenderToggle(
    isMaleMode: Boolean,
    onToggle: (Boolean) -> Unit
) {
    val activeBg = ColorTokens.BrandPink
    val inactiveBg = ColorTokens.SurfaceWhite
    val activeText = ColorTokens.TextWhite
    val inactiveText = ColorTokens.TextSecondary

    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(DimenTokens.CornerPill))
            .background(ColorTokens.SurfaceWhite)
            .padding(2.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(DimenTokens.CornerPill))
                .background(if (isMaleMode) activeBg else inactiveBg)
                .clickable { onToggle(true) }
                .padding(horizontal = 16.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "男生",
                style = TypeTokens.LabelSmall.copy(fontWeight = FontWeight.Bold),
                color = if (isMaleMode) activeText else inactiveText
            )
        }

        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(DimenTokens.CornerPill))
                .background(if (!isMaleMode) activeBg else inactiveBg)
                .clickable { onToggle(false) }
                .padding(horizontal = 16.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "女生",
                style = TypeTokens.LabelSmall.copy(fontWeight = FontWeight.Bold),
                color = if (!isMaleMode) activeText else inactiveText
            )
        }
    }
}
