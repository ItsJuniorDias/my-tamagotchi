import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Mantém a Splash Screen visível enquanto os recursos carregam
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Garante que o deep linking ou recarregamento saiba para onde voltar
  initialRouteName: "(app)/index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Semibold": require("../assets/fonts/Roboto-SemiBold.ttf"),
  });

  // Log de erro de fontes (Apple style: tratar erro silenciosamente mas registrar)
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Esconde a splash screen com um pequeno delay para suavidade
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    // GestureHandlerRootView no topo permite gestos em qualquer tela do app
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom", // Transição suave estilo iOS
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#FFF",
            },
          }}
        >
          {/* Definição simplificada das telas principais */}
          <Stack.Screen name="(app)/index" />
          <Stack.Screen name="(home)/index" />
        </Stack>

        {/* Status bar adaptativa (branca no dark, preta no light) */}
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
