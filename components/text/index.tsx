import { Text as RNText, type TextProps } from "react-native";

import {
  Colors,
  FontFamily,
  Typography,
  type TypographyVariant,
} from "@/constants/theme";

type Weight = "regular" | "medium" | "semibold" | "bold" | "extrabold";

export type AppTextProps = TextProps & {
  /** Type role from the design system. Defaults to "body". */
  variant?: TypographyVariant;
  /** Override the weight within the variant's typeface. */
  weight?: Weight;
  /** Token-friendly text color. Falls back to the themed text color. */
  color?: string;
};

const DISPLAY_VARIANTS: TypographyVariant[] = ["hero", "display", "title", "heading"];
const DATA_VARIANTS: TypographyVariant[] = ["data", "dataLg"];

function familyFor(variant: TypographyVariant, weight?: Weight) {
  if (!weight) return undefined;
  const group = DISPLAY_VARIANTS.includes(variant)
    ? FontFamily.display
    : DATA_VARIANTS.includes(variant)
      ? FontFamily.data
      : FontFamily.body;
  // `group` may not have every weight (e.g. data has no "medium") — guard.
  return (group as Record<string, string>)[weight];
}

export default function Text({
  variant = "body",
  weight,
  color,
  style,
  ...rest
}: AppTextProps) {
  const base = Typography[variant];
  const overrideFamily = familyFor(variant, weight);

  return (
    <RNText
      style={[
        base,
        overrideFamily ? { fontFamily: overrideFamily } : null,
        { color: color ?? Colors.text },
        style,
      ]}
      {...rest}
    />
  );
}
