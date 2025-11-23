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
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import TypingIndicator from "../components/TypingIndicator";
import ChatbotIcon from "../components/ChatbotIcon";
import { LinearGradient } from "expo-linear-gradient";
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from "@react-native-voice/voice";

// --- Bảng màu được tinh chỉnh (Super Product) ---
const primaryBlue = "#0194F3";
const primaryGradient = ["#0194F3", "#0077C2"] as const;
const lightBlueBackground = "#F7F9FC";
const whiteBackground = "#FFFFFF";
const darkText = "#1A2C2C";
const greyText = "#718096";
const borderColorLight = "#E2E8F0";
const buttonDisabledBackground = "#CBD5E0";

interface ChatMessageType {
  hideInChat?: boolean;
  role: "user" | "model";
  text: string;
  isError?: boolean;
  tourData?: Tour;
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
  images?: string[];
}

// --- Component RichText (Hiển thị Markdown đẹp mắt) ---
const RichText: React.FC<{ text: string; style?: any }> = ({ text, style }) => {
  const parseText = (input: string) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /(\*\*(.*?)\*\*)|(^\s*\*\s(.*?)$)|(###\s(.*?)$)/gm;
    let match;

    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: input.substring(lastIndex, match.index),
        });
      }

      if (match[1]) {
        parts.push({ type: "bold", content: match[2] });
      } else if (match[3]) {
        parts.push({ type: "list", content: match[4] });
      } else if (match[5]) {
        parts.push({ type: "header", content: match[6] });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < input.length) {
      parts.push({ type: "text", content: input.substring(lastIndex) });
    }

    return parts;
  };

  const parsed = parseText(text);

  return (
    <Text style={style}>
      {parsed.map((part, index) => {
        switch (part.type) {
          case "bold":
            return (
              <Text key={index} style={{ fontWeight: "bold", color: "#2D3748" }}>
                {part.content}
              </Text>
            );
          case "header":
            return (
              <Text
                key={index}
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: primaryBlue,
                  lineHeight: 24,
                }}
              >
                {"\n"}{part.content}{"\n"}
              </Text>
            );
          case "list":
            return (
              <Text key={index} style={{ lineHeight: 22 }}>
                {"\n"}• {part.content}
              </Text>
            );
          default:
            return <Text key={index}>{part.content}</Text>;
        }
      })}
    </Text>
  );
};

// --- Component TourCard (Siêu đẹp với gradient và image) ---
const TourCard: React.FC<{ tour: Tour; onPress: () => void }> = ({ tour, onPress }) => {
  const imageUrl = tour.images && tour.images.length > 0
    ? tour.images[0]
    : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

  return (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.tourImageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.tourImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.tourImageGradient}
        />
      </View>

      <View style={styles.tourCardContent}>
        <Text style={styles.tourCardTitle} numberOfLines={2}>
          {tour.title}
        </Text>

        <View style={styles.tourInfoRow}>
          <Ionicons name="location" size={14} color={primaryBlue} />
          <Text style={styles.tourInfoText} numberOfLines={1}>
            {tour.departurePoint}
          </Text>
        </View>

        <View style={styles.tourInfoRow}>
          <Ionicons name="time-outline" size={14} color={primaryBlue} />
          <Text style={styles.tourInfoText}>
            {tour.duration?.days || 0} ngày {tour.duration?.nights || 0} đêm
          </Text>
        </View>

        <View style={styles.tourInfoRow}>
          <Ionicons name="star" size={14} color="#FFA500" />
          <Text style={styles.tourInfoText}>
            {tour.averageRating}/5 ({tour.reviewCount} đánh giá)
          </Text>
        </View>

        <View style={styles.tourCardFooter}>
          <View style={styles.tourPriceContainer}>
            <Text style={styles.tourPriceLabel}>Giá từ</Text>
            <Text style={styles.tourPrice}>
              {tour.price.toLocaleString("vi-VN")}₫
            </Text>
          </View>

          <LinearGradient
            colors={primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewTourButton}
          >
            <Text style={styles.viewTourButtonText}>Xem Tour</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Component ChatMessage (Định nghĩa nội tuyến, siêu đẹp) ---
const ChatMessage: React.FC<{ chat: ChatMessageType; navigation: any }> = ({ chat, navigation }) => {
  if (chat.hideInChat) return null;

  const isUser = chat.role === "user";

  if (isUser) {
    return (
      <View style={[styles.messageWrapperBase, styles.messageWrapperUser]}>
        <LinearGradient
          colors={primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.messageBubbleBase, styles.userMessage]}
        >
          <Text style={[styles.messageTextBase, styles.messageTextUser]}>
            {chat.text}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      <View style={[styles.messageWrapperBase, styles.messageWrapperBot]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <ChatbotIcon width={18} height={18} color="#fff" />
          </View>
        </View>

        <View
          style={[
            styles.messageBubbleBase,
            styles.botMessage,
            chat.isError ? styles.errorMessage : null,
          ]}
        >
          <RichText
            text={chat.text}
            style={[styles.messageTextBase, styles.messageTextBot]}
          />
        </View>
      </View>

      {chat.tourData && (
        <View style={{ marginLeft: 46, marginTop: 8 }}>
          <TourCard
            tour={chat.tourData}
            onPress={() => navigation.navigate('TravelDetail', { travel: chat.tourData })}
          />
        </View>
      )}
    </View>
  );
};

export const ChatbotScreen: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const flatListRef = useRef<FlatList<ChatMessageType>>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const [tours, setTours] = useState<Tour[]>([]);
  const navigation = useNavigation();

  // Voice search state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
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

  // Voice recognition setup
  // useEffect(() => {
  //   Voice.onSpeechStart = onSpeechStart;
  //   Voice.onSpeechEnd = onSpeechEnd;
  //   Voice.onSpeechResults = onSpeechResults;
  //   Voice.onSpeechError = onSpeechError;

  //   return () => {
  //     Voice.destroy().then(Voice.removeAllListeners);
  //   };
  // }, []);

  // const onSpeechStart = (e: any) => {
  //   setIsRecording(true);
  //   setVoiceError(null);
  //   startPulseAnimation();
  // };

  // const onSpeechEnd = (e: any) => {
  //   setIsRecording(false);
  //   stopPulseAnimation();
  // };

  // const onSpeechResults = (e: SpeechResultsEvent) => {
  //   if (e.value && e.value[0]) {
  //     setMessage(e.value[0]);
  //     stopRecording();
  //   }
  // };

  // const onSpeechError = (e: SpeechErrorEvent) => {
  //   setIsRecording(false);
  //   stopPulseAnimation();
  //   setVoiceError(JSON.stringify(e.error));
  //   console.error("Voice error: ", e.error);
  // };

  // const startRecording = async () => {
  //   try {
  //     await Voice.start("vi-VN");
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const stopRecording = async () => {
  //   try {
  //     await Voice.stop();
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const handleVoiceButtonPress = () => {
  //   if (isRecording) {
  //     stopRecording();
  //   } else {
  //     startRecording();
  //   }
  // };

  // const startPulseAnimation = () => {
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(pulseAnim, {
  //         toValue: 1.2,
  //         duration: 500,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(pulseAnim, {
  //         toValue: 1,
  //         duration: 500,
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   ).start();
  // };

  // const stopPulseAnimation = () => {
  //   pulseAnim.setValue(1);
  //   pulseAnim.stopAnimation();
  // };

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

            return [
              `### ${tour.title}`,
              `* 📍 Khởi hành: ${tour.departurePoint}`,
              `* 🕒 Thời lượng: ${days} ngày ${nights} đêm`,
              `* 💰 Giá: ${tour.price.toLocaleString("vi-VN")}₫`,
              `* ⭐ Đánh giá: ${tour.averageRating}/5 (${tour.reviewCount} lượt)`,
              `* 📖 Mô tả: ${tour.description}`,
              `* 🗓️ Lịch trình: ${itineraryText}`,
            ].join("\n");
          })
          .join("\n\n");

        setChatHistory((prev) => [
          ...prev,
          {
            hideInChat: true,
            role: "model",
            text: `Dưới đây là danh sách các tour hiện có trong hệ thống. Hãy trả lời đẹp mắt bằng Markdown (bold cho nhấn mạnh, lists cho tính năng):\n${tourSummary}`,
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
    const updateHistory = (text: string, isError = false, tourData?: Tour) => {
      setChatHistory((prev) => [...prev, { role: "model", text, isError, tourData }]);
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
          ?.trim() || "Không có phản hồi từ bot.";

      // Check if bot is recommending a specific tour
      const tourMatch = tours.find(tour =>
        apiResponseText.toLowerCase().includes(tour.title.toLowerCase())
      );

      updateHistory(apiResponseText, false, tourMatch);
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={whiteBackground} />
      <View style={[styles.header, { paddingTop: 10 }]}>
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
            />
            <Text style={styles.headerTitle}>Travel Assistant</Text>
          </View>
          <Text style={styles.headerSubtitle}>Chúng tôi sẵn sàng giúp bạn</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
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
          renderItem={({ item }) => <ChatMessage chat={item} navigation={navigation} />}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ChatbotIcon
                width={60}
                height={60}
                color={greyText}
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
            placeholder={isRecording ? "Đang nghe..." : "Nhập câu hỏi của bạn..."}
            placeholderTextColor={isRecording ? "#EF5350" : greyText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />

          {/* Voice Button */}
          <TouchableOpacity
            // onPress={handleVoiceButtonPress}
            style={{
              padding: 8,
              marginRight: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons
                name={isRecording ? "mic" : "mic-outline"}
                size={24}
                color={isRecording ? "#EF5350" : greyText}
              />
            </Animated.View>
          </TouchableOpacity>

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
    </View>
  );
};

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
    gap: 10,
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
    gap: 15,
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
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
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
    paddingTop: 12,
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
    paddingVertical: 10,
    fontSize: 16,
    color: darkText,
    maxHeight: 100,
    textAlignVertical: "top",
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
    height: 45,
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
  // Tour Card Styles
  tourCard: {
    backgroundColor: whiteBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 4,
  },
  tourImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
  },
  tourImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  tourCardContent: {
    padding: 14,
  },
  tourCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: darkText,
    marginBottom: 10,
    lineHeight: 24,
  },
  tourInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  tourInfoText: {
    fontSize: 13,
    color: greyText,
    flex: 1,
  },
  tourCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: borderColorLight,
  },
  tourPriceContainer: {
    flex: 1,
  },
  tourPriceLabel: {
    fontSize: 12,
    color: greyText,
    marginBottom: 2,
  },
  tourPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  viewTourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewTourButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 4,
  },
});