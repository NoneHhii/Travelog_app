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
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import travel from "./HomeScreen";
import { getAllDestinations, getReviews, getUsers } from "../api/apiClient";
import { colors } from "../constants/colors";
import ReviewComponent from "../components/ReviewComponent";
import { ButtonComponent } from "../components/ButtonComponent";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { TextComponent } from "../components/TextComponent";
import { RootStackParamList } from "../navigation/RootNavigator";

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

type StackProps = NativeStackScreenProps<RootStackParamList, "TravelDetail">;

const useTravelDetails = () => {
  const [destinations, setDestinations] = React.useState<any[]>([]);
  const [allReviews, setAllReviews] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
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
    })();
  }, []);

  const getDestination = (destinationID: string | undefined): Destination | undefined => {
    if (!destinationID) return undefined;
    return destinations.find((dest) => dest.id === destinationID);
  };

  const getReviewUser = (review: Review) => {
    return users.find((user) => user.id === review.userID);
  };

  return { allReviews, users, isLoading, error, getDestination, getReviewUser };
};

const TravelDetail: React.FC<StackProps> = ({ navigation, route }) => {
  const { travel } = route.params;

  const { allReviews, users, isLoading, error, getDestination, getReviewUser } =
    useTravelDetails();

  const filteredReviews = useMemo(() => {
    return allReviews.filter(review => review.tourID === travel.id);
  }, [allReviews, travel.id]);

  const destination = useMemo(() => {
    if (travel.destinationIDs && travel.destinationIDs.length > 0) {
      const firstDestinationID = travel.destinationIDs[0];
      return getDestination(firstDestinationID);
    }
    return undefined;
  }, [getDestination, travel.destinationIDs]);

  const handleBooking = () => {
    navigation.navigate("BookingTour", {
      travel: travel,
      destinationName: destination?.name || "",
    });
  };

  const renderReview = ({ item }: { item: Review }) => {
    const user = users.find(user => user.id === item.userID);
    return <ReviewComponent review={item} user={user} />;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0194F3" />
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

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <Image
          source={{ uri: travel.images[0] }}
          style={styles.imgBanner}
        />

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.overviewTitle}>
              {travel.title}
            </Text>
            <View style={styles.infoRow}>
              <FontAwesome name="star" size={16} color="#FFA500" />
              <Text style={[styles.infoText, { color: '#0A2C4D', fontWeight: 'bold' }]}>
                {travel.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.infoText}>
                ({travel.reviewCount} đánh giá)
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={colors.grey_text} style={{marginLeft: 10}} />
                <Text style={styles.infoText}>{travel.departurePoint}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điểm nổi bật</Text>
            <Text style={styles.descriptionText}>{travel.description}</Text>
          </View>

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

          {filteredReviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
              <FlatList
                data={filteredReviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.tourID.toString() + item.userID}
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
              Bạn có thể được hoàn tiền toàn bộ hoặc một phần cho các vé đã chọn
              nếu hủy đặt chỗ trong vòng 24 giờ sau khi đặt.
            </Text>
          </View>

        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

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
            height={50}
            backgroundColor="#0194F3"
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
    height: 300,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  bookmarkButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  contentContainer: {
    marginTop: -30,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 100,
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
  tourTitleText: {
    fontSize: 16,
    color: colors.grey_text,
    lineHeight: 23,
    marginBottom: 16,
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
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  priceContainer: {
    flex: 0.4,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.grey_text,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF7A2F",
  },
  bookButtonContainer: {
    flex: 0.55,
  },
});

export default TravelDetail;