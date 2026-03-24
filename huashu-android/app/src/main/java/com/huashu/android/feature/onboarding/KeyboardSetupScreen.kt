package com.huashu.android.feature.onboarding

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens
import kotlinx.coroutines.delay

@Composable
fun KeyboardSetupScreen(
    onNextClick: () -> Unit
) {
    val context = LocalContext.current
    var isKeyboardEnabled by remember { mutableStateOf(false) }
    var isKeyboardSelected by remember { mutableStateOf(false) }

    // Simple check (in a real app, you'd use InputMethodManager to verify if LovekeyIMEService is enabled/selected)
    LaunchedEffect(Unit) {
        while(true) {
            val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            val enabledMethods = imm.enabledInputMethodList
            isKeyboardEnabled = enabledMethods.any { it.packageName == context.packageName }

            // To check if it's default requires reading secure settings, which is complex.
            // We'll trust the user if they clicked it, or do a simplified check.

            delay(1000) // Poll every second
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFF9FA)) // Extremely light warm grey/pale pink
            .padding(DimenTokens.SpacingLarge),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(48.dp))

        // Top Illustration / Icon placeholder
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(Color(0xFFFFE0E8), RoundedCornerShape(50.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text("💖", fontSize = 48.sp)
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Headline
        Text(
            text = "启用恋爱键盘",
            style = TypeTokens.HeadlineLarge.copy(color = ColorTokens.TextPrimary),
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(48.dp))

        // Step 1
        SetupStepCard(
            stepNumber = "1",
            title = "去设置开启恋爱键盘",
            subtitle = "允许键盘在其他应用中使用",
            buttonText = if (isKeyboardEnabled) "已开启" else "去开启",
            isCompleted = isKeyboardEnabled,
            onButtonClick = {
                context.startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
            }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Step 2
        SetupStepCard(
            stepNumber = "2",
            title = "切换为恋爱键盘",
            subtitle = "将系统输入法切换为您刚刚开启的键盘",
            buttonText = "去切换",
            isCompleted = isKeyboardSelected, // Mocked
            onButtonClick = {
                val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                imm.showInputMethodPicker()
                isKeyboardSelected = true // Mock state change
            }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Step 3
        SetupStepCard(
            stepNumber = "3",
            title = "测试输入效果",
            subtitle = "在此处输入试试看，体验极速高情商回复",
            buttonText = "",
            isCompleted = false,
            onButtonClick = {}
        )

        // Input test area for step 3
        OutlinedTextField(
            value = "",
            onValueChange = {},
            placeholder = { Text("点击测试键盘...") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = ColorTokens.BrandPink,
                unfocusedBorderColor = Color(0xFFE5DADE),
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White
            )
        )

        Spacer(modifier = Modifier.weight(1f))

        // Bottom Button
        Button(
            onClick = onNextClick,
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
                    text = "完成设置，开启高情商聊天",
                    style = TypeTokens.TitleMedium.copy(color = Color.White)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun SetupStepCard(
    stepNumber: String,
    title: String,
    subtitle: String,
    buttonText: String,
    isCompleted: Boolean,
    onButtonClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp) // Flat design
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Number Circle
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(if (isCompleted) Color(0xFFFF709C) else Color(0xFFF5EFF0), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stepNumber,
                    color = if (isCompleted) Color.White else Color(0xFFB50357),
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Text
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, style = TypeTokens.TitleSmall.copy(color = Color(0xFF302E2F)))
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = subtitle, style = TypeTokens.LabelSmall.copy(color = Color.Gray))
            }

            // Button
            if (buttonText.isNotEmpty()) {
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = onButtonClick,
                    enabled = !isCompleted,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF709C),
                        disabledContainerColor = Color(0xFFF5EFF0),
                        disabledContentColor = Color.Gray
                    ),
                    shape = RoundedCornerShape(20.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text(buttonText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
