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
import com.huashu.android.ime.core.Rime
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun KeyboardScreen(
    onCommitText: (String) -> Unit,
    onDelete: () -> Unit
) {
    var composingText by remember { mutableStateOf("") }
    var candidates by remember { mutableStateOf<List<String>>(emptyList()) }
    val scope = rememberCoroutineScope()

    fun updateCandidates(text: String) {
        scope.launch(Dispatchers.IO) {
            try {
                if (text.isEmpty()) {
                    Rime.processKey(android.view.KeyEvent.KEYCODE_ESCAPE, 0)
                    withContext(Dispatchers.Main) { candidates = emptyList() }
                    return@launch
                }

                // Clear previous session
                Rime.processKey(android.view.KeyEvent.KEYCODE_ESCAPE, 0)

                // Process each char
                for (char in text) {
                    val code = char.code
                    Rime.processKey(code, 0)
                }

                val context = Rime.getContext()
                val rimeCandidates = context?.candidates?.map { it.text } ?: emptyList()

                withContext(Dispatchers.Main) {
                    candidates = rimeCandidates
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    HuashuAndroidTheme {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFEFEFEF))
                .padding(8.dp)
        ) {
            if (candidates.isNotEmpty() || composingText.isNotEmpty()) {
                CandidateView(
                    composingText = composingText,
                    candidates = candidates,
                    onCandidateSelected = { candidate ->
                        onCommitText(candidate)
                        composingText = ""
                        updateCandidates("")
                    }
                )
            } else {
                LovekeyFeatureBar(onFeatureClick = { featureText ->
                    onCommitText(featureText)
                })
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Main Keyboard Keys
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                KeyboardKey("Q") { composingText += "q"; updateCandidates(composingText) }
                KeyboardKey("W") { composingText += "w"; updateCandidates(composingText) }
                KeyboardKey("E") { composingText += "e"; updateCandidates(composingText) }
                KeyboardKey("R") { composingText += "r"; updateCandidates(composingText) }
                KeyboardKey("T") { composingText += "t"; updateCandidates(composingText) }
                KeyboardKey("Y") { composingText += "y"; updateCandidates(composingText) }
                KeyboardKey("U") { composingText += "u"; updateCandidates(composingText) }
                KeyboardKey("I") { composingText += "i"; updateCandidates(composingText) }
                KeyboardKey("O") { composingText += "o"; updateCandidates(composingText) }
                KeyboardKey("P") { composingText += "p"; updateCandidates(composingText) }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                KeyboardKey("A") { composingText += "a"; updateCandidates(composingText) }
                KeyboardKey("S") { composingText += "s"; updateCandidates(composingText) }
                KeyboardKey("D") { composingText += "d"; updateCandidates(composingText) }
                KeyboardKey("F") { composingText += "f"; updateCandidates(composingText) }
                KeyboardKey("G") { composingText += "g"; updateCandidates(composingText) }
                KeyboardKey("H") { composingText += "h"; updateCandidates(composingText) }
                KeyboardKey("J") { composingText += "j"; updateCandidates(composingText) }
                KeyboardKey("K") { composingText += "k"; updateCandidates(composingText) }
                KeyboardKey("L") { composingText += "l"; updateCandidates(composingText) }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                KeyboardKey("Z") { composingText += "z"; updateCandidates(composingText) }
                KeyboardKey("X") { composingText += "x"; updateCandidates(composingText) }
                KeyboardKey("C") { composingText += "c"; updateCandidates(composingText) }
                KeyboardKey("V") { composingText += "v"; updateCandidates(composingText) }
                KeyboardKey("B") { composingText += "b"; updateCandidates(composingText) }
                KeyboardKey("N") { composingText += "n"; updateCandidates(composingText) }
                KeyboardKey("M") { composingText += "m"; updateCandidates(composingText) }
                KeyboardKey("DEL", color = Color(0xFFD3D3D3)) {
                    if (composingText.isNotEmpty()) {
                        composingText = composingText.dropLast(1)
                        updateCandidates(composingText)
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
                        updateCandidates("")
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
