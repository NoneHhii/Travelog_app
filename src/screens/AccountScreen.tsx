import React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// Assuming ViewOptionComponent exists and is styled correctly
// import ViewOptionComponent from "../components/ViewOptionComponent";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { AssignProp } from "./Assign";

const lightBackground = "#F4F7FF";
const themeColor = "#0194F3";
const cardBackgroundColor = colors.white;
const primaryTextColor = "#0A2C4D";
const secondaryTextColor = colors.grey_text;
const priorityGradientColors = ["#007AFF", "#0052D4"];

const AccountHeader: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerButtonPlaceholder} />
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={styles.headerButtonPlaceholder} />
    </View>
);

const paymentOptions = [
    {
        id: "payment",
        icon: "card-outline" as const,
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
        description: "",
    },
    {
        id: 2,
        icon: "flag-outline" as const,
        title: "Nhiệm vụ của tôi",
        content: "Hoàn thành nhiều Nhiệm vụ hơn, mở khóa nhiều phần thưởng hơn",
        description: "",
    },
    {
        id: 3,
        icon: "pricetags-outline" as const,
        title: "Coupon của tôi",
        content: "Xem các coupon bạn có thể sử dụng ngay bây giờ",
        description: "đăng nhập hoặc đăng ký ngay để nhận các mã giảm giá hấp dẫn phù hợp với nhu cầu của bạn",
    },
    {
        id: 4,
        icon: "ribbon-outline" as const,
        title: "Khu vực thưởng",
        content: "Theo dõi các chương trình phần thưởng bạn đã tham gia",
        description: "đăng nhập hoặc đăng ký ngay để nhận các chương trình khuyến mãi hấp dẫn phù hợp với nhu cầu của bạn",
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
        title: "Liên hệ với chúng tôi",
        content: "Nhận trợ giúp từ Dịch vụ khách hàng của chúng tôi",
    },
    {
        id: 3,
        icon: "settings-outline" as const,
        title: "Cài đặt",
        content: "Xem và đặt tùy chọn tài khoản của bạn",
    },
];

interface OptionRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    content: string;
    onPress?: () => void;
    isLast?: boolean;
}

export const OptionRow: React.FC<OptionRowProps> = ({ icon, title, content, onPress, isLast }) => (
    <TouchableOpacity style={[styles.optionRow, isLast && styles.optionRowLast]} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={24} color={themeColor} style={styles.optionIcon} />
        <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionContent}>{content}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={secondaryTextColor} />
    </TouchableOpacity>
);

type Stack = NativeStackScreenProps<RootStackParamList, 'AccountScreen'>

export const AccountScreen: React.FC<Stack> = ({ navigation }) => {

    const { user, loading } = useAuth();

    const handleCard = () => {
        const prop : AssignProp = {
            title: 'Thanh toán',
            description: "Thêm thông tin thẻ tín dụng của bạn vào Thanh toán và tận hưởng thanh toán liền mạch chỉ bằng một lần chạm!"
        }
        if(user) navigation.navigate("CardPayment")  
        else navigation.navigate("Assign", {prop});
    }

    const handleAward = (title: string, description: string, id: number) => {
        const prop : AssignProp = {
            title: title,
            description: description
        }
        if(!user) navigation.navigate("Assign", {prop});
        else {
            if(id === 3) navigation.navigate('MyCoupon');
            else if(id === 4) navigation.navigate('RewardZone');
        }
    }

    const handleService = (id: number) => {
        if(id === 2) {
            navigation.navigate('ContactUs');
        } else if(id === 3) {
            navigation.navigate('SettingScreen', {user});
        }
    }

    return (
        <SafeAreaView style={styles.screenContainer}>
            <AccountHeader />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
            >
                <View style={styles.card}>
                    {user ? (
                        <View style={styles.profileHeader}>
                            <Image
                                style={styles.avatar}
                                source={{ uri: 'https://xsgames.co/randomusers/avatar.php?g=pixel' }}
                            />
                            <View style={styles.profileInfo}>
                                <View style={styles.profileNameRow}>
                                    <Text style={styles.profileName}>{user ? user.displayName : ""}</Text>
                                    <TouchableOpacity>
                                        <Ionicons name="pencil-outline" size={20} color={secondaryTextColor} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.profileDetail}>Đã đăng nhập bằng Google</Text>
                                <Text style={styles.profileDetail}>0 Bài đăng</Text>
                            </View>
                        </View>
                    ): (
                        <Text>Trở thành thành viên và tận hưởng những lợi ích</Text>
                    )}
                    {user ? (
                        <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
                            <Text style={styles.profileButtonText}>Xem hồ sơ của tôi</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={styles.profileButton} 
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={styles.profileButtonText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <LinearGradient
                    colors={priorityGradientColors}
                    start={{ x: 0.0, y: 0 }}
                    end={{ x: 1.0, y: 0 }}
                    style={[styles.card, styles.priorityBanner]}
                >
                    <Text style={styles.priorityText}>
                        Trở thành thành viên Travelog PRIORITY
                    </Text>
                    <Ionicons name="arrow-forward-circle-outline" size={24} color={colors.white} />
                </LinearGradient>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Tùy chọn thanh toán</Text>
                    {paymentOptions.map((item, index) => (
                        <OptionRow
                            key={item.id}
                            icon={item.icon}
                            title={item.title}
                            content={item.content}
                            isLast={index === paymentOptions.length - 1}
                            onPress={() => handleCard()}
                        />
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Phần thưởng của tôi</Text>
                    {rewardsOptions.map((item, index) => (
                        <OptionRow
                            key={item.id}
                            icon={item.icon}
                            title={index === 0 ? `${user?.pointReward.toString() || '0'} điểm` : item.title}
                            content={item.content}
                            isLast={index === rewardsOptions.length - 1}
                            onPress={() => handleAward(item.title, item.description, item.id)}
                        />
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Dịch vụ</Text>
                    {serviceOptions.map((item, index) => (
                        <OptionRow
                            key={item.id}
                            icon={item.icon}
                            title={item.title}
                            content={item.content}
                            isLast={index === serviceOptions.length - 1}
                            onPress={() => handleService(item.id)}
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
        width: 65,
        height: 65,
        borderRadius: 32.5,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    profileNameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    profileName: {
        fontWeight: "bold",
        fontSize: 18,
        color: primaryTextColor,
    },
    profileDetail: {
        fontSize: 13,
        color: secondaryTextColor,
        marginBottom: 2,
    },
    profileButton: {
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themeColor,
        alignItems: "center",
    },
    profileButtonText: {
        color: themeColor,
        fontSize: 15,
        fontWeight: "600",
    },
    // Priority Banner
    priorityBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
    },
    priorityText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 16,
        flex: 1,
        marginRight: 10,
    },
    // Section Title (within cards)
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: primaryTextColor,
        marginBottom: 10,
    },
    // Option Row (used within cards)
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.light_Blue,
    },
    optionRowLast: {
        borderBottomWidth: 0,
    },
    optionIcon: {
        marginRight: 15,
    },
    optionTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: primaryTextColor,
        marginBottom: 3,
    },
    optionContent: {
        fontSize: 13,
        color: secondaryTextColor,
    },
});