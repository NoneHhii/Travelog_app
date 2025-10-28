import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { useEffect, useMemo } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView, // Thêm SafeAreaView
  ActivityIndicator,
} from "react-native";
import travel, { RootStackParamList } from "./HomeScreen"; // Import RootStackParamList từ HomeScreen
import { getAllDestinations, getReviews, getUsers } from "../api/apiClient";
import { colors } from "../constants/colors";
import ReviewComponent from "../components/ReviewComponent";
import { ButtonComponent } from "../components/ButtonComponent";
import { Ionicons, FontAwesome } from "@expo/vector-icons"; // Import icons
import { TextComponent } from "../components/TextComponent"; // Giả sử bạn có TextComponent

// --- Định nghĩa Types (Tái sử dụng từ code của bạn) ---
export interface Review {
  comment: string;
  rating: number;
  userID: string;
  createdAt: string;
  tourID: string; // Giả sử tourID là string để khớp với travel.id
}

export interface User {
  id: string;
  displayName: string;
  profileImageUrl: string;
}

// Giả sử Destination type
export interface Destination {
  id: string;
  name: string;
  // ... các thuộc tính khác
}

// Sửa lại type cho Stack, dùng RootStackParamList đã định nghĩa
// Thêm BookingTour vào đây nếu chưa có
type AppStackParamList = RootStackParamList & {
  BookingTour: { travel: travel; destinationName: string };
  TravelDetail: { travel: travel };
};
type StackProps = NativeStackScreenProps<AppStackParamList, "TravelDetail">;

// --- Custom Hook: Lấy dữ liệu ---
const useTravelDetails = (travelId: string) => {
  const [destinations, setDestinations] = React.useState<Destination[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        // Tối ưu: Chỉ fetch data cần thiết (ví dụ)
        const [destData, reviewData, userData] = await Promise.all([
          getAllDestinations(),
          getReviews(travelId), // Giả sử API hỗ trợ lọc
          getUsers(), // Giá sử API này lấy tất cả user liên quan
        ]);
        setDestinations(destData);
        setReviews(reviewData);
        setUsers(userData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [travelId]);

  // Logic tính toán (dùng useMemo để tối ưu)
  const getDestination = (destinationID: string) => {
    return destinations.find((dest) => dest.id === destinationID);
  };

  const getReviewUser = (review: Review) => {
    return users.find((user) => user.id === review.userID);
  };

  return { reviews, isLoading, error, getDestination, getReviewUser };
};

// --- Component Chính ---
const TravelDetail: React.FC<StackProps> = ({ navigation, route }) => {
  const { travel } = route.params;
  const { reviews, isLoading, error, getDestination, getReviewUser } =
    useTravelDetails(travel.id);

  const destination = useMemo(
    () => getDestination(travel.destinationID),
    [getDestination, travel.destinationID]
  );

  const handleBooking = () => {
    navigation.navigate("BookingTour", {
      travel: travel,
      destinationName: destination?.name || "",
    });
  };

  const renderReview = ({ item }: { item: Review }) => {
    const user = getReviewUser(item);
    return <ReviewComponent review={item} user={user} />;
  };

  // Xử lý loading / error
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6A5AE0" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <TextComponent text="Lỗi tải dữ liệu chi tiết" color={colors.red} />
      </View>
    );
  }

  // --- Render UI ---
  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* 1. Banner Image */}
        <Image
          source={{ uri: travel.images[0] }}
          style={styles.imgBanner}
        />

        {/* 2. Content "Sheet" */}
        <View style={styles.contentContainer}>
          {/* Overview Section */}
          <View style={styles.section}>
            <Text style={styles.overviewTitle}>
              {travel.departurePoint} - {destination?.name}
            </Text>

            <View style={styles.infoRow}>
              {/* Rating */}
              <FontAwesome name="star" size={16} color="#FFA500" />
              <Text style={[styles.infoText, { color: '#0A2C4D', fontWeight: 'bold' }]}>
                {travel.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.infoText}>
                ({travel.reviewCount} đánh giá)
              </Text>
              {/* Location */}
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={colors.grey_text} style={{marginLeft: 10}} />
                <Text style={styles.infoText}>{travel.departurePoint}</Text>
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điểm nổi bật</Text>
            <Text style={styles.descriptionText}>{travel.description}</Text>
          </View>

          {/* Itinerary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hành trình</Text>
            {travel.itinerary.map((item, index) => (
              <View key={index} style={styles.itineraryItem}>
                <Text style={styles.itineraryTitle}>{item.title}</Text>
                <Text style={styles.descriptionText}>{item.details}</Text>
                {travel.images[index + 1] && (
                  <Image
                    source={{ uri: travel.images[index + 1] }}
                    style={styles.itineraryImage}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Review Section */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
              <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.tourID.toString() + item.userID} // Key an toàn hơn
                style={styles.reviewList}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* Service Section */}
          <View style={[styles.section, styles.serviceSection]}>
            <Text style={styles.sectionTitle}>Dịch vụ được đảm bảo</Text>
            <Text style={styles.itineraryTitle}>Miễn phí hủy trong 24 giờ</Text>
            <Text style={styles.descriptionText}>
              Bạn có thể được hoàn tiền toàn bộ hoặc một phần cho các vé đã chọn
              nếu hủy đặt chỗ trong vòng 24 giờ sau khi đặt.
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* 3. Nút Trở Lại (Tuyệt đối) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* 5. Thanh Đặt Vé (Dính) */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng giá</Text>
          <Text style={styles.priceText}>
            {travel.price.toLocaleString("vi-VN")} ₫
          </Text>
        </View>
        <View style={styles.bookButtonContainer}>
          <ButtonComponent
            type="button"
            text="Đặt vé ngay"
            textColor={colors.white}
            onPress={() => handleBooking()}
            width={"100%"}
            height={50} // Chiều cao cố định
            backgroundColor="#6A5AE0" // Màu tím giống chatbot
            borderRadius={15}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imgBanner: {
    width: "100%",
    height: 300, // Tăng chiều cao
  },
  // Nút trở lại
  backButton: {
    position: "absolute",
    top: 50, // Điều chỉnh cho status bar
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  // Content "Sheet"
  contentContainer: {
    marginTop: -30, // Kéo content lên trên ảnh
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 100, // Thêm padding cho nội dung cuối
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A2C4D",
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A2C4D",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.grey_text,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.grey_text,
    lineHeight: 22,
  },
  itineraryItem: {
    marginBottom: 16,
  },
  itineraryTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  itineraryImage: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    marginTop: 10,
  },
  reviewList: {
    width: "100%",
  },
  serviceSection: {
    borderTopWidth: 1,
    borderTopColor: colors.light_Blue,
    paddingTop: 16,
  },
  // Thanh đặt vé
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.light_Blue,
    elevation: 10, // Shadow cho Android
    shadowColor: "#000", // Shadow cho iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  priceContainer: {
    flex: 0.4, // Chiếm 40%
  },
  priceLabel: {
    fontSize: 14,
    color: colors.grey_text,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF7A2F", // Màu cam
  },
  bookButtonContainer: {
    flex: 0.55, // Chiếm 55%
  },
  // Xóa các style cũ không cần thiết
  // container, headContain, avgRate, highlight, service
});

export default TravelDetail;