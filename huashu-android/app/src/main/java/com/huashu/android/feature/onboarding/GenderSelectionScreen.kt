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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun GenderSelectionScreen(
    onNextClick: (String) -> Unit
) {
    var selectedGender by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF3F5FA)) // light gray background from screenshot
            .padding(top = 120.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "选择性别",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1E1E1E)
        )

        Spacer(modifier = Modifier.height(64.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            GenderCard(
                gender = "男",
                isSelected = selectedGender == "male",
                onClick = { selectedGender = "male" }
            )

            GenderCard(
                gender = "女",
                isSelected = selectedGender == "female",
                onClick = { selectedGender = "female" }
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = { selectedGender?.let { onNextClick(it) } },
            enabled = selectedGender != null,
            modifier = Modifier
                .padding(bottom = 64.dp)
                .size(72.dp),
            shape = RoundedCornerShape(36.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF5A75FF),
                disabledContainerColor = Color.LightGray
            ),
            contentPadding = PaddingValues(0.dp)
        ) {
            Text("→", fontSize = 28.sp, color = Color.White)
        }
    }
}

@Composable
fun GenderCard(
    gender: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(160.dp)
                .background(Color.White, RoundedCornerShape(24.dp))
                .border(
                    width = if (isSelected) 3.dp else 0.dp,
                    color = if (isSelected) Color(0xFF5A75FF) else Color.Transparent,
                    shape = RoundedCornerShape(24.dp)
                )
                .clickable(onClick = onClick),
            contentAlignment = Alignment.Center
        ) {
            // Avatar Placeholder (blue face vs pink face based on the screenshot)
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .background(
                        if (gender == "男") Color(0xFFC0D2FF) else Color(0xFFFFD1CF),
                        RoundedCornerShape(50.dp)
                    )
            ) {
                // Mockup of black hair
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(40.dp)
                        .background(
                            Color.Black,
                            RoundedCornerShape(topStart = 50.dp, topEnd = 50.dp, bottomStart = 10.dp, bottomEnd = 10.dp)
                        )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = gender,
            fontSize = 18.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF1E1E1E)
        )
    }
}
