import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    SafeAreaView,
    Text,
} from "react-native";
import { colors } from "../constants/colors"; // Vẫn dùng colors chung nếu cần
import { Ionicons } from "@expo/vector-icons";

// --- Màu sắc nhất quán (Đã đổi sang Xanh Dương) ---
const lightBackground = "#F4F7FF";      // Nền chính (giữ nguyên xanh rất nhạt)
const themeColor = "#0194F3";          // Xanh dương chính (thay cho tím)
const cardBackgroundColor = colors.white;
const primaryTextColor = "#0A2C4D";
const secondaryTextColor = colors.grey_text;
const linkColor = themeColor;           // Link màu xanh dương chính

const activeTabColor = themeColor;        // Tab active màu xanh dương
const inactiveTabBackground = "#D6EEFF";  // Nền xanh dương rất nhạt cho tab inactive (thay cho tím nhạt)
const inactiveTabColor = "#006ADC";     // Chữ xanh dương đậm hơn cho tab inactive (thay cho tím đậm)

const previewBox1Color = '#D6EEFF';     // Box preview 1 (xanh dương nhạt 1)
const previewBox2Color = '#EBF8FF';     // Box preview 2 (xanh dương nhạt 2)
const previewBox3Color = '#F5FAFF';     // Box preview 3 (xanh dương nhạt 3)

const collectionIconBackgroundColor = previewBox1Color; // Nền icon bookmark (xanh dương nhạt 1)
const collectionIconColor = themeColor;                // Icon bookmark (xanh dương chính)

// --- Component Con: Header (Giữ nguyên) ---
const SavingHeader: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerButtonPlaceholder} />
        <Text style={styles.headerTitle}>Đã lưu</Text>
        <View style={styles.headerButtonPlaceholder} />
    </View>
);

export const SavingScreen: React.FC = () => {

    // --- Component Con: Tab Button (Sử dụng màu xanh mới) ---
    interface TabButtonProps {
        text: string;
        isActive: boolean;
        onPress: () => void;
    }
    const TabButton: React.FC<TabButtonProps> = ({ text, isActive, onPress }) => (
        <TouchableOpacity
            style={[
                styles.tabButtonBase,
                // Sử dụng màu active/inactive mới
                isActive ? styles.tabButtonActive : styles.tabButtonInactive
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.tabButtonTextBase,
                 // Sử dụng màu active/inactive mới
                isActive ? styles.tabButtonTextActive : styles.tabButtonTextInactive
            ]}>
                {text}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.screenContainer}>
            <SavingHeader />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {/* --- Card "Xem tất cả sản phẩm đã lưu" --- */}
                <TouchableOpacity style={styles.cardLink} activeOpacity={0.8}>
                    <View style={styles.cardContentLeft}>
                        <Text style={styles.cardLinkText}>
                            Xem tất cả sản phẩm đã lưu
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color={themeColor} style={styles.cardLinkIcon} />
                    </View>
                    {/* Grid Preview (dùng màu xanh mới) */}
                    <View style={styles.gridPreview}>
                        <View style={[styles.gridLargeBox, { backgroundColor: previewBox1Color }]} />
                        <View style={styles.gridSmallColumn}>
                            <View style={[styles.gridSmallBox, { backgroundColor: previewBox2Color }]} />
                            <View style={[styles.gridSmallBox, { backgroundColor: previewBox3Color }]} />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* --- Card "Hãy sắp xếp các sản phẩm đã lưu!" --- */}
                <View style={styles.card}>
                    <View style={styles.collectionHeader}>
                        <View style={[styles.collectionIconWrapper, { backgroundColor: collectionIconBackgroundColor }]}>
                            <Ionicons name="bookmarks" size={24} color={collectionIconColor} />
                        </View>
                        <View style={styles.collectionTextGroup}>
                            <Text style={styles.collectionTitle}>
                                Hãy sắp xếp các sản phẩm đã lưu!
                            </Text>
                            <Text style={styles.collectionSubtitle}>
                                Tạo danh sách yêu thích và lên kế hoạch dễ dàng khi sắp xếp các sản phẩm đã lưu với Bộ sưu tập!
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.createCollectionLink}>
                        {/* Link màu xanh dương */}
                        <Text style={[styles.createCollectionText, { color: linkColor }]}>Tạo bộ sưu tập mới</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Card "Must-see attractions" --- */}
                <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                    <View style={styles.attractionHeader}>
                        <Text style={styles.attractionTitle}>
                            Những điểm tham quan không thể bỏ qua ✨
                        </Text>
                        <Ionicons name="chevron-forward-outline" size={24} color={secondaryTextColor} />
                    </View>
                </TouchableOpacity>

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
        paddingVertical: 10,
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
    // Card chung
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
    // Card "Xem tất cả"
    cardLink: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
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
    cardContentLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    cardLinkText: {
        fontSize: 15,
        fontWeight: "600",
        color: themeColor, // Màu xanh dương chính
    },
    cardLinkIcon: {
        marginLeft: 6,
    },
    // Grid Preview
    gridPreview: {
        flexDirection: "row",
        alignSelf: 'flex-end',
        paddingLeft: 10,
    },
    gridLargeBox: {
        width: 60,
        height: 75,
        borderRadius: 8,
        marginRight: 6,
    },
    gridSmallColumn: {
        flexDirection: "column",
        justifyContent: "space-between",
    },
    gridSmallBox: {
        width: 45,
        height: 35,
        borderRadius: 8,
        marginBottom: 5,
    },
    // Card "Sắp xếp sản phẩm"
    collectionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    collectionIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 8,
        // backgroundColor được set inline
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    collectionTextGroup: {
        flex: 1,
    },
    collectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: primaryTextColor,
        marginBottom: 4,
    },
    collectionSubtitle: {
        fontSize: 13,
        color: secondaryTextColor,
        lineHeight: 18,
    },
    createCollectionLink: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    createCollectionText: {
        // color được set inline
        fontSize: 14,
        fontWeight: '500',
    },
    // Card "Must-see attractions"
    attractionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    attractionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: primaryTextColor,
        flex: 1,
        marginRight: 10,
    },
    // Tab Button Styles (Đã cập nhật màu)
    tabButtonBase: {
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tabButtonActive: {
        backgroundColor: activeTabColor, // Xanh dương chính
        borderColor: activeTabColor,
    },
    tabButtonInactive: {
        backgroundColor: inactiveTabBackground, // Xanh dương rất nhạt
        borderColor: inactiveTabBackground,
    },
    tabButtonTextBase: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    tabButtonTextActive: {
        color: colors.white, // Chữ trắng
    },
    tabButtonTextInactive: {
        color: inactiveTabColor, // Chữ xanh dương đậm hơn
    },
});