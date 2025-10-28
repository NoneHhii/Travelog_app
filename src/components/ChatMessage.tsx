import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ChatbotIcon from "./ChatbotIcon";
import { colors } from "../constants/colors";

interface ChatMessageProps {
  chat: {
    hideInChat?: boolean;
    role: "user" | "model";
    text: string;
    isError?: boolean;
  };
}

export default function ChatMessage({ chat }: ChatMessageProps) {
  if (chat.hideInChat) return null;

  const isBot = chat.role === "model";

  return (
    <View
      style={[
        styles.messageWrapper,
        isBot ? styles.botWrapper : styles.userWrapper,
      ]}
    >
      {isBot && (
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={["#90cff9ff", "#0194F3"]}
            style={styles.iconCircle}
          >
            <MaterialCommunityIcons
              name="robot-outline"
              size={18}
              color={colors.white}
            />
          </LinearGradient>
        </View>
      )}
      <View
        style={[
          styles.messageContainer,
          isBot ? styles.botMessage : styles.userMessage,
          chat.isError && styles.errorMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isBot ? styles.botText : styles.userText,
            chat.isError && styles.errorText,
          ]}
        >
          {chat.text}
        </Text>
      </View>
      {!isBot && (
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={["#4CD964", "#34C759"]}
            style={styles.userIconCircle}
          >
            <MaterialCommunityIcons
              name="account"
              size={18}
              color={colors.white}
            />
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    maxWidth: "85%",
  },
  botWrapper: {
    alignSelf: "flex-start",
  },
  userWrapper: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  iconContainer: {
    marginHorizontal: 4,
    marginBottom: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0194F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  messageContainer: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botMessage: {
    backgroundColor: "#F0F4F8",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  userMessage: {
    backgroundColor: "#0194F3",
    borderBottomRightRadius: 4,
    shadowColor: "#0194F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  errorMessage: {
    backgroundColor: "#FFE5E5",
    borderColor: "#FF3B30",
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: "#0A2C4D",
  },
  userText: {
    color: "#FFFFFF",
    fontWeight: "400",
  },
  errorText: {
    color: "#FF3B30",
  },
});
