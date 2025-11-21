import React, { useEffect, useState, useMemo } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

// Import từ file types mới tạo
import { RootStackParamList, Travel, Itinerary } from "../types/types"; 
import { getAllDestinations, getReviews, getUsers, getAllTravel } from "../api/apiClient";
import { colors } from "../constants/colors";
import ReviewComponent from "../components/ReviewComponent";
import { ButtonComponent } from "../components/ButtonComponent";
import { TextComponent } from "../components/TextComponent";

// Interface phụ
export interface Review {
  comment: string;
  rating: number;
  userID: string;
  createdAt: string;
  tourID: string;
}

export interface User {
  id: string;
  displayName: string;
  profileImageUrl: string;
}

export interface Destination {
  id: string;
  name: string;
}

type Props = NativeStackScreenProps<RootStackParamList, "TravelDetail">;

const TravelDetail: React.FC<Props> = ({ navigation, route }) => {
  // Lấy params: có thể là travel object hoặc id
  const { travel: paramTravel, id: paramId } = route.params;

  const [travelData, setTravelData] = useState<Travel | null>(paramTravel || null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Nếu chưa có travel data (tức là đi từ ExploreScreen chỉ có ID), phải tìm travel trước
        let currentTravel = travelData;
        
        if (!currentTravel && paramId) {
            // Giả sử bạn có API getTravelById. Nếu không, lấy all rồi find
            const allTravels = await getAllTravel(); 
            const found = (allTravels as Travel[]).find(t => t.id === paramId);
            if (found) {
                currentTravel = found;
                setTravelData(found);
            } else {
                throw new Error("Không tìm thấy thông tin tour");
            }
        }

        // 2. Lấy các dữ liệu phụ trợ
        const [destData, reviewData, userData] = await Promise.all([
          getAllDestinations(),
          getReviews(),
          getUsers(),
        ]);

        setDestinations(destData);
        setAllReviews(reviewData);
        setUsers(userData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [paramId]); // Chỉ chạy lại khi ID thay đổi

  // --- Các hàm Helper ---
  const getDestination = (destinationID: string | undefined): Destination | undefined => {
    if (!destinationID) return undefined;
    return destinations.find((dest) => dest.id === destinationID);
  };

  const filteredReviews = useMemo(() => {
    if (!travelData) return [];
    return allReviews.filter(review => review.tourID === travelData.id);
  }, [allReviews, travelData]);

  const destination = useMemo(() => {
    if (travelData?.destinationIDs && travelData.destinationIDs.length > 0) {
      return getDestination(travelData.destinationIDs[0]);
    }
    return undefined;
  }, [destinations, travelData]);

  const handleBooking = () => {
    if (travelData) {
      navigation.navigate("BookingTour", {
        travel: travelData,
        destinationName: destination?.name || "",
      });
    }
  };

  const renderReview = ({ item }: { item: Review }) => {
    const user = users.find(user => user.id === item.userID);
    return <ReviewComponent review={item} user={user} />;
  };

  // --- Render Loading / Error ---
  if (isLoading && !travelData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0194F3" />
      </View>
    );
  }

  if (error || !travelData) {
    return (
      <View style={styles.centerContainer}>
        <TextComponent text="Lỗi tải dữ liệu hoặc không tìm thấy tour" color={colors.red} />
        <ButtonComponent 
            text="Quay lại" 
            type="button" 
            onPress={() => navigation.goBack()} 
            backgroundColor={colors.blue_splash}
            textColor="white"
        />
      </View>
    );
  }

  // --- Render Main Content ---
  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Image source={{ uri: travelData.images[0] }} style={styles.imgBanner} />
        
        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.overviewTitle}>{travelData.title}</Text>
            <View style={styles.infoRow}>
              <FontAwesome name="star" size={16} color="#FFA500" />
              <Text style={[styles.infoText, { color: '#0A2C4D', fontWeight: 'bold' }]}>
                {travelData.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.infoText}>({travelData.reviewCount} đánh giá)</Text>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={colors.grey_text} style={{ marginLeft: 10 }} />
                <Text style={styles.infoText}>{travelData.departurePoint}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điểm nổi bật</Text>
            <Text style={styles.descriptionText}>{travelData.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hành trình</Text>
            {travelData.itinerary.map((item, index) => (
              <View key={index} style={styles.itineraryItem}>
                <Text style={styles.itineraryTitle}>{item.title}</Text>
                <Text style={styles.descriptionText}>{item.details}</Text>
                {travelData.images[index + 1] && (
                  <Image source={{ uri: travelData.images[index + 1] }} style={styles.itineraryImage} />
                )}
              </View>
            ))}
          </View>

          {filteredReviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
              <FlatList
                data={filteredReviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.tourID + item.userID + Math.random()}
                style={styles.reviewList}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          <View style={[styles.section, styles.serviceSection]}>
            <Text style={styles.sectionTitle}>Dịch vụ được đảm bảo</Text>
            <Text style={styles.itineraryTitle}>Miễn phí hủy trong 24 giờ</Text>
            <Text style={styles.descriptionText}>
              Bạn có thể được hoàn tiền toàn bộ hoặc một phần cho các vé đã chọn nếu hủy đặt chỗ trong vòng 24 giờ sau khi đặt.
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng giá</Text>
          <Text style={styles.priceText}>{travelData.price.toLocaleString("vi-VN")} ₫</Text>
        </View>
        <View style={styles.bookButtonContainer}>
          <ButtonComponent
            type="button"
            text="Đặt vé ngay"
            textColor={colors.white}
            onPress={handleBooking}
            width={"100%"}
            height={50}
            backgroundColor="#0194F3"
            borderRadius={15}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// ... Giữ nguyên StyleSheet như cũ ...
const styles = StyleSheet.create({
    // Copy y nguyên phần styles của bạn vào đây
    screenContainer: { flex: 1, backgroundColor: colors.white },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.white },
    scrollView: { flex: 1, backgroundColor: colors.white },
    imgBanner: { width: "100%", height: 300 },
    backButton: { position: "absolute", top: 50, left: 20, backgroundColor: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 20, zIndex: 10 },
    contentContainer: { marginTop: -30, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 100 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#0A2C4D", marginBottom: 12 },
    overviewTitle: { fontSize: 24, fontWeight: "bold", color: "#0A2C4D", marginBottom: 8 },
    infoRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
    infoText: { marginLeft: 5, fontSize: 14, color: colors.grey_text },
    descriptionText: { fontSize: 15, color: colors.grey_text, lineHeight: 22 },
    itineraryItem: { marginBottom: 16 },
    itineraryTitle: { fontSize: 17, fontWeight: "600", color: "#333", marginBottom: 6 },
    itineraryImage: { width: "100%", height: 180, borderRadius: 15, marginTop: 10 },
    reviewList: { width: "100%" },
    serviceSection: { borderTopWidth: 1, borderTopColor: colors.light_Blue, paddingTop: 16 },
    bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 20, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.light_Blue, elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 5 },
    priceContainer: { flex: 0.4 },
    priceLabel: { fontSize: 14, color: colors.grey_text },
    priceText: { fontSize: 20, fontWeight: "bold", color: "#FF7A2F" },
    bookButtonContainer: { flex: 0.55 },
});

export default TravelDetail;