import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { fontFamilies } from "../types/fontFamilies";
import { TextComponent } from "./TextComponent";

interface ButtonProps {
    text: string,
    backgroundColor?: string,
    textColor?: string,
    borderRadius?: number,
    onPress: () => void,
    disable?: boolean,
    iconFlex?: 'left' | 'right',
    type: 'button' | 'link' | 'text',
    icon?: ReactNode,
    textFont?: any,
    width?: any,
    height?: any,
    textSize?: number,
}

export const ButtonComponent : React.FC<ButtonProps> = ({
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
    width,
    height,
    textSize = 14,
}) => {
    return type === 'button' ? (
        <View style={{alignItems: 'center', width: "100%"}}>
            <TouchableOpacity 
                style={[
                    styles.button,
                    {backgroundColor},
                    disable && styles.disable,
                    {width: width, height: height},
                    {borderRadius: borderRadius > 0 ? borderRadius : 0}
                ]}
                onPress = {onPress}
                disabled = {disable}
            >
                {icon && iconFlex === 'left' && icon}
                <TextComponent
                    text={text}
                    color={textColor}
                    styles={[styles.text]}
                    flex={icon && iconFlex === 'right' ? 1 : 0}
                    font = {textFont ?? fontFamilies.medium}
                    fontWeight = {textFont ?? fontFamilies.medium}
                    size = {textSize}
                />
            </TouchableOpacity>
        </View>
    ) : (
        <TouchableOpacity onPress={onPress}>
            <TextComponent
                text={text}
                flex={0}
                color={type === 'link' ? colors.grey_text : colors.black}
                font = {textFont ?? fontFamilies.medium}
                fontWeight = {textFont ?? fontFamilies.medium}
                size = {textSize}
            />
        </TouchableOpacity>
    )
}

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
