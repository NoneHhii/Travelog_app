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
} from "react-native";
import { colors } from "../constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import travel, { RootStackParamList } from "./HomeScreen";
import { getAllTravel } from "../api/apiClient";
import { TravelItem } from "../components/TravelItem";
import { Slider } from "../components/Slider";

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

const BookingHeader: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerButtonPlaceholder} />
        <Text style={styles.headerTitle}>Đã đặt</Text>
        <View style={styles.headerButtonPlaceholder} />
    </View>
);

const useSuggestedTravels = () => {
    const [suggestedTravels, setSuggestedTravels] = useState<travel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            setError(null);
            try {
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
    const [selectedTab, setSelectedTab] = useState("Vé máy bay");

    const navigation = useNavigation<BookingScreenNavigationProp>();
    const { suggestedTravels, isLoading, error } = useSuggestedTravels();

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

                    {isLoading ? (
                        <ActivityIndicator size="small" color={themeColor} style={{ marginTop: 10 }} />
                    ) : error ? (
                        <Text style={[styles.errorText, { marginTop: 10 }]}>Lỗi tải gợi ý.</Text>
                    ) : suggestedTravels.length > 0 ? (
                        <Slider
                            travels={suggestedTravels}
                            handleDetail={handleDetail}
                            RadiusTop={16}
                            RadiusBottom={16}
                        />
                    ) : (
                        <Text style={styles.noSuggestionText}>Hiện chưa có gợi ý nào.</Text>
                    )}
                </View>

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