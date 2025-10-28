import React from "react";
import {
    Image,
    Pressable, // Keep Pressable for buttons if preferred over TouchableOpacity
    StyleSheet,
    Text,      // Use RN Text
    View,
    ScrollView,
    SafeAreaView, // Add SafeAreaView
    TouchableOpacity, // Use TouchableOpacity for list items
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ViewOptionComponent from "../components/ViewOptionComponent"; // Assuming this component exists and is styled
import { colors } from "../constants/colors"; // Assuming consistent color definitions
import { Ionicons } from "@expo/vector-icons"; // Use Ionicons

// --- Consistent Color Palette (Blue Theme) ---
const lightBackground = "#F4F7FF";
const themeColor = "#0194F3";          // Main blue color
const cardBackgroundColor = colors.white;
const primaryTextColor = "#0A2C4D";
const secondaryTextColor = colors.grey_text;
const priorityGradientColors = ["#007AFF", "#0052D4"]; // Example blue gradient for priority banner

// --- Header Component ---
const AccountHeader: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerButtonPlaceholder} />
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={styles.headerButtonPlaceholder} />
    </View>
);

// --- Define Options Data with Ionicons ---
const paymentOptions = [
    {
        id: "payment",
        icon: "card-outline" as const, // Use Ionicons name
        title: "Thanh toán",
        content: "Thêm hoặc quản lý thẻ đã lưu",
    },
];

const rewardsOptions = [
    {
        id: 1,
        icon: "gift-outline" as const,
        title: "0 Điểm",
        content: "Đổi điểm lấy coupon và tìm hiểu cách kiếm thêm!",
    },
    {
        id: 2,
        icon: "flag-outline" as const,
        title: "Nhiệm vụ của tôi",
        content: "Hoàn thành nhiều Nhiệm vụ hơn, mở khóa nhiều phần thưởng hơn",
    },
    {
        id: 3,
        icon: "pricetags-outline" as const,
        title: "Coupon của tôi",
        content: "Xem các coupon bạn có thể sử dụng ngay bây giờ",
    },
    {
        id: 4,
        icon: "ribbon-outline" as const,
        title: "Khu vực thưởng",
        content: "Theo dõi các chương trình phần thưởng bạn đã tham gia",
    },
];

const serviceOptions = [
    {
        id: 1,
        icon: "help-circle-outline" as const,
        title: "Trung tâm trợ giúp",
        content: "Tìm câu trả lời tốt nhất cho câu hỏi của bạn!",
    },
    {
        id: 2,
        icon: "headset-outline" as const,
        title: "Dịch vụ khách hàng", // Changed from "My Missions" which was duplicated
        content: "Nhận trợ giúp từ Dịch vụ khách hàng của chúng tôi",
    },
    {
        id: 3,
        icon: "settings-outline" as const,
        title: "Cài đặt", // Changed from "Reward Zone" which was duplicated
        content: "Xem và đặt tùy chọn tài khoản của bạn",
    },
];

// --- Option Row Component (Example - integrate with ViewOptionComponent or replace) ---
interface OptionRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    content: string;
    onPress?: () => void;
    isLast?: boolean;
}

const OptionRow: React.FC<OptionRowProps> = ({ icon, title, content, onPress, isLast }) => (
    <TouchableOpacity style={[styles.optionRow, isLast && styles.optionRowLast]} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={24} color={themeColor} style={styles.optionIcon} />
        <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionContent}>{content}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={secondaryTextColor} />
    </TouchableOpacity>
);


export const AccountScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.screenContainer}>
            <AccountHeader />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {/* --- Profile Card --- */}
                <View style={styles.card}>
                    <View style={styles.profileHeader}>
                        <Image
                            style={styles.avatar}
                            source={{ uri: 'https://xsgames.co/randomusers/avatar.php?g=pixel' }} // Example URI
                            // source={require("../../assets/AccountPage/avatar 1.png")} // Or keep local asset
                        />
                        <View style={styles.profileInfo}>
                            <View style={styles.profileNameRow}>
                                <Text style={styles.profileName}>Tên Người Dùng</Text>
                                <TouchableOpacity>
                                    <Ionicons name="pencil-outline" size={20} color={secondaryTextColor} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.profileDetail}>Đã đăng nhập bằng Google</Text>
                            <Text style={styles.profileDetail}>0 Bài đăng</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
                        <Text style={styles.profileButtonText}>Xem hồ sơ của tôi</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Priority Banner Card --- */}
                <LinearGradient
                    colors={priorityGradientColors}
                    start={{ x: 0.0, y: 0 }}
                    end={{ x: 1.0, y: 0 }} // Horizontal gradient
                    style={[styles.card, styles.priorityBanner]}
                >
                    <Text style={styles.priorityText}>
                        Trở thành thành viên Travelog PRIORITY
                    </Text>
                    <Ionicons name="arrow-forward-circle-outline" size={24} color={colors.white} />
                </LinearGradient>

                {/* --- Payment Options Card --- */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Tùy chọn thanh toán</Text>
                    {paymentOptions.map((item, index) => (
                         // Replace with ViewOptionComponent if its props match
                        <OptionRow
                            key={item.id}
                            icon={item.icon}
                            title={item.title}
                            content={item.content}
                            isLast={index === paymentOptions.length - 1}
                        />
                    ))}
                </View>

                {/* --- Rewards Card --- */}
                <View style={styles.card}>
                     <Text style={styles.sectionTitle}>Phần thưởng của tôi</Text>
                    {rewardsOptions.map((item, index) => (
                        <OptionRow
                            key={item.id}
                            icon={item.icon}
                            title={item.title}
                            content={item.content}
                            isLast={index === rewardsOptions.length - 1}
                        />
                    ))}
                </View>

                 {/* --- Service Card --- */}
                <View style={styles.card}>
                     <Text style={styles.sectionTitle}>Dịch vụ</Text>
                     {serviceOptions.map((item, index) => (
                         <OptionRow
                             key={item.id}
                             icon={item.icon}
                             title={item.title}
                             content={item.content}
                             isLast={index === serviceOptions.length - 1}
                         />
                     ))}
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
        paddingTop: 50, // Adjust for status bar height
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
        width: 40, // Match typical icon button width for centering
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
    // Profile Card
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    avatar: {
        width: 65, // Slightly smaller avatar
        height: 65,
        borderRadius: 32.5, // Make it circular
        marginRight: 15,
    },
    profileInfo: {
        flex: 1, // Take remaining space
    },
    profileNameRow: {
        flexDirection: "row",
        justifyContent: "space-between", // Push edit icon to the right
        alignItems: "center",
        marginBottom: 4,
    },
    profileName: {
        fontWeight: "bold",
        fontSize: 18, // Slightly smaller name
        color: primaryTextColor,
    },
    profileDetail: {
        fontSize: 13, // Smaller detail text
        color: secondaryTextColor,
        marginBottom: 2,
    },
    profileButton: {
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1, // Outline style
        borderColor: themeColor, // Blue border
        alignItems: "center",
    },
    profileButtonText: {
        color: themeColor, // Blue text
        fontSize: 15,
        fontWeight: "600",
    },
    // Priority Banner
    priorityBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18, // More vertical padding
    },
    priorityText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 16, // Slightly smaller text
        flex: 1, // Allow text wrapping
        marginRight: 10,
    },
    // Section Title (within cards)
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: primaryTextColor,
        marginBottom: 10, // Space below title before options
    },
    // Option Row (used within cards)
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // Vertical spacing for each option
        borderBottomWidth: 1,
        borderBottomColor: colors.light_Blue, // Light separator
    },
    optionRowLast: {
        borderBottomWidth: 0, // No border for the last item
    },
    optionIcon: {
        marginRight: 15, // Space between icon and text
    },
    optionTextContainer: {
        flex: 1, // Take available space
        marginRight: 10, // Space before chevron
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '500', // Medium weight
        color: primaryTextColor,
        marginBottom: 3,
    },
    optionContent: {
        fontSize: 13,
        color: secondaryTextColor,
    },

    // --- Remove old, unused styles ---
    // circleBorder, container (absolute), button (old), vip, text (old generic)
});