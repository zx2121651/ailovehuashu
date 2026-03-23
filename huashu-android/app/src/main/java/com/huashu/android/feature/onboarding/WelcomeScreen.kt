package com.huashu.android.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

@Composable
fun WelcomeScreen(
    onAgreeClick: () -> Unit,
    onDisagreeClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFDF4F6)) // Light blush background
            .padding(horizontal = DimenTokens.SpacingLarge),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo Placeholder
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(Color.White, RoundedCornerShape(32.dp)),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(ColorTokens.BrandPink, RoundedCornerShape(30.dp))
            )
        }

        Spacer(modifier = Modifier.height(48.dp))

        // Headline
        Text(
            text = "欢迎来到恋爱键盘",
            style = TypeTokens.HeadlineLarge.copy(color = ColorTokens.TextPrimary),
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Start
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Policy Text
        val policyText = buildAnnotatedString {
            append("为了给您提供更全面的服务，请仔细阅读我们的")
            withStyle(style = SpanStyle(color = ColorTokens.BrandPink, fontWeight = FontWeight.Bold)) {
                append("《用户协议》")
            }
            append("和")
            withStyle(style = SpanStyle(color = ColorTokens.BrandPink, fontWeight = FontWeight.Bold)) {
                append("《隐私政策》")
            }
            append("，以便更好地为您提供精准的匹配服务。我们将严格遵守法律法规，保护您的个人信息。")
        }

        Text(
            text = policyText,
            style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextSecondary),
            textAlign = TextAlign.Start
        )

        Spacer(modifier = Modifier.height(64.dp))

        // Agree Button
        Button(
            onClick = onAgreeClick,
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
                    .background(Brush.linearGradient(listOf(Color(0xFFB50357), Color(0xFFFF709C)))),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "同意并进入",
                    style = TypeTokens.TitleMedium.copy(color = ColorTokens.TextWhite)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Disagree Button
        TextButton(
            onClick = onDisagreeClick,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "不同意",
                style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextSecondary)
            )
        }
    }
}
