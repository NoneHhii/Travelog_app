import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "@env";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";
import ChatbotIcon from "../components/ChatbotIcon";

interface ChatMessageType {
  hideInChat?: boolean;
  role: "user" | "model";
  text: string;
  isError?: boolean;
}

interface Tour {
  id: string;
  title: string;
  departurePoint: string;
  description: string;
  reviewCount: number;
  price: number;
  averageRating: number;
  duration: { days: number; nights: number };
  itinerary: { day: number; title: string; details: string }[];
}

export const ChatbotScreen: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const flatListRef = useRef<FlatList<ChatMessageType>>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
        // Tự động scroll xuống cuối khi keyboard hiện
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    setChatHistory([
      {
        role: "model",
        text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      },
    ]);

    const fetchTourInfo = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tours"));
        const data: Tour[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Tour, "id">),
        }));

        // ✅ Biến toàn bộ data thành text dễ đọc
        const tourSummary = data
          .map((tour) => {
            const days = tour.duration?.days || 0;
            const nights = tour.duration?.nights || 0;
            const itineraryText = tour.itinerary
              ?.map((d) => `Ngày ${d.day}: ${d.title} – ${d.details}`)
              .join("; ");

            return `
                      === ${tour.title} ===
                      📍 Khởi hành từ: ${tour.departurePoint}
                      🕒 Thời lượng: ${days} ngày ${nights} đêm
                      💰 Giá: ${tour.price.toLocaleString("vi-VN")}₫
                      ⭐ Đánh giá: ${tour.averageRating}/5 (${
              tour.reviewCount
            } lượt)
                      📖 Mô tả: ${tour.description}
                      🗓️ Lịch trình: ${itineraryText}
                    `;
          })
          .join("\n\n");
        // console.log(tourSummary);
        setChatHistory((prev) => [
          ...prev,
          {
            hideInChat: true,
            role: "model",
            text: `Dưới đây là danh sách các tour hiện có trong hệ thống:\n${tourSummary}`,
          },
        ]);

        setTours(data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu tour:", err);
      }
    };

    fetchTourInfo();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory]);

  const generateBotResponse = async (history: ChatMessageType[]) => {
    setIsLoading(true);
    const updateHistory = (text: string, isError = false) => {
      setChatHistory((prev) => [...prev, { role: "model", text, isError }]);
      setIsLoading(false);
    };

    const filtered = history
      .filter(({ text }) => typeof text === "string" && text.trim() !== "")
      .map(({ role, text }) => ({
        role,
        parts: [{ text }],
      }));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: filtered }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data?.error?.message || "Có lỗi xảy ra!");

      const apiResponseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text
          ?.replace(/\*\*(.*?)\*\*/g, "$1")
          ?.trim() || "Không có phản hồi từ bot.";

      updateHistory(apiResponseText);
    } catch (error: any) {
      updateHistory(error.message, true);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const newHistory: ChatMessageType[] = [
      ...chatHistory,
      { role: "user", text: message },
    ];

    setChatHistory(newHistory);
    setMessage("");
    generateBotResponse(newHistory);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Travel Assistant</Text>
        <Text style={styles.headerSubtitle}>Chúng tôi sẵn sàng giúp bạn</Text>
      </View>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <ChatMessage chat={item} />}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Chào mừng! Hãy đặt câu hỏi để bắt đầu trò chuyện
              </Text>
            </View>
          }
        />

        {isLoading && (
          <Animated.View
            style={[styles.loadingContainer, { opacity: fadeAnim }]}
          >
            <View style={styles.messageWrapper}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <ChatbotIcon width={20} height={20} color="#fff" />
                </View>
              </View>
              <View style={styles.botMessage}>
                <TypingIndicator size={10} color="#666" />
              </View>
            </View>
          </Animated.View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: keyboardVisible ? 0 : Math.max(insets.bottom, 12),
              height: 90,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              (!message.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!message.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#fff",
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 15,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  loadingContainer: {
    paddingVertical: 6,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    maxWidth: "85%",
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
  botMessage: {
    backgroundColor: "#E5E5EA",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1C1C1E",
    maxHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#C7C7CC",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
