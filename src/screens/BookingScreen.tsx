import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { colors } from "../constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// --- Import Types, API, Auth ---
import travel, { RootStackParamList } from "./HomeScreen";
import { getAllTravel, getBookingsByEmail } from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";
import moment from "moment";

// --- Import Component Fix Lỗi ---
import { TravelItem } from "../components/TravelItem";

// --- Consistent Color Palette (Blue Theme - V1) ---
const lightBackground = "#F4F7FF";
const themeColor = "#0194F3";
const cardBackgroundColor = colors.white;
const primaryTextColor = "#0A2C4D";
const secondaryTextColor = colors.grey_text;
const linkColor = themeColor;
const activeTabColor = themeColor;
const inactiveTabBackground = "#D6EEFF";
const inactiveTabColor = "#006ADC";
const fireIconBackgroundColor = '#FFEFE1';
const fireIconColor = '#FF7D4A';
const couponIconBackgroundColor = '#E0F1FF';
const couponIconColor = '#4AB4FF';

type BookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- Components Con ---

const BookingHeader: React.FC = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerButtonPlaceholder} />
    <Text style={styles.headerTitle}>Đã đặt</Text>
    <View style={styles.headerButtonPlaceholder} />
  </View>
);

// Booking Item (Logic V2 nhưng Style lại theo Theme V1)
const BookingItem: React.FC<{ booking: any, tour: travel | undefined, onPress: () => void }> = ({ booking, tour, onPress }) => {
  const title = tour?.title || "Thông tin tour đang cập nhật";
  const imageSource = tour?.images?.[0] ? { uri: tour.images[0] } : require("../../assets/travelImg.jpg");
  const date = moment(booking.travelDate).format("DD/MM/YYYY");
  const price = booking.totalPrice?.toLocaleString("vi-VN") || 0;

  return (
    <TouchableOpacity style={styles.bookingItemCard} onPress={onPress}>
      <Image source={imageSource} style={styles.bookingImage} />
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingTitle} numberOfLines={2}>{title}</Text>
        
        <View style={styles.bookingRow}>
          <Ionicons name="calendar-outline" size={14} color={secondaryTextColor} />
          <Text style={styles.bookingDate}> {date}</Text>
        </View>

        <View style={styles.bookingRow}>
          <Ionicons name="people-outline" size={14} color={secondaryTextColor} />
          <Text style={styles.bookingDate}> {booking.numberOfGuests || booking.guestDetails?.length || 1} khách</Text>
        </View>

        <View style={styles.bookingFooter}>
          <View style={[styles.statusBadge, { backgroundColor: booking.status === 'confirmed' ? '#E5F8F0' : '#FFF0F0' }]}>
            <Text style={[styles.statusText, { color: booking.status === 'confirmed' ? '#00B060' : '#FF3D00' }]}>
              {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status}
            </Text>
          </View>
          <Text style={styles.bookingPrice}>{price}₫</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Hook Logic (V2) ---
const useBookingData = () => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [suggestedTravels, setSuggestedTravels] = useState<travel[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [allTours, userBookings] = await Promise.all([
        getAllTravel(),
        user?.email ? getBookingsByEmail(user.email) : Promise.resolve([])
      ]);

      setSuggestedTravels(allTours as travel[]);
      // Sắp xếp booking mới nhất lên đầu
      const sortedBookings = Array.isArray(userBookings) 
        ? userBookings.sort((a: any, b: any) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()) 
        : [];
      setMyBookings(sortedBookings);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return { myBookings, suggestedTravels, isLoading, refreshing, onRefresh };
};

// --- Main Screen ---
export const BookingScreen: React.FC = () => {
  const tabs = ["Vé máy bay", "Khách sạn", "Vui chơi", "Ngân hàng"];
  const [selectedTab, setSelectedTab] = useState("Vé máy bay");

  const navigation = useNavigation<BookingScreenNavigationProp>();
  // Sử dụng Hook Logic V2
  const { myBookings, suggestedTravels, isLoading, refreshing, onRefresh } = useBookingData();

  const handleDetail = useCallback(
    (item: travel) => {
      navigation.navigate("TravelDetail", { travel: item });
    },
    [navigation]
  );

  interface TabButtonProps {
    text: string;
    isActive: boolean;
    onPress: () => void;
  }
  const TabButton: React.FC<TabButtonProps> = ({ text, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButtonBase,
        isActive ? styles.tabButtonActive : styles.tabButtonInactive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.tabButtonTextBase,
        isActive ? styles.tabButtonTextActive : styles.tabButtonTextInactive
      ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      <BookingHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColor]} />
        }
      >
        
        {/* --- PHẦN 1: LOGIC BOOKING (Kết hợp logic V2 vào UI V1) --- */}
        {isLoading && !refreshing ? (
           <View style={[styles.card, { alignItems: 'center', padding: 30 }]}>
              <ActivityIndicator size="small" color={themeColor} />
              <Text style={{ marginTop: 10, color: secondaryTextColor }}>Đang tải chuyến đi...</Text>
           </View>
        ) : myBookings.length > 0 ? (
          // Case A: Có Booking -> Hiển thị list
          <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconPill, { backgroundColor: '#E0F7FA' }]}>
                  <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color="#00ACC1" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Chuyến đi của bạn</Text>
                  <Text style={styles.cardSubtitle}>Sắp khởi hành</Text>
                </View>
            </View>
            
            {myBookings.map((booking) => {
              const tourInfo = suggestedTravels.find(t => t.id === booking.tourID);
              return (
                <BookingItem 
                  key={booking.id} 
                  booking={booking} 
                  tour={tourInfo}
                  onPress={() => tourInfo && handleDetail(tourInfo)}
                />
              );
            })}
          </View>
        ) : (
          // Case B: Không có Booking -> Hiển thị Empty State (UI V1)
          <View style={styles.card}>
            <Image
              source={require("../../assets/KhongYeuCauDatCho.png")}
              style={styles.emptyStateImage}
            />
            <Text style={styles.emptyStateTitle}>
              Bạn hiện không có yêu cầu đặt chỗ nào
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Khám phá cuộc phiêu lưu mới với những ý tưởng truyền cảm hứng của chúng tôi dưới đây!
            </Text>
          </View>
        )}

        {/* --- PHẦN 2: COUPON CARD (UI V1) --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconPill, { backgroundColor: couponIconBackgroundColor }]}>
              <Ionicons name="pricetag-outline" size={20} color={couponIconColor} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Thư viện coupon</Text>
              <Text style={styles.cardSubtitle}>
                Cập nhật đều đặn tại Trang Chủ và Đặt chỗ
              </Text>
            </View>
            <TouchableOpacity style={styles.arrowIcon}>
              <Ionicons name="chevron-forward-outline" size={24} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
           
          <FlatList
            style={styles.tabsContainer}
            data={tabs}
            renderItem={({ item }) => (
              <TabButton
                text={item}
                isActive={item === selectedTab}
                onPress={() => setSelectedTab(item)}
              />
            )}
            keyExtractor={(item) => item}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
           
          <TouchableOpacity style={styles.seeMoreLinkContainer}>
            <Text style={styles.seeMoreLinkText}>Xem thêm ưu đãi</Text>
          </TouchableOpacity>
        </View>

        {/* --- PHẦN 3: SUGGESTIONS (FIX LỖI: Dùng TravelItem + FlatList) --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconPill, { backgroundColor: fireIconBackgroundColor }]}>
              <MaterialCommunityIcons name="fire" size={20} color={fireIconColor} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Đề xuất tuyệt vời</Text>
              <Text style={styles.cardSubtitle}>
                Gợi ý hoàn hảo cho chuyến đi trọn vẹn
              </Text>
            </View>
            <TouchableOpacity style={styles.arrowIcon}>
              <Ionicons name="chevron-forward-outline" size={24} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>

          {suggestedTravels.length > 0 ? (
            <FlatList
              data={suggestedTravels}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TravelItem travel={item} onPress={handleDetail} />
              )}
              contentContainerStyle={{ paddingVertical: 5 }}
            />
          ) : (
            <Text style={styles.noSuggestionText}>Đang cập nhật gợi ý...</Text>
          )}
        </View>

        {/* --- PHẦN 4: ACTIVITY CARD (UI V1) --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Tất cả các hoạt động
          </Text>
          <TouchableOpacity style={styles.activityItem}>
            <Text style={styles.activityText}>
              Danh sách mua hàng của bạn
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color={secondaryTextColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityItem}>
            <Text style={styles.activityText}>
              Khoản hoàn tiền của bạn
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color={secondaryTextColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.activityItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.activityText}>
              Đánh giá trải nghiệm gần đây
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: lightBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomColor: colors.light_Blue,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryTextColor,
  },
  headerButtonPlaceholder: {
    width: 40,
  },
  card: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 1.5,
    shadowColor: "#AAB2C8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // --- New Styles for Booking Items (Integrated seamlessly) ---
  bookingItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E9F5',
  },
  bookingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 4,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: 12,
    color: secondaryTextColor,
    marginLeft: 4,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: themeColor,
  },
  // --- End Booking Item Styles ---
  emptyStateImage: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 15,
  },
  emptyStateTitle: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: primaryTextColor,
  },
  emptyStateSubtitle: {
    textAlign: "center",
    lineHeight: 18,
    fontSize: 13,
    color: secondaryTextColor,
    paddingHorizontal: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: primaryTextColor,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: secondaryTextColor,
  },
  arrowIcon: {
    paddingLeft: 10,
  },
  tabsContainer: {
    marginBottom: 10,
  },
  tabButtonBase: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 10,
  },
  tabButtonActive: {
    backgroundColor: activeTabColor,
    borderColor: activeTabColor,
  },
  tabButtonInactive: {
    backgroundColor: inactiveTabBackground,
    borderColor: inactiveTabBackground,
  },
  tabButtonTextBase: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: colors.white,
  },
  tabButtonTextInactive: {
    color: inactiveTabColor,
  },
  seeMoreLinkContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  seeMoreLinkText: {
    color: linkColor,
    fontSize: 14,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: colors.light_Blue,
    borderBottomWidth: 1,
  },
  activityText: {
    flex: 1,
    fontSize: 15,
    color: primaryTextColor,
    fontWeight: '500',
  },
  noSuggestionText: {
    fontSize: 14,
    color: secondaryTextColor,
    textAlign: 'center',
    marginTop: 10,
  }
});