package com.huashu.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.huashu.android.core.ui.theme.HuashuAndroidTheme
import com.huashu.android.feature.home.HomeScreen
import com.huashu.android.feature.chat_booster.ChatBoosterScreen
import com.huashu.android.feature.onboarding.WelcomeScreen
import com.huashu.android.feature.onboarding.GenderSelectionScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HuashuAndroidTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HuashuNavGraph()
                }
            }
        }
    }
}

@Composable
fun HuashuNavGraph() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "welcome") {
        composable("welcome") {
            WelcomeScreen(
                onAgreeClick = { navController.navigate("gender_selection") },
                onDisagreeClick = { /* Handle exit or info here if needed */ }
            )
        }
        composable("gender_selection") {
            GenderSelectionScreen(
                onNextClick = { gender ->
                    // Normally save gender preference here
                    navController.navigate("home") {
                        popUpTo("welcome") { inclusive = true }
                    }
                }
            )
        }
        composable("home") {
            HomeScreen(
                onNavigateToChatBooster = { navController.navigate("chat_booster") }
            )
        }
        composable("chat_booster") {
            ChatBoosterScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
