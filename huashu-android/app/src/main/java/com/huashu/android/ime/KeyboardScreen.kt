package com.huashu.android.ime

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.huashu.android.core.ui.theme.HuashuAndroidTheme

@Composable
fun KeyboardScreen(
    onCommitText: (String) -> Unit,
    onDelete: () -> Unit
) {
    // Mock state for Pinyin composing text (would be provided by LibPinyin)
    var composingText by remember { mutableStateOf("") }

    // Mock candidates from Pinyin decoder
    val candidates = if (composingText.isNotEmpty()) {
        listOf("我", "我们", "卧槽", "卧", "哇")
    } else {
        emptyList()
    }

    HuashuAndroidTheme {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFEFEFEF))
                .padding(8.dp)
        ) {
            // Header: Lovekey Smart Features or Candidates
            if (candidates.isNotEmpty() || composingText.isNotEmpty()) {
                CandidateView(
                    composingText = composingText,
                    candidates = candidates,
                    onCandidateSelected = { candidate ->
                        onCommitText(candidate)
                        composingText = "" // Reset composing text
                    }
                )
            } else {
                // Lovekey Feature Bar
                LovekeyFeatureBar(onFeatureClick = { featureText ->
                    onCommitText(featureText)
                })
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Main Keyboard Keys (Mocked for simplicity)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                KeyboardKey("Q") { composingText += "q" }
                KeyboardKey("W") { composingText += "w" }
                KeyboardKey("E") { composingText += "e" }
                KeyboardKey("R") { composingText += "r" }
                KeyboardKey("T") { composingText += "t" }
                KeyboardKey("Y") { composingText += "y" }
                KeyboardKey("U") { composingText += "u" }
                KeyboardKey("I") { composingText += "i" }
                KeyboardKey("O") { composingText += "o" }
                KeyboardKey("P") { composingText += "p" }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                KeyboardKey("A") { composingText += "a" }
                KeyboardKey("S") { composingText += "s" }
                KeyboardKey("D") { composingText += "d" }
                KeyboardKey("F") { composingText += "f" }
                KeyboardKey("G") { composingText += "g" }
                KeyboardKey("H") { composingText += "h" }
                KeyboardKey("J") { composingText += "j" }
                KeyboardKey("K") { composingText += "k" }
                KeyboardKey("L") { composingText += "l" }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                KeyboardKey("Z") { composingText += "z" }
                KeyboardKey("X") { composingText += "x" }
                KeyboardKey("C") { composingText += "c" }
                KeyboardKey("V") { composingText += "v" }
                KeyboardKey("B") { composingText += "b" }
                KeyboardKey("N") { composingText += "n" }
                KeyboardKey("M") { composingText += "m" }
                KeyboardKey("DEL", color = Color(0xFFD3D3D3)) {
                    if (composingText.isNotEmpty()) {
                        composingText = composingText.dropLast(1)
                    } else {
                        onDelete()
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                KeyboardKey("SPACE", modifier = Modifier.weight(1f)) {
                    if (composingText.isNotEmpty() && candidates.isNotEmpty()) {
                        onCommitText(candidates.first())
                        composingText = ""
                    } else {
                        onCommitText(" ")
                    }
                }
                Spacer(modifier = Modifier.width(8.dp))
                KeyboardKey("ENTER", modifier = Modifier.weight(0.3f), color = Color(0xFFFF6B8B)) {
                    onCommitText("\n")
                }
            }
        }
    }
}

@Composable
fun CandidateView(composingText: String, candidates: List<String>, onCandidateSelected: (String) -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().background(Color.White).padding(8.dp)) {
        Text("拼音: $composingText", color = Color.Gray, fontSize = 12.sp)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            items(candidates) { candidate ->
                Text(
                    text = candidate,
                    fontSize = 18.sp,
                    modifier = Modifier.clickable { onCandidateSelected(candidate) }
                )
            }
        }
    }
}

@Composable
fun LovekeyFeatureBar(onFeatureClick: (String) -> Unit) {
    LazyRow(
        modifier = Modifier.fillMaxWidth().background(Color.White).padding(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text("✨ 帮我回", color = Color(0xFFFF6B8B), modifier = Modifier.clickable { onFeatureClick("你吃饭了吗？") })
        }
        item {
            Text("💡 找话题", color = Color(0xFFFF6B8B), modifier = Modifier.clickable { onFeatureClick("最近在看什么电影？") })
        }
        item {
            Text("🎁 撩人表情", color = Color(0xFFFF6B8B), modifier = Modifier.clickable { onFeatureClick("[玫瑰]") })
        }
    }
}

@Composable
fun KeyboardKey(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = Color.White,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .padding(horizontal = 2.dp)
            .background(color, shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .height(48.dp)
            .widthIn(min = 32.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(text, fontSize = 16.sp, color = if (color == Color.White || color == Color(0xFFD3D3D3)) Color.Black else Color.White)
    }
}
