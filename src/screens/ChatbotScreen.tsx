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
import { useNavigation } from "@react-navigation/native"; // Thêm
import { Ionicons } from "@expo/vector-icons"; // Thêm
// import ChatMessage from "../components/ChatMessage"; // Đã XÓA
import TypingIndicator from "../components/TypingIndicator";
import ChatbotIcon from "../components/ChatbotIcon";

// --- Bảng màu được tinh chỉnh ---
const primaryBlue = "#0194F3";
const lightBlueBackground = "#F0F8FF";
const whiteBackground = "#FFFFFF";
const darkText = "#1A2C2C";
const greyText = "#718096";
const userBubbleBackground = primaryBlue;
const buttonDisabledBackground = "#CBD5E0";
const borderColorLight = "#E2E8F0";

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

// --- Component ChatMessage (Định nghĩa nội tuyến, đã tinh chỉnh) ---
const ChatMessage: React.FC<{ chat: ChatMessageType }> = ({ chat }) => {
  if (chat.hideInChat) return null;

  const isUser = chat.role === "user";

  return (
    <View
      style={[
        styles.messageWrapperBase,
        isUser ? styles.messageWrapperUser : styles.messageWrapperBot,
      ]}
    >
      {!isUser && (
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <ChatbotIcon width={18} height={18} color="#fff" />
          </View>
        </View>
      )}

      <View
        style={[
          styles.messageBubbleBase,
          isUser ? styles.userMessage : styles.botMessage,
          chat.isError ? styles.errorMessage : null,
        ]}
      >
        <Text
          style={[
            styles.messageTextBase,
            isUser ? styles.messageTextUser : styles.messageTextBot,
          ]}
        >
          {chat.text}
        </Text>
      </View>
    </View>
  );
};

export const ChatbotScreen: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // --- Logic Keyboard từ code gốc CỦA BẠN ---
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // ------------------------------------

  const flatListRef = useRef<FlatList<ChatMessageType>>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const [tours, setTours] = useState([]);
  const navigation = useNavigation(); // Thêm

  // --- Logic Keyboard từ code gốc CỦA BẠN ---
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
  // ------------------------------------

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
    if (chatHistory.length > 0) {
        flatListRef.current?.scrollToEnd({ animated: true });
    }
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

  // --- Logic handleSend từ code gốc CỦA BẠN ---
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
  // ------------------------------------

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor={whiteBackground} />
      {/* --- Header Đẹp (Đã thêm nút back) --- */}
      <View
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={darkText} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTitleRow}>
            <ChatbotIcon
              width={24}
              height={24}
              color={primaryBlue}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Travel Assistant</Text>
          </View>
          <Text style={styles.headerSubtitle}>Chúng tôi sẵn sàng giúp bạn</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>
      {/* ------------------------------------ */}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // --- Logic Keyboard từ code gốc CỦA BẠN ---
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <ChatMessage chat={item} />} // Dùng component nội tuyến
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ChatbotIcon
                width={60}
                height={60}
                color={greyText}
                style={{ marginBottom: 15 }}
              />
              <Text style={styles.emptyStateText}>
                Chào mừng bạn đến với Travel Assistant!{"\n"}Hãy đặt câu hỏi về
                các tour du lịch, điểm đến, hoặc bất cứ điều gì bạn muốn biết.
              </Text>
            </View>
          }
        />

        {isLoading && (
          <Animated.View
            style={[styles.loadingContainer, { opacity: fadeAnim }]}
          >
            <View
              style={[
                styles.messageWrapperBase,
                styles.messageWrapperBot,
              ]}
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <ChatbotIcon width={18} height={18} color="#fff" />
                </View>
              </View>
              <View style={[styles.messageBubbleBase, styles.botMessage]}>
                <TypingIndicator size={10} color={darkText} />
              </View>
            </View>
          </Animated.View>
        )}

        {/* --- Input Container (Kết hợp Style đẹp + Logic gốc) --- */}
        <View
          style={[
            styles.inputContainer, // Style đẹp
            {
              // Logic Keyboard từ code gốc CỦA BẠN
              paddingBottom: keyboardVisible ? 0 : Math.max(insets.bottom, 12),
              height: 90,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <TextInput
            style={styles.input} // Style đẹp
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor={greyText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton, // Style đẹp
              (!message.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!message.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
        {/* ------------------------------------ */}
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- StyleSheet Đẹp ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightBlueBackground,
  },
  header: {
    backgroundColor: whiteBackground,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderColorLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: -5,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: darkText,
  },
  headerSubtitle: {
    fontSize: 14,
    color: greyText,
  },
  headerRightPlaceholder: {
    width: 40,
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
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontSize: 15,
    color: greyText,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingContainer: {
    paddingVertical: 6,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  messageWrapperBase: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    maxWidth: "85%",
  },
  messageWrapperBot: {
    alignSelf: "flex-start",
  },
  messageWrapperUser: {
    alignSelf: "flex-end",
  },
  iconContainer: {
    marginRight: 8,
    marginBottom: 2,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: primaryBlue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBubbleBase: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  botMessage: {
    backgroundColor: whiteBackground,
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  userMessage: {
    backgroundColor: userBubbleBackground,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  errorMessage: {
    backgroundColor: "#FFEBEE",
    borderColor: "#EF5350",
    borderWidth: 1,
  },
  messageTextBase: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextBot: {
    color: darkText,
  },
  messageTextUser: {
    color: whiteBackground,
  },
  inputContainer: {
    flexDirection: "row",
    // alignItems: "flex-end", // Bị ghi đè bởi inline style
    paddingTop: 12, // Điều chỉnh padding
    paddingHorizontal: 15,
    backgroundColor: whiteBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderColorLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  input: {
    flex: 1,
    backgroundColor: lightBlueBackground,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10, // Điều chỉnh padding
    fontSize: 16,
    color: darkText,
    maxHeight: 100, // Giữ lại từ code gốc
    // minHeight: 45, // Bỏ, để container `height: 90` xử lý
    textAlignVertical: "top", // Giữ lại từ code gốc
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: borderColorLight,
  },
  sendButton: {
    backgroundColor: primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    height: 45, // Đặt chiều cao cố định cho nút
  },
  sendButtonDisabled: {
    backgroundColor: buttonDisabledBackground,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: whiteBackground,
    fontWeight: "600",
    fontSize: 16,
  },
});