/**
 * RevenueCat configuration — single source of truth.
 *
 * Call `configureRevenueCat()` once at app startup (done in app/_layout.tsx).
 * The public SDK keys come from environment variables so they never live in
 * source control. Create a `.env` at the project root (see `.env.example`):
 *
 *   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxx
 *   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxxxxxx
 *
 * Then restart Metro with a cleared cache:  bunx expo start -c
 *
 * Without a key, the SDK is left unconfigured and `isPurchasesConfigured()`
 * stays false — the store surfaces a friendly message instead of crashing.
 */
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

let configured = false;

/** True once `Purchases.configure` has run successfully with a real key. */
export function isPurchasesConfigured() {
  return configured;
}

/** Configure the RevenueCat SDK for the current platform. Safe to call repeatedly. */
export function configureRevenueCat() {
  if (configured) return;

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  const apiKey = Platform.select({ ios: IOS_KEY, android: ANDROID_KEY });

  if (!apiKey) {
    const envName =
      Platform.OS === "android"
        ? "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY"
        : "EXPO_PUBLIC_REVENUECAT_IOS_KEY";
    console.warn(
      `[RevenueCat] No API key for ${Platform.OS}. Set ${envName} in your .env ` +
        `and restart with: bunx expo start -c`,
    );
    return;
  }

  Purchases.configure({ apiKey });
  configured = true;
}
