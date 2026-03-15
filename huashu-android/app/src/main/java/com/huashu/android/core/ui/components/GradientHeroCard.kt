package com.huashu.android.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.ShadowTokens
import com.huashu.android.core.ui.theme.TypeTokens

@Composable
fun GradientHeroCard(
    title: String,
    subtitle: String,
    colors: List<Color>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(DimenTokens.CornerMedium),
        elevation = CardDefaults.cardElevation(defaultElevation = ShadowTokens.ElevationLight),
        modifier = modifier
            .fillMaxWidth()
            .height(140.dp)
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.linearGradient(colors))
                .padding(DimenTokens.SpacingMedium)
        ) {
            Column(modifier = Modifier.align(Alignment.TopStart)) {
                Text(
                    text = title,
                    style = TypeTokens.TitleMedium.copy(color = ColorTokens.TextWhite)
                )
                Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))
                Text(
                    text = subtitle,
                    style = TypeTokens.LabelSmall.copy(color = ColorTokens.TextWhiteSecondary)
                )
            }

            // Go Button placeholder
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .clip(RoundedCornerShape(DimenTokens.CornerPill))
                    .background(ColorTokens.ButtonDark)
                    .padding(horizontal = 16.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "去使用 >",
                    style = TypeTokens.LabelSmall.copy(
                        color = ColorTokens.TextWhite,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }
    }
}
