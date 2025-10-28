import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Image,
  StyleSheet,
  View,
  ImageBackground,
  PanResponder,
  Dimensions,
  Animated,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity, // Dùng cho nút "Xem tất cả"
  TextInput, // Dùng cho thanh tìm kiếm
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextComponent } from "../components/TextComponent";
import { MenuComponent } from "../components/MenuComponent";
import { colors } from "../constants/colors";
import { Slider } from "../components/Slider";
import { getAllTravel } from "../api/apiClient";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
// Import icons
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// --- Kích thước & Hằng số ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = 65; // Kích thước nút chatbot mới
const FLOATING_BUTTON_POSITION_BOTTOM = 30;
const FLOATING_BUTTON_POSITION_RIGHT = 20;

// --- Định nghĩa Types (Giữ nguyên) ---
export interface Itinerary {
  day: number;
  details: string;
  title: string;
}

export default interface travel {
  id: string;
  departurePoint: string;
  destinationID: string;
  images: string[];
  description: string;
  itinerary: Itinerary[];
  price: number;
  title: string;
  averageRating: number;
  reviewCount: number;
}

export type RootStackParamList = {
  Home: undefined;
  TravelDetail: { travel: travel };
  Chatbot: undefined;
  // Thêm các màn hình khác nếu có
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- Custom Hook: Lấy dữ liệu Travel (Giữ nguyên) ---
const useTravelData = () => {
  const [travels, setTravels] = useState<travel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getAllTravel();
        setTravels(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { travels, isLoading, error };
};

// --- Custom Hook: Logic cho nút Chatbot kéo thả (Giữ nguyên) ---
// (Logic không đổi, chỉ thay đổi style ở component)
const useDraggableFloatingButton = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const pan = useRef(new Animated.ValueXY()).current;
  const hasMoved = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        hasMoved.current = false;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        if (!hasMoved.current) {
          navigation.navigate("Chatbot");
          return;
        }

        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        const containerStartX =
          SCREEN_WIDTH -
          FLOATING_BUTTON_POSITION_RIGHT -
          BUTTON_SIZE;
        const containerStartY =
          SCREEN_HEIGHT -
          FLOATING_BUTTON_POSITION_BOTTOM -
          BUTTON_SIZE - 
          80; // Trừ thêm 80 (chiều cao của bottom tab bar)

        const minX = -containerStartX;
        const maxX = SCREEN_WIDTH - containerStartX - BUTTON_SIZE;
        const minY = -containerStartY;
        const maxY = SCREEN_HEIGHT - containerStartY - BUTTON_SIZE;

        const clampedX = Math.max(minX, Math.min(maxX, currentX));
        const clampedY = Math.max(minY, Math.min(maxY, currentY));

        if (clampedX !== currentX || clampedY !== currentY) {
          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const animatedStyle = {
    transform: [{ translateX: pan.x }, { translateY: pan.y }],
  };

  return { panHandlers: panResponder.panHandlers, animatedStyle };
};

// --- Component Con: Header ---
const HomeHeader: React.FC = () => (
  <LinearGradient
    colors={["#E0F7FF", "#FFFFFF"]} // Gradient xanh nhạt tới trắng
    style={styles.headerContainer}
  >
    <View style={styles.headerTopRow}>
      <View>
        <TextComponent
          text="Xin chào, du khách!"
          size={22}
          fontWeight="bold"
          color="#0A2C4D"
        />
        <TextComponent
          text="Chào mừng trở lại!"
          size={14}
          color={colors.grey_text}
        />
      </View>
      {/* <Image source={require("../../assets/avatar.png")} style={styles.avatar} /> */}
    </View>
    <View style={styles.searchBarContainer}>
      <Ionicons
        name="search"
        size={22}
        color={colors.grey_text}
        style={styles.searchIcon}
      />
      <TextInput
        placeholder="Tìm kiếm điểm đến mơ ước..."
        placeholderTextColor={colors.grey_text}
        style={styles.searchInput}
      />
    </View>
  </LinearGradient>
);

// --- Component Con: Menu Grid ---
const MenuGrid: React.FC = () => (
  <View style={styles.menuGridContainer}>
    <TextComponent
      text="Bạn muốn khám phá điều gì?"
      size={18}
      fontWeight="bold"
      color="#0A2C4D"
      styles={styles.sectionTitle}
    />
    <View style={styles.menuRow}>
      <MenuComponent
        title="Flights"
        url={require("../../assets/airplane.png")}
        bgColor="#EAF2FF"
      />
      <MenuComponent
        title="Hotels"
        url={require("../../assets/hotel.png")}
        bgColor="#F0EAFE"
      />
      <MenuComponent
        title="Cars"
        url={require("../../assets/car-rental.png")}
        bgColor="#E5F8F0"
      />
      <MenuComponent
        title="All"
        url={require("../../assets/think-to-do.png")}
        bgColor="#FFF9E6"
      />
    </View>
    <View style={styles.menuRow}>
      <MenuComponent
        title="Tours"
        url={require("../../assets/bus-shuttle.png")}
        bgColor="#FFF0F0"
      />
      <MenuComponent
        title="Events"
        url={require("../../assets/flight-status.png")}
        bgColor="#F0F0F0"
      />
      <MenuComponent
        title="Cruises"
        url={require("../../assets/cruise-ship.png")}
        bgColor="#EAF8FF"
      />
      {/* Thêm một View rỗng để "cân" hàng cuối nếu cần,
          hoặc điều chỉnh width của menuRow và item để nó tự dàn đều */}
      <View style={{ width: 70, marginHorizontal: 8 }} /> {/* Item rỗng để căn 3 item thành 4 cột */}
    </View>
  </View>
);

// --- Component Con: Offers ---
const OffersSection: React.FC = () => (
  <View style={styles.offersContainer}>
    <TextComponent
      text="Ưu đãi độc quyền ✨"
      size={18}
      fontWeight="bold"
      color="#0A2C4D"
      styles={styles.sectionTitle}
    />
    <View style={styles.offersRow}>
      {/* Thẻ bên trái */}
      <ImageBackground
        source={require("../../assets/bg1.png")} // Thay bằng ảnh biển
        style={styles.offerCardLeft}
        imageStyle={{ borderRadius: 20 }}
      >
        <TextComponent text="GIẢM 30%" size={24} fontWeight="bold" color={colors.white} />
        <TextComponent text="Cho chuyến đi đầu tiên!" size={14} color={colors.white} />
      </ImageBackground>

      {/* Thẻ bên phải */}
      <LinearGradient
        colors={["#FFD67C", "#FFAE34"]}
        style={styles.offerCardRight}
      >
        <Image source={require("../../assets/Offer.png")} style={styles.offerIcon} />
        <TextComponent text="Nhận voucher" size={16} fontWeight="bold" color="#4D3800" />
        <TextComponent text="lên đến 200k" size={13} color="#4D3800" />
      </LinearGradient>

      {/* Đồng tiền bay (tùy chọn) */}
      <Image source={require("../../assets/dollar.png")} style={styles.dollarIcon1} />
      <Image source={require("../../assets/dollar.png")} style={styles.dollarIcon2} />
    </View>
  </View>
);

// --- Component Con: Travel Slider ---
interface TravelSectionProps {
  travels: travel[];
  onPressItem: (item: travel) => void;
}
// ...
const TravelSection: React.FC<TravelSectionProps> = ({ travels, onPressItem }) => (
  <View style={styles.travelSectionContainer}>
    {/* Tiêu đề */}
    <View style={styles.sectionHeader}>
      <TextComponent
        text="Những hành trình đang chờ bạn!"
        size={18}
        fontWeight="bold"
        color="#0A2C4D"
      />
      <TouchableOpacity>
        <TextComponent text="Xem tất cả >" size={14} color={colors.blue_splash} />
      </TouchableOpacity>
    </View>
    <Slider
      travels={travels}
      RadiusTop={16} // Thẻ mới có bo tròn
      RadiusBottom={16} // Thẻ mới có bo tròn
      handleDetail={onPressItem}
    />
  </View>
);


// --- Component Con: Nút Chatbot Mới ---
const DraggableChatbotButton: React.FC = () => {
  const { panHandlers, animatedStyle } = useDraggableFloatingButton();

  return (
    <View style={styles.floatingButtonContainer}>
      <Animated.View style={animatedStyle} {...panHandlers}>
        <LinearGradient
          colors={["#8A78F5", "#6A5AE0"]} // Gradient tím/xanh
          style={styles.floatingButton}
        >
          <MaterialCommunityIcons name="robot-outline" size={32} color={colors.white} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};


// --- Component Chính: HomeScreen ---
export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { travels, isLoading, error } = useTravelData();

  const handleDetail = useCallback(
    (travel: travel) => {
      navigation.navigate("TravelDetail", { travel });
    },
    [navigation]
  );

  // Xử lý trạng thái Error và Loading
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <TextComponent text={`Lỗi tải dữ liệu`} color={colors.red} />
      </View>
    );
  }
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6A5AE0" />
      </View>
    );
  }

  // Render UI chính
  return (
    <View style={styles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }} // Thêm đệm dưới
      >
        <HomeHeader />
        <MenuGrid />
        <OffersSection />
        <TravelSection travels={travels} onPressItem={handleDetail} />
      </ScrollView>

      <DraggableChatbotButton />
    </View>
  );
};

// --- StyleSheet (Đã thiết kế lại toàn bộ) ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 50, // Khoảng cách cho status bar
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  scanButton: {
    padding: 5,
  },
  // Menu Grid
  menuGridContainer: {
    paddingHorizontal: 10, // Giảm padding ngang để các item có thêm không gian
    marginTop: 25,
  },
  sectionTitle: {
    marginBottom: 15,
    paddingHorizontal: 10, // Thêm padding cho title nếu menuGridContainer có padding nhỏ
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Dàn đều khoảng cách giữa các item
    marginBottom: 15,
  },
  // Offers
  offersContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    position: "relative",
  },
  offersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  offerCardLeft: {
    flex: 0.65, // Chiếm 65%
    height: 140,
    borderRadius: 20,
    padding: 15,
    justifyContent: "center",
    overflow: "hidden",
  },
  offerCardRight: {
    flex: 0.32, // Chiếm 32%
    height: 140,
    borderRadius: 20,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  offerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 10,
  },
  dollarIcon1: {
    position: "absolute",
    width: 25,
    height: 25,
    resizeMode: "contain",
    top: 50,
    right: "35%",
    zIndex: 1,
  },
  dollarIcon2: {
    position: "absolute",
    width: 25,
    height: 25,
    resizeMode: "contain",
    top: 150,
    left: "50%",
    zIndex: 1,
  },
  // Travel Section
  travelSectionContainer: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 5, // Giảm margin vì Slider có margin top
  },
  // Chatbot Button
  floatingButtonContainer: {
    position: "absolute",
    bottom: FLOATING_BUTTON_POSITION_BOTTOM,
    right: FLOATING_BUTTON_POSITION_RIGHT,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 999,
  },
  floatingButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#6A5AE0",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});