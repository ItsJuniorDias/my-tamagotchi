/**
 * ────────────────────────────────────────────────────────────────────────────
 *  MY TAMAGOTCHI · DESIGN SYSTEM  (light-only)
 * ────────────────────────────────────────────────────────────────────────────
 *  Single source of truth for color, type, spacing, radius, shadow and motion.
 *
 *  Identity: "Incubator" — a premium, slightly magical creature-incubator.
 *  Brand accent is Aurora Violet (not the old Apple system blue).
 *  Currency (stars) is Star Gold. Stats use a friendly, candy-leaning quartet.
 *
 *  This app ships in LIGHT MODE only (locked via app.json userInterfaceStyle).
 *  `Colors` and `Gradients` are flat — there is no dark variant to branch on.
 *
 *  Usage:
 *    import { Colors, Typography, Spacing, Radius, Shadows, Motion } from "@/constants/theme";
 *    const c = Colors;
 * ────────────────────────────────────────────────────────────────────────────
 */

import { Platform } from "react-native";

/* ============================================================================
 * 1. RAW PALETTE  (never reference these directly in components — use Colors)
 * ========================================================================== */
const palette = {
  // — Brand · Aurora Violet ————————————————————————————————
  violet50: "#F3EEFF",
  violet100: "#E6DCFF",
  violet200: "#CDBBFF",
  violet300: "#AE92FF",
  violet400: "#8E69FF",
  violet500: "#6D4AFF", // primary
  violet600: "#5A39E6",
  violet700: "#4628B8",

  // — Currency · Star Gold ——————————————————————————————————
  gold300: "#FFD884",
  gold400: "#FFC24B",
  gold500: "#FFAA1C", // stars / coins
  gold600: "#F59000",

  // — Stat quartet (solid + soft tint) ——————————————————————
  coral: "#FF7A5C", // Hunger
  coralSoft: "rgba(255,122,92,0.16)",
  sun: "#FDB022", // Mood
  sunSoft: "rgba(253,176,34,0.16)",
  mint: "#2DD4A7", // Energy
  mintSoft: "rgba(45,212,167,0.16)",
  sky: "#4FB0FF", // Hygiene
  skySoft: "rgba(79,176,255,0.16)",

  // — Warm violet-tinted neutrals (ink) ——————————————————————
  ink900: "#15121F",
  ink800: "#221E32",
  ink700: "#3A3550",
  ink600: "#534D6B",
  ink500: "#6B6580", // secondary text
  ink400: "#938DA8",
  ink300: "#B8B2CC",
  ink200: "#DBD7E8",
  ink100: "#ECE9F4",
  ink50: "#F7F5FC", // app background
  white: "#FFFFFF",

  // — Semantic ————————————————————————————————————————————
  success: "#2FBF71",
  danger: "#FF4D5E",
} as const;

/* ============================================================================
 * 2. SEMANTIC COLORS  (flat, light-only). Keys marked `*` keep the old template
 *    API shape (icon / tabIcon*) alive for any lingering imports.
 * ========================================================================== */
export const Colors = {
  // text
  text: palette.ink900,
  textSecondary: palette.ink500,
  textMuted: palette.ink400,
  onPrimary: palette.white,

  // surfaces
  background: palette.ink50,
  backgroundElevated: palette.white,
  surface: palette.white,
  surfaceGlass: "rgba(255,255,255,0.55)",
  surfaceSunken: palette.ink100,
  glassBorder: "rgba(255,255,255,0.6)",
  border: "rgba(21,18,31,0.08)",
  overlay: "rgba(21,18,31,0.45)",

  // brand
  tint: palette.violet500,
  primary: palette.violet500,
  primaryPressed: palette.violet600,
  primarySoft: palette.violet50,
  accentStar: palette.gold500,
  accentStarSoft: "rgba(255,170,28,0.16)",

  // status / stats
  success: palette.success,
  danger: palette.danger,
  stat: {
    hunger: palette.coral,
    hungerSoft: palette.coralSoft,
    mood: palette.sun,
    moodSoft: palette.sunSoft,
    energy: palette.mint,
    energySoft: palette.mintSoft,
    hygiene: palette.sky,
    hygieneSoft: palette.skySoft,
  },

  // legacy template keys *
  icon: palette.ink500,
  tabIconDefault: palette.ink400,
  tabIconSelected: palette.violet500,
} as const;

/* ============================================================================
 * 3. GRADIENTS  (flat arrays for expo-linear-gradient)
 * ========================================================================== */
export const Gradients = {
  app: ["#FBFAFE", "#F2EEFC", "#EBE5FA"] as const,
  aurora: ["#8E69FF", "#6D4AFF", "#5A39E6"] as const,
  hatch: ["#F3EEFF", "#FBFAFE", "#FFE9CF"] as const,
} as const;

/* ============================================================================
 * 4. TYPOGRAPHY
 *    display = Fredoka (rounded, friendly)  · pet names, titles, hero
 *    body    = Plus Jakarta Sans            · labels, copy, buttons
 *    data    = Space Mono                   · numbers / HUD (LCD heritage)
 *    The strings below MUST match the keys registered in app/_layout.tsx.
 * ========================================================================== */
export const FontFamily = {
  display: {
    regular: "Fredoka_400Regular",
    medium: "Fredoka_500Medium",
    semibold: "Fredoka_600SemiBold",
    bold: "Fredoka_700Bold",
  },
  body: {
    regular: "PlusJakartaSans_400Regular",
    medium: "PlusJakartaSans_500Medium",
    semibold: "PlusJakartaSans_600SemiBold",
    bold: "PlusJakartaSans_700Bold",
    extrabold: "PlusJakartaSans_800ExtraBold",
  },
  data: {
    regular: "SpaceMono_400Regular",
    bold: "SpaceMono_700Bold",
  },
} as const;

export const Typography = {
  hero: { fontFamily: FontFamily.display.bold, fontSize: 40, lineHeight: 44, letterSpacing: -0.5 },
  display: { fontFamily: FontFamily.display.semibold, fontSize: 32, lineHeight: 36, letterSpacing: -0.4 },
  title: { fontFamily: FontFamily.display.semibold, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  heading: { fontFamily: FontFamily.display.medium, fontSize: 20, lineHeight: 26, letterSpacing: 0 },
  bodyLg: { fontFamily: FontFamily.body.regular, fontSize: 17, lineHeight: 25, letterSpacing: 0 },
  body: { fontFamily: FontFamily.body.regular, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  label: { fontFamily: FontFamily.body.semibold, fontSize: 14, lineHeight: 18, letterSpacing: 0 },
  button: { fontFamily: FontFamily.body.bold, fontSize: 16, lineHeight: 20, letterSpacing: 0 },
  caption: { fontFamily: FontFamily.body.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  overline: { fontFamily: FontFamily.body.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4 },
  data: { fontFamily: FontFamily.data.bold, fontSize: 16, lineHeight: 18, letterSpacing: -0.5 },
  dataLg: { fontFamily: FontFamily.data.bold, fontSize: 24, lineHeight: 26, letterSpacing: -1 },
} as const;

export type TypographyVariant = keyof typeof Typography;

/* Legacy `Fonts` export kept for any older imports (now points to the new faces). */
export const Fonts = Platform.select({
  default: {
    sans: FontFamily.body.regular,
    rounded: FontFamily.display.regular,
    serif: "serif",
    mono: FontFamily.data.regular,
  },
  web: {
    sans: "'Plus Jakarta Sans', system-ui, sans-serif",
    rounded: "'Fredoka', system-ui, sans-serif",
    serif: "Georgia, serif",
    mono: "'Space Mono', monospace",
  },
})!;

/* ============================================================================
 * 5. SPACING · RADIUS · MOTION  (4-pt base scale)
 * ========================================================================== */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 56,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  pill: 999,
} as const;

export const Motion = {
  duration: { fast: 180, base: 300, slow: 600 },
  spring: { damping: 15, stiffness: 150 },
  springSoft: { damping: 18, stiffness: 110 },
} as const;

/* ============================================================================
 * 6. SHADOWS  (cross-platform: iOS shadow* + Android elevation)
 * ========================================================================== */
export const Shadows = {
  none: {},
  soft: {
    shadowColor: palette.ink900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: palette.ink900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  floating: {
    shadowColor: palette.ink900,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 14,
  },
  /** Colored glow — pass a brand/stat color for primary buttons, badges, etc. */
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  }),
} as const;

/* Convenience default export */
const Theme = { Colors, Gradients, Typography, FontFamily, Fonts, Spacing, Radius, Motion, Shadows };
export default Theme;
