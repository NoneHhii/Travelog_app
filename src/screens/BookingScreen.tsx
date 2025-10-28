import React, { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    SafeAreaView,
    Text,
    ActivityIndicator, // Added ActivityIndicator
    // FlatList, // Can remove if only using Slider
} from "react-native";
import { colors } from "../constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Added useNavigation
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // Added Navigation types

// --- Import Types, API, and Components ---
import travel, { RootStackParamList } from "./HomeScreen"; // Import types
import { getAllTravel } from "../api/apiClient"; // Import API
import { TravelItem } from "../components/TravelItem"; // Import TravelItem (if Slider uses it)
import { Slider } from "../components/Slider"; // Import Slider component

// --- Consistent Color Palette (Blue Theme) ---
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

// --- Navigation Type ---
type BookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- Header Component ---
const BookingHeader: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerButtonPlaceholder} />
        <Text style={styles.headerTitle}>Đã đặt</Text>
        <View style={styles.headerButtonPlaceholder} />
    </View>
);

// --- Hook to fetch travel data (similar to SavingScreen) ---
const useSuggestedTravels = () => {
    const [suggestedTravels, setSuggestedTravels] = useState<travel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all travels for suggestion for now
                const data = await getAllTravel();
                setSuggestedTravels(data);
            } catch (err) {
                console.error("Error fetching suggested travels:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return { suggestedTravels, isLoading, error };
};


export const BookingScreen: React.FC = () => {
    const tabs = ["Vé máy bay", "Khách sạn", "Vui chơi", "Ngân hàng"];
    const [selectedTab, setSelectedTab] = useState("Ngân hàng");

    const navigation = useNavigation<BookingScreenNavigationProp>();
    const { suggestedTravels, isLoading, error } = useSuggestedTravels(); // Fetch suggested travels

    // --- Tab Button Component ---
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

     // --- Handle Navigation to Detail ---
     const handleDetail = useCallback(
        (item: travel) => {
            navigation.navigate("TravelDetail", { travel: item });
        },
        [navigation]
    );

    return (
        <SafeAreaView style={styles.screenContainer}>
            <BookingHeader />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {/* --- Empty State Card --- */}
                <View style={styles.card}>
                    <Image
                        source={require("../../assets/KhongYeuCauDatCho.png")}
                        style={styles.emptyStateImage}
                    />
                    <Text style={styles.emptyStateTitle}>
                        Bạn hiện không có yêu cầu đặt chỗ nào
                    </Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Khám phá cuộc phiêu lưu mới với những ý tưởng truyền cảm hứng của chúng tôi dưới đây! Nếu bạn không thể tìm thấy đặt chỗ trước đó của mình, hãy thử đăng nhập bằng email mà bạn đã sử dụng khi đặt chỗ.
                    </Text>
                </View>

                {/* --- Coupon Card --- */}
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
                    <View style={styles.tabsContainer}>
                        {tabs.map((tab) => (
                           <TabButton
                                key={tab}
                                text={tab}
                                isActive={tab === selectedTab}
                                onPress={() => setSelectedTab(tab)}
                           />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.seeMoreLinkContainer}>
                         <Text style={styles.seeMoreLinkText}>Xem thêm ưu đãi</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Suggestions Card (Modified) --- */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                         <View style={[styles.iconPill, { backgroundColor: fireIconBackgroundColor}]}>
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

                    {/* --- REMOVED Tabs and See More Link --- */}
                    {/* --- ADDED Horizontal Slider --- */}
                     {isLoading ? (
                        <ActivityIndicator size="small" color={themeColor} style={{ marginTop: 10 }}/>
                    ) : error ? (
                         <Text style={[styles.errorText, {marginTop: 10}]}>Lỗi tải gợi ý.</Text>
                    ) : suggestedTravels.length > 0 ? (
                        <Slider
                            travels={suggestedTravels} // Use fetched data
                            handleDetail={handleDetail} // Pass navigation handler
                            RadiusTop={16}
                            RadiusBottom={16}
                        />
                    ) : (
                         <Text style={styles.noSuggestionText}>Hiện chưa có gợi ý nào.</Text>
                    )}
                    {/* --- END Horizontal Slider --- */}
                </View>

                {/* --- Activity Card --- */}
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
    // Header
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: colors.white,
        paddingHorizontal: 15,
        paddingTop: 50,
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
    // Card General Style
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
    // Empty State Card
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
    // Card Header (Coupon, Suggestions)
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
    // Tabs Container (Only used in Coupon Card now)
    tabsContainer: {
        flexDirection: "row",
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
        justifyContent: 'flex-start',
    },
    // Tab Button Styles
    tabButtonBase: {
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
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
    // See More Link (Only used in Coupon Card now)
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
    // Activity Card Styles
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
    // Styles for Slider/Error/Loading in Suggestions Card
     errorText: {
         color: colors.red,
         fontSize: 14,
         textAlign: 'center',
     },
     noSuggestionText: {
        fontSize: 14,
        color: secondaryTextColor,
        textAlign: 'center',
        marginTop: 10,
     }
});