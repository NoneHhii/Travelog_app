import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    SafeAreaView,
    Text, // Dùng Text của RN
} from "react-native";
// Bỏ TextComponent nếu không dùng nhất quán ở các màn hình trước
// import { TextComponent } from "../components/TextComponent";
import { ButtonComponent } from "../components/ButtonComponent"; // Vẫn dùng ButtonComponent cho các tab
import { colors } from "../constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// --- Màu sắc nhất quán ---
const lightBackground = "#F4F7FF"; // Nền xanh nhạt giống BookingInfor
const activeTabColor = "#6A5AE0";   // Tím active
const inactiveTabBackground = "#E8E6FF"; // Xanh/Tím rất nhạt cho nền inactive (điều chỉnh)
const inactiveTabColor = "#575FCC";    // Xanh/Tím cho chữ inactive (điều chỉnh)
const cardBackgroundColor = colors.white;
const primaryTextColor = "#0A2C4D";
const secondaryTextColor = colors.grey_text;
const linkColor = colors.blue_splash;
const fireIconBackgroundColor = '#FFEFE1'; // Nền cam nhạt cho icon lửa
const fireIconColor = '#FF7D4A';         // Màu cam cho icon lửa
const couponIconBackgroundColor = '#E0F1FF';// Nền xanh nhạt cho icon coupon
const couponIconColor = '#4AB4FF';       // Màu xanh cho icon coupon


export const BookingScreen: React.FC = () => {
    const tabs = ["Vé máy bay", "Khách sạn", "Vui chơi", "Ngân hàng"];
    const [selectedTab, setSelectedTab] = useState("Ngân hàng"); // Active theo ảnh
    const suggestions = ["Khách sạn", "Hoạt động du lịch", "Tất cả"];
    const [selectedSuggestion, setSelectedSuggestion] = useState("Khách sạn"); // Active theo ảnh

    // --- Component Con: Tab Button (Để dễ quản lý style hơn) ---
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

                {/* --- Suggestions Card --- */}
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
                    <View style={styles.tabsContainer}>
                        {suggestions.map((suggestion) => (
                            <TabButton
                                key={suggestion}
                                text={suggestion}
                                isActive={suggestion === selectedSuggestion}
                                onPress={() => setSelectedSuggestion(suggestion)}
                           />
                        ))}
                    </View>
                     <TouchableOpacity style={styles.seeMoreLinkContainer}>
                         <Text style={styles.seeMoreLinkText}>Xem thêm</Text>
                     </TouchableOpacity>
                </View>

                {/* --- Activity Card (ĐÃ THÊM LẠI) --- */}
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
                 {/* --- KẾT THÚC PHẦN ACTIVITY --- */}

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
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    card: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#999",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    // Empty State
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
    // Card Header
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
    // Tabs Container
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
    // See More Link
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
    // Activity Card Styles (ĐÃ THÊM LẠI)
    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15, // Padding dọc
        borderBottomColor: colors.light_Blue, // Màu đường kẻ nhạt
        borderBottomWidth: 1,
    },
    activityText: { // Style cho text trong activity item
        flex: 1, // Để đẩy icon mũi tên sang phải
        fontSize: 15, // Kích thước chữ
        color: primaryTextColor, // Màu chữ đậm hơn
        fontWeight: '500', // Đậm vừa
    }
});