import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Text,
  FlatList, // Sử dụng FlatList
  ActivityIndicator
} from "react-native";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// --- Import Types and API ---
import travel, { RootStackParamList } from "./HomeScreen";
import { getAllTravel } from "../api/apiClient";
// --- THAY ĐỔI: Import TravelItem thay vì Slider ---
import { TravelItem } from "../components/TravelItem";

// --- Màu sắc nhất quán ---
const lightBackground = "#F4F7FF";
const themeColor = "#0194F3";
const cardBackgroundColor = colors.white;
const primaryTextColor = "#0A2C4D";
const secondaryTextColor = colors.grey_text;
const linkColor = themeColor;
const previewBox1Color = '#D6EEFF';
const previewBox2Color = '#EBF8FF';
const previewBox3Color = '#F5FAFF';
const collectionIconBackgroundColor = previewBox1Color;
const collectionIconColor = themeColor;

type SavingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SavingHeader: React.FC = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerButtonPlaceholder} />
    <Text style={styles.headerTitle}>Đã lưu</Text>
    <View style={styles.headerButtonPlaceholder} />
  </View>
);

const useSavedTravels = () => {
  const [savedTravels, setSavedTravels] = useState<travel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllTravel();
        setSavedTravels(data);
      } catch (err) {
        console.error("Error fetching saved travels:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { savedTravels, isLoading, error };
};


export const SavingScreen: React.FC = () => {
  const navigation = useNavigation<SavingScreenNavigationProp>();
  const { savedTravels, isLoading, error } = useSavedTravels();

  const handleDetail = useCallback(
    (item: travel) => {
      navigation.navigate("TravelDetail", { travel: item });
    },
    [navigation]
  );


  return (
    <SafeAreaView style={styles.screenContainer}>
      <SavingHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <TouchableOpacity style={styles.cardLink} activeOpacity={0.8}>
          <View style={styles.cardContentLeft}>
            <Text style={styles.cardLinkText}>
              Xem tất cả sản phẩm đã lưu
            </Text>
            <Ionicons name="arrow-forward" size={18} color={themeColor} style={styles.cardLinkIcon} />
          </View>
          <View style={styles.gridPreview}>
            <View style={[styles.gridLargeBox, { backgroundColor: previewBox1Color }]} />
            <View style={styles.gridSmallColumn}>
              <View style={[styles.gridSmallBox, { backgroundColor: previewBox2Color }]} />
              <View style={[styles.gridSmallBox, { backgroundColor: previewBox3Color }]} />
            </View>
          </View>
        </TouchableOpacity>

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
            <Text style={[styles.createCollectionText, { color: linkColor }]}>Tạo bộ sưu tập mới</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.attractionHeader} activeOpacity={0.7}>
            <Text style={styles.attractionTitle}>
              Những điểm tham quan không thể bỏ qua ✨
            </Text>
            <Ionicons name="chevron-forward-outline" size={24} color={secondaryTextColor} />
          </TouchableOpacity>

          {isLoading ? (
            <ActivityIndicator size="small" color={themeColor} style={{ marginTop: 10 }} />
          ) : error ? (
            <Text style={[styles.errorText, { marginTop: 10 }]}>Lỗi tải gợi ý.</Text>
          ) : savedTravels.length > 0 ? (
            // --- THAY ĐỔI: Dùng FlatList + TravelItem ---
            <FlatList
              data={savedTravels}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TravelItem travel={item} onPress={handleDetail} />
              )}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          ) : (
            <Text style={styles.noSuggestionText}>Hiện chưa có gợi ý nào.</Text>
          )}

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
  // Card "Xem tất cả"
  cardLink: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
  cardContentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: themeColor,
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
    fontSize: 14,
    fontWeight: '500',
  },
  // Card "Must-see attractions"
  attractionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  attractionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: primaryTextColor,
    flex: 1,
    marginRight: 10,
  },
  // Styles cho phần Slider ngang
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