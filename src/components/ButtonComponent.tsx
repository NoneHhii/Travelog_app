import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { fontFamilies } from "../types/fontFamilies";
import { TextComponent } from "./TextComponent";

interface ButtonProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  onPress: () => void;
  disable?: boolean;
  iconFlex?: "left" | "right";
  type: "button" | "link" | "text";
  icon?: ReactNode;
  textFont?: string;
  bold?: boolean; // 👈 thêm prop bold
}

export const ButtonComponent: React.FC<ButtonProps> = ({
  text,
  backgroundColor = "#2196F3",
  textColor = colors.white,
  borderRadius,
  onPress,
  disable = false,
  iconFlex,
  type,
  icon,
  textFont,
}) => {
  return type === "button" ? (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor, borderRadius },
          disable && styles.disable,
        ]}
        onPress={onPress}
        disabled={disable}
      >
        {icon && iconFlex === "left" && icon}
        <TextComponent
          text={text}
          color={textColor}
          styles={[styles.text]}
          flex={icon && iconFlex === "right" ? 1 : 0}
          font={textFont ?? fontFamilies.medium}
          fontWeight="bold" // 👈 thêm dòng này để chữ in đậm
        />
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity onPress={onPress}>
      <TextComponent
        text={text}
        flex={0}
        color={type === "link" ? colors.grey_text : colors.black}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 600,
  },
  disable: {
    opacity: 0.5,
  },
});
