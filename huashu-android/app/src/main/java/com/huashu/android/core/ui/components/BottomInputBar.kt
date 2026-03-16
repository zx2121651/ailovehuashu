package com.huashu.android.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import com.huashu.android.core.ui.theme.ColorTokens
import com.huashu.android.core.ui.theme.DimenTokens
import com.huashu.android.core.ui.theme.TypeTokens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BottomInputBar(
    onSend: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var textState by remember { mutableStateOf(TextFieldValue("")) }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .fillMaxWidth()
            .background(ColorTokens.SurfaceWhite)
            .navigationBarsPadding()
            .imePadding()
            .padding(horizontal = DimenTokens.SpacingMedium, vertical = DimenTokens.SpacingSmall)
    ) {
        OutlinedTextField(
            value = textState,
            onValueChange = { textState = it },
            placeholder = {
                Text(
                    text = "粘贴对方的话，帮你回...",
                    style = TypeTokens.BodyMedium.copy(color = ColorTokens.TextSecondary)
                )
            },
            shape = RoundedCornerShape(DimenTokens.CornerPill),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = ColorTokens.BrandPink,
                unfocusedBorderColor = ColorTokens.Background,
                containerColor = ColorTokens.Background
            ),
            modifier = Modifier.weight(1f),
            maxLines = 3
        )

        Spacer(modifier = Modifier.width(DimenTokens.SpacingSmall))

        Button(
            onClick = {
                if (textState.text.isNotBlank()) {
                    onSend(textState.text)
                    textState = TextFieldValue("")
                }
            },
            shape = RoundedCornerShape(DimenTokens.CornerPill),
            colors = ButtonDefaults.buttonColors(
                containerColor = ColorTokens.ButtonDark,
                contentColor = ColorTokens.TextWhite
            )
        ) {
            Text(text = "生成", style = TypeTokens.LabelSmall)
        }
    }
}
