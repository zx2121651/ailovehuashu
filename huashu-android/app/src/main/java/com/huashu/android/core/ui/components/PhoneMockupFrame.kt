package com.huashu.android.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.DimenTokens

@Composable
fun PhoneMockupFrame(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .aspectRatio(0.46f) // Standard phone aspect ratio
            .clip(RoundedCornerShape(DimenTokens.CornerLarge))
            .border(
                width = 4.dp,
                color = Color(0xFFE0E0E0),
                shape = RoundedCornerShape(DimenTokens.CornerLarge)
            )
            .background(Color.White)
            .padding(4.dp), // Screen bezel
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(DimenTokens.CornerMedium))
                .background(Color(0xFFF0F0F0)) // Screen background
        ) {
            content()
        }
    }
}
