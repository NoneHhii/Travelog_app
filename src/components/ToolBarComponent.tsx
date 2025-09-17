import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  Text,
} from "react-native";
import { colors } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";

interface toolProps {
  bill?: boolean;
}

export const ToolBarComponent: React.FC<toolProps> = ({ bill = false }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.navigate("Search" as never)}
        style={styles.input}
      >
        <Image
          source={require("../../assets/searchIcon.png")}
          style={{ marginRight: 3 }}
        />
        <Text style={{ color: "#8A8A8A" }}>
          Super sale 10.10 with 30% dea...
        </Text>
      </Pressable>
      <View style={styles.tools}>
        <Image source={require("../../assets/noti.png")} style={styles.icon} />
        <Image source={require("../../assets/chat.png")} style={styles.icon} />
        {bill && (
          <Image
            source={require("../../assets/purchase.png")}
            style={styles.icon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.themeGra1,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },

  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    flex: 1,
    paddingHorizontal: 12,
    // paddingVertical: 3,
    marginRight: 10,
    height: 50,
  },

  tools: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginLeft: 16,
  },
});
