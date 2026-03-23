package com.huashu.android.ime

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.outlined.Face
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.huashu.android.core.ui.theme.HuashuAndroidTheme
import com.huashu.android.ime.core.Rime
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

enum class KeyboardMode {
    ALPHABET, NUMERIC_SYMBOL
}

@Composable
fun KeyboardScreen(
    onCommitText: (String) -> Unit,
    onDelete: () -> Unit
) {
    var composingText by remember { mutableStateOf("") }
    var candidates by remember { mutableStateOf<List<String>>(emptyList()) }
    var currentMode by remember { mutableStateOf(KeyboardMode.ALPHABET) }
    var isShifted by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    fun updateCandidates(text: String) {
        scope.launch(Dispatchers.IO) {
            try {
                if (text.isEmpty()) {
                    Rime.processKey(android.view.KeyEvent.KEYCODE_ESCAPE, 0)
                    withContext(Dispatchers.Main) { candidates = emptyList() }
                    return@launch
                }

                Rime.processKey(android.view.KeyEvent.KEYCODE_ESCAPE, 0)

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
                .background(Color(0xFFF0EDF1)) // Soft warm grey background
                .padding(bottom = 8.dp)
        ) {
            // Top Bar: Candidates or Features
            if (candidates.isNotEmpty() || composingText.isNotEmpty()) {
                CandidateView(
                    composingText = composingText,
                    candidates = candidates,
                    onCandidateSelected = { candidate ->
                        onCommitText(candidate)
                        composingText = ""
                        updateCandidates("")
                        isShifted = false
                    }
                )
            } else {
                LovekeyFeatureBar(onFeatureClick = { featureText ->
                    onCommitText(featureText)
                })
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Keyboard Layouts
            when (currentMode) {
                KeyboardMode.ALPHABET -> {
                    AlphabeticKeyboardLayout(
                        isShifted = isShifted,
                        onKeyClick = { key ->
                            val text = if (isShifted) key.uppercase() else key.lowercase()
                            composingText += text
                            updateCandidates(composingText)
                            isShifted = false // Auto unshift after one char
                        },
                        onShiftClick = { isShifted = !isShifted },
                        onDeleteClick = {
                            if (composingText.isNotEmpty()) {
                                composingText = composingText.dropLast(1)
                                updateCandidates(composingText)
                            } else {
                                onDelete()
                            }
                        },
                        onModeSwitchClick = { currentMode = KeyboardMode.NUMERIC_SYMBOL },
                        onSpaceClick = {
                            if (composingText.isNotEmpty() && candidates.isNotEmpty()) {
                                onCommitText(candidates.first())
                                composingText = ""
                                updateCandidates("")
                            } else {
                                onCommitText(" ")
                            }
                        },
                        onEnterClick = { onCommitText("\n") }
                    )
                }
                KeyboardMode.NUMERIC_SYMBOL -> {
                    NumericSymbolKeyboardLayout(
                        onKeyClick = { key ->
                            onCommitText(key)
                        },
                        onModeSwitchClick = { currentMode = KeyboardMode.ALPHABET },
                        onDeleteClick = { onDelete() },
                        onSpaceClick = { onCommitText(" ") },
                        onEnterClick = { onCommitText("\n") }
                    )
                }
            }
        }
    }
}

@Composable
fun AlphabeticKeyboardLayout(
    isShifted: Boolean,
    onKeyClick: (String) -> Unit,
    onShiftClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onModeSwitchClick: () -> Unit,
    onSpaceClick: () -> Unit,
    onEnterClick: () -> Unit
) {
    val row1 = listOf("q", "w", "e", "r", "t", "y", "u", "i", "o", "p")
    val row2 = listOf("a", "s", "d", "f", "g", "h", "j", "k", "l")
    val row3 = listOf("z", "x", "c", "v", "b", "n", "m")

    Column(modifier = Modifier.padding(horizontal = 4.dp)) {
        // Row 1
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            row1.forEach { key ->
                KeyboardKey(text = if (isShifted) key.uppercase() else key, onClick = { onKeyClick(key) })
            }
        }
        Spacer(modifier = Modifier.height(6.dp))

        // Row 2
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            row2.forEach { key ->
                KeyboardKey(text = if (isShifted) key.uppercase() else key, onClick = { onKeyClick(key) })
            }
        }
        Spacer(modifier = Modifier.height(6.dp))

        // Row 3
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            // Shift Key
            SpecialKey(
                icon = Icons.Default.KeyboardArrowUp,
                color = if (isShifted) Color.White else Color(0xFFD2CDD5),
                modifier = Modifier.weight(1.5f)
            ) { onShiftClick() }

            Spacer(modifier = Modifier.width(6.dp))

            Row(modifier = Modifier.weight(7f), horizontalArrangement = Arrangement.SpaceEvenly) {
                row3.forEach { key ->
                    KeyboardKey(text = if (isShifted) key.uppercase() else key, onClick = { onKeyClick(key) })
                }
            }

            Spacer(modifier = Modifier.width(6.dp))

            // Delete Key
            SpecialKey(
                icon = Icons.Default.Clear, // Use clear/backspace icon
                color = Color(0xFFD2CDD5),
                modifier = Modifier.weight(1.5f)
            ) { onDeleteClick() }
        }
        Spacer(modifier = Modifier.height(6.dp))

        // Row 4 (Bottom)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            // ?123 Mode switch
            SpecialKey(text = "?123", color = Color(0xFFD2CDD5), modifier = Modifier.weight(1.5f)) { onModeSwitchClick() }
            Spacer(modifier = Modifier.width(6.dp))

            // Emoji/Comma
            SpecialKey(icon = Icons.Outlined.Face, color = Color(0xFFD2CDD5), modifier = Modifier.weight(1f)) { onKeyClick(",") }
            Spacer(modifier = Modifier.width(6.dp))

            // Space Bar
            KeyboardKey(text = "空格", color = Color.White, modifier = Modifier.weight(4f)) { onSpaceClick() }
            Spacer(modifier = Modifier.width(6.dp))

            // Period
            SpecialKey(text = ".", color = Color(0xFFD2CDD5), modifier = Modifier.weight(1f)) { onKeyClick(".") }
            Spacer(modifier = Modifier.width(6.dp))

            // Enter / Send
            SpecialKey(
                icon = Icons.AutoMirrored.Filled.Send,
                color = Color(0xFFFF4D8C), // Lovekey Pink
                iconTint = Color.White,
                modifier = Modifier.weight(1.5f)
            ) { onEnterClick() }
        }
    }
}

@Composable
fun NumericSymbolKeyboardLayout(
    onKeyClick: (String) -> Unit,
    onModeSwitchClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onSpaceClick: () -> Unit,
    onEnterClick: () -> Unit
) {
    val row1 = listOf("1", "2", "3", "4", "5", "6", "7", "8", "9", "0")
    val row2 = listOf("@", "#", "$", "_", "&", "-", "+", "(", ")", "/")
    val row3 = listOf("*", "\"", "'", ":", ";", "!", "?")

    Column(modifier = Modifier.padding(horizontal = 4.dp)) {
        // Row 1
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            row1.forEach { key -> KeyboardKey(text = key, onClick = { onKeyClick(key) }) }
        }
        Spacer(modifier = Modifier.height(6.dp))

        // Row 2
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            row2.forEach { key -> KeyboardKey(text = key, onClick = { onKeyClick(key) }) }
        }
        Spacer(modifier = Modifier.height(6.dp))

        // Row 3
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            SpecialKey(text = "=\\<", color = Color(0xFFD2CDD5), modifier = Modifier.weight(1.5f)) { /* Toggle more symbols */ }
            Spacer(modifier = Modifier.width(6.dp))
            Row(modifier = Modifier.weight(7f), horizontalArrangement = Arrangement.SpaceEvenly) {
                row3.forEach { key -> KeyboardKey(text = key, onClick = { onKeyClick(key) }) }
            }
            Spacer(modifier = Modifier.width(6.dp))
            SpecialKey(icon = Icons.Default.Clear, color = Color(0xFFD2CDD5), modifier = Modifier.weight(1.5f)) { onDeleteClick() }
        }
        Spacer(modifier = Modifier.height(6.dp))

        // Row 4 (Bottom)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            SpecialKey(text = "ABC", color = Color(0xFFD2CDD5), modifier = Modifier.weight(1.5f)) { onModeSwitchClick() }
            Spacer(modifier = Modifier.width(6.dp))
            SpecialKey(text = ",", color = Color(0xFFD2CDD5), modifier = Modifier.weight(1f)) { onKeyClick(",") }
            Spacer(modifier = Modifier.width(6.dp))
            KeyboardKey(text = "空格", color = Color.White, modifier = Modifier.weight(4f)) { onSpaceClick() }
            Spacer(modifier = Modifier.width(6.dp))
            SpecialKey(text = ".", color = Color(0xFFD2CDD5), modifier = Modifier.weight(1f)) { onKeyClick(".") }
            Spacer(modifier = Modifier.width(6.dp))
            SpecialKey(icon = Icons.AutoMirrored.Filled.Send, color = Color(0xFFFF4D8C), iconTint = Color.White, modifier = Modifier.weight(1.5f)) { onEnterClick() }
        }
    }
}

@Composable
fun CandidateView(composingText: String, candidates: List<String>, onCandidateSelected: (String) -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().background(Color.White).padding(8.dp)) {
        if (composingText.isNotEmpty()) {
            Text(composingText, color = Color(0xFFFF4D8C), fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 4.dp, bottom = 4.dp))
        }
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(horizontal = 4.dp)
        ) {
            items(candidates) { candidate ->
                Text(
                    text = candidate,
                    fontSize = 18.sp,
                    color = Color(0xFF222222),
                    modifier = Modifier.clickable { onCandidateSelected(candidate) }.padding(vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
fun LovekeyFeatureBar(onFeatureClick: (String) -> Unit) {
    LazyRow(
        modifier = Modifier.fillMaxWidth().background(Color.White).padding(vertical = 8.dp, horizontal = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 4.dp)
    ) {
        item { FeatureChip("✨ 截图帮回", Color(0xFFFF4D8C), Color(0xFFFFF0F5)) { onFeatureClick("[截图帮回]") } }
        item { FeatureChip("💡 冷场救星", Color(0xFF9E70FF), Color(0xFFF3EFFF)) { onFeatureClick("[冷场话题]") } }
        item { FeatureChip("🎁 哄哄模拟器", Color(0xFF00C6FF), Color(0xFFE5F8FF)) { onFeatureClick("[哄哄模拟器]") } }
    }
}

@Composable
fun FeatureChip(text: String, textColor: Color, bgColor: Color, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(bgColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(text, fontSize = 14.sp, color = textColor, fontWeight = FontWeight.Medium)
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
            .background(color, shape = RoundedCornerShape(6.dp))
            .clickable(onClick = onClick)
            .height(46.dp)
            .widthIn(min = 32.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontSize = 20.sp,
            color = Color(0xFF1E1E1E),
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun SpecialKey(
    text: String? = null,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier,
    color: Color = Color(0xFFD2CDD5),
    iconTint: Color = Color(0xFF1E1E1E),
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .padding(horizontal = 2.dp)
            .background(color, shape = RoundedCornerShape(6.dp))
            .clickable(onClick = onClick)
            .height(46.dp),
        contentAlignment = Alignment.Center
    ) {
        if (icon != null) {
            Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(24.dp))
        } else if (text != null) {
            Text(text = text, fontSize = 14.sp, color = Color(0xFF1E1E1E), fontWeight = FontWeight.Bold)
        }
    }
}
