import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

interface MenuProps {
  url: any;
  title: string;
  bgColor?: string;
  size?: number;
}

export const MenuComponent: React.FC<MenuProps> = ({
  url,
  title,
  bgColor = colors.green,
  size = 40,
}) => {
  return (
    <View style={styles.contain}>
      <View style={[styles.circle, { backgroundColor: bgColor }]}>
        <Image source={url} style={[styles.img, {width: size, height: size}]}/>
      </View>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contain: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    resizeMode: "contain",
  },
  text: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});
