package com.huashu.android.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

@Composable
fun GenderSelectionScreen(
    onNextClick: (String) -> Unit
) {
    var selectedGender by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFEF4F7)) // Very light pink background
            .padding(top = 100.dp, start = DimenTokens.SpacingLarge, end = DimenTokens.SpacingLarge),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Headers
        Text(
            text = "请选择您的性别",
            style = TypeTokens.HeadlineLarge.copy(color = ColorTokens.TextPrimary),
            modifier = Modifier.fillMaxWidth(),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "性别选定后不可更改，请根据实际情况选择",
            style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextSecondary),
            modifier = Modifier.fillMaxWidth(),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )

        Spacer(modifier = Modifier.height(64.dp))

        // Selection Cards
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            GenderCard(
                gender = "男生",
                cardColor = Color(0xFFE3F2FD), // Soft blue
                isSelected = selectedGender == "male",
                onClick = { selectedGender = "male" }
            )

            GenderCard(
                gender = "女生",
                cardColor = Color(0xFFFCE4EC), // Soft pink
                isSelected = selectedGender == "female",
                onClick = { selectedGender = "female" }
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // Next Button
        Button(
            onClick = { selectedGender?.let { onNextClick(it) } },
            enabled = selectedGender != null,
            modifier = Modifier
                .padding(bottom = 64.dp)
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(28.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                disabledContainerColor = Color.LightGray
            ),
            contentPadding = PaddingValues()
        ) {
            val bg = if (selectedGender != null) {
                Brush.linearGradient(listOf(Color(0xFFFF4D8C), Color(0xFFFF85AD)))
            } else {
                Brush.linearGradient(listOf(Color.LightGray, Color.LightGray))
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(bg),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "下一步",
                    style = TypeTokens.TitleMedium.copy(
                        color = if (selectedGender != null) ColorTokens.TextWhite else ColorTokens.TextSecondary
                    )
                )
            }
        }
    }
}

@Composable
fun GenderCard(
    gender: String,
    cardColor: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(150.dp)
                .background(cardColor, RoundedCornerShape(DimenTokens.CornerLarge))
                .border(
                    width = if (isSelected) 3.dp else 0.dp,
                    color = if (isSelected) ColorTokens.BrandPink else Color.Transparent,
                    shape = RoundedCornerShape(DimenTokens.CornerLarge)
                )
                .clickable(onClick = onClick),
            contentAlignment = Alignment.Center
        ) {
            // Placeholder for avatar
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(Color.White.copy(alpha = 0.8f), RoundedCornerShape(40.dp))
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = gender,
            style = TypeTokens.TitleMedium.copy(
                color = if (isSelected) ColorTokens.BrandPink else ColorTokens.TextPrimary
            )
        )
    }
}
