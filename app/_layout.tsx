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

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(app)/index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Semibold": require("../assets/fonts/Roboto-SemiBold.ttf"),
  });

  // 1. CORREÇÃO: Apenas registre o erro em produção, não dê throw.
  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar fontes:", error);
      // Opcional: Você pode reportar isso para um serviço como Sentry/Crashlytics aqui
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // useEffect(() => {
  //   // 2. CORREÇÃO: Configuração segura do RevenueCat
  //   Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  //   const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

  //   if (Platform.OS === "ios") {
  //     if (iosApiKey) {
  //       Purchases.configure({ apiKey: "test_MCfhnxGhNcvAIdwquSuOirfWzrv" });
  //     } else {
  //       // Se a chave não existir, registramos o erro em vez de crashar
  //       console.warn(
  //         "RevenueCat: Chave iOS não encontrada nas variáveis de ambiente.",
  //       );
  //     }
  //   }
  // }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#FFF",
            },
          }}
        >
          <Stack.Screen name="(app)/index" />
          <Stack.Screen name="(home)/index" />
        </Stack>

        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
