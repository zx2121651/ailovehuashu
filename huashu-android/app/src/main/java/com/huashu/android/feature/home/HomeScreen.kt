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
    AbilityCardData("chat_hero", "Chat Helper", "Smart replies", ColorTokens.GradientPinkOrange),
    AbilityCardData("screenshot_helper", "Screenshot Analyzer", "Read her mind", ColorTokens.GradientBluePurple),
    AbilityCardData("simulator", "Apology Simulator", "Say sorry right", ColorTokens.GradientGreenBlue),
    AbilityCardData("icebreaker", "Icebreaker", "Never run out of words", ColorTokens.GradientSunset),
    AbilityCardData("identity_card", "Identity Card", "Your chat persona", ColorTokens.GradientPurplePink),
    AbilityCardData("love_classroom", "Dating Class", "Daily tips", ColorTokens.GradientPinkOrange),
    AbilityCardData("coach", "Love Coach", "1-on-1 advice", ColorTokens.GradientBluePurple),
    AbilityCardData("progress", "Progress Bar", "Check your status", ColorTokens.GradientGreenBlue),
    AbilityCardData("secret_book", "Secret Book", "Success cases", ColorTokens.GradientSunset),
    AbilityCardData("decoder", "Decoder", "Understand subtext", ColorTokens.GradientPurplePink)
)

@Composable
fun HomeScreen(
    onNavigateToChatBooster: () -> Unit
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
                        if (card.id == "chat_hero") {
                            onNavigateToChatBooster()
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
                text = "Lovekey",
                style = TypeTokens.HeadlineLarge,
                color = ColorTokens.TextPrimary
            )

            // Gender Toggle
            GenderToggle(isMaleMode = isMaleMode, onToggle = onToggleMode)
        }
        Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))
        Text(
            text = "Your Dating Assistant",
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
                text = "Male",
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
                text = "Female",
                style = TypeTokens.LabelSmall.copy(fontWeight = FontWeight.Bold),
                color = if (!isMaleMode) activeText else inactiveText
            )
        }
    }
}
