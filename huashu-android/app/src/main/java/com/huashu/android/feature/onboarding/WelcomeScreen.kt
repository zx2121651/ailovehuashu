package com.huashu.android.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun WelcomeScreen(
    onAgreeClick: () -> Unit,
    onDisagreeClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF5A75FF)) // The blue background from screenshot
            .padding(horizontal = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Mockup of the keyboard logo (a white rounded box with yellow face)
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(Color.White, RoundedCornerShape(24.dp)),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(Color(0xFFFFEA3A), RoundedCornerShape(30.dp))
            ) {
                // Happy face mock
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        Text(
            text = "欢迎来到Lovekey",
            color = Color.White,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Start
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "为了给您提供更全面的服务。我们将通过《用户协议》和《隐私协议》帮助您了解我们收集、使用、存储和共享个人信息的情况，特别是我们所采集的个人信息类型与用途的对应关系。此外，您还能了解到您所享有的相关权利及实现途径。如您同意，请点击下方按钮开始接受我们的服务。",
            color = Color.White.copy(alpha = 0.8f),
            fontSize = 14.sp,
            lineHeight = 20.sp,
            textAlign = TextAlign.Start
        )

        Spacer(modifier = Modifier.height(64.dp))

        Button(
            onClick = onAgreeClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(28.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Black,
                contentColor = Color.White
            )
        ) {
            Text(text = "同意并进入", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(
            onClick = onDisagreeClick,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "不同意",
                color = Color.White.copy(alpha = 0.8f),
                fontSize = 16.sp
            )
        }
    }
}
