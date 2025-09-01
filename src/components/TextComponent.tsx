import React from "react";
import { StyleProp, TextStyle } from "react-native";
import { Text } from "react-native";
import { colors } from "../constants/colors";

interface TextProps {
    text: string;
    color?: string;
    size?: number;
    flex?:number;
    font?:string;
    styles?: StyleProp<TextStyle>,
    fontWeight?: TextStyle["fontWeight"];
}

export const TextComponent : React.FC<TextProps> = ({
    text,
    color,
    size,
    flex,
    font,
    styles,
    fontWeight
}) => {
    return (
        <Text style={[{
            color: color ?? colors.black,
            fontSize: size ?? 14,
            fontFamily: font,
            flex: flex ?? 0,
            fontWeight: fontWeight,
        }, styles]}>
            {text}
        </Text>
    )
}