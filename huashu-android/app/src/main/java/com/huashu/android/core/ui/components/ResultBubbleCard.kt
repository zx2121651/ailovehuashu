package com.huashu.android.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

@Composable
fun ResultBubbleCard(
    tone: String,
    text: String,
    onCopyClick: () -> Unit,
    onRewriteClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(
            topStart = DimenTokens.CornerMedium,
            topEnd = DimenTokens.CornerMedium,
            bottomStart = 0.dp,
            bottomEnd = DimenTokens.CornerMedium
        ),
        colors = CardDefaults.cardColors(containerColor = ColorTokens.SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(DimenTokens.SpacingMedium)
        ) {
            // Tone Tag
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(DimenTokens.CornerSmall))
                    .background(ColorTokens.BrandPink.copy(alpha = 0.1f))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = tone,
                    style = TypeTokens.LabelSmall.copy(color = ColorTokens.BrandPink, fontWeight = FontWeight.Bold)
                )
            }

            Spacer(modifier = Modifier.height(DimenTokens.SpacingSmall))

            // Suggestion Text
            Text(
                text = text,
                style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextPrimary)
            )

            Spacer(modifier = Modifier.height(DimenTokens.SpacingMedium))

            // Actions
            Row(
                horizontalArrangement = Arrangement.End,
                modifier = Modifier.fillMaxWidth()
            ) {
                ActionButton(text = "换一句", onClick = onRewriteClick)
                Spacer(modifier = Modifier.width(DimenTokens.SpacingMedium))
                ActionButton(text = "复制发送", isPrimary = true, onClick = onCopyClick)
            }
        }
    }
}

@Composable
private fun Box(modifier: Modifier, content: @Composable () -> Unit) {
    androidx.compose.foundation.layout.Box(modifier = modifier) {
        content()
    }
}

@Composable
private fun ActionButton(
    text: String,
    isPrimary: Boolean = false,
    onClick: () -> Unit
) {
    val backgroundColor = if (isPrimary) ColorTokens.BrandBlue else ColorTokens.Background
    val textColor = if (isPrimary) ColorTokens.TextWhite else ColorTokens.TextSecondary

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(DimenTokens.CornerPill))
            .background(backgroundColor)
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = text,
            style = TypeTokens.LabelSmall.copy(color = textColor, fontWeight = FontWeight.Medium)
        )
    }
}
