import React from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";

interface MenuProps {
  url: any;
  title: string;
  bgColor?: string;
  size?: number;
  onPress?: () => void;
}

export const MenuComponent: React.FC<MenuProps> = ({
  url,
  title,
  bgColor = "#EAF2FF", // Màu default pastel
  size = 30, // Kích thước icon bên trong
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.contain} onPress={onPress}>
      <View style={[styles.circle, { backgroundColor: bgColor }]}>
        <Image source={url} style={[styles.img, { width: size, height: size }]} />
      </View>
      <Text style={styles.text} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contain: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1, // Để chia đều trong row
    maxWidth: 80, // Giới hạn chiều rộng
  },
  circle: {
    width: 50, // Kích thước vòng tròn lớn hơn
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8, // Tăng khoảng cách
  },
  img: {
    resizeMode: "contain",
  },
  text: {
    fontSize: 11,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});