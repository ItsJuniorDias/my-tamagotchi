import { Text as CustomText } from "react-native";

export default function Text({ children, style, weight = "regular" }) {
  const objectFamily = {
    regular: "Roboto-Regular",
    bold: "Roboto-Bold",
    semibold: "Roboto-SemiBold",
  };

  return (
    <CustomText style={[{ fontFamily: objectFamily[weight] }, style]}>
      {children}
    </CustomText>
  );
}
