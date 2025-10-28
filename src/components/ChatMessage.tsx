import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ChatbotIcon from "./ChatbotIcon";

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
          <View style={styles.iconCircle}>
            <ChatbotIcon width={20} height={20} color="#fff" />
          </View>
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
          <View style={styles.userIconCircle}>
            <Text style={styles.userIconText}>Bạn</Text>
          </View>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  userIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  userIconText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  messageContainer: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botMessage: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    lineHeight: 20,
  },
  botText: {
    color: "#1C1C1E",
  },
  userText: {
    color: "#FFFFFF",
  },
  errorText: {
    color: "#FF3B30",
  },
});
