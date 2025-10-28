import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { TextComponent } from "../components/TextComponent";
import { TravelItemGrid } from "../components/TravelItemGrid";
import { getAllTravel } from "../api/apiClient";
import travel from "./HomeScreen";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Import RootStackParamList từ RootNavigator để type safety
type RootStackParamList = {
  Search: undefined;
  TravelDetail: { travel: travel };
};

type SearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Search"
>;

type SortOption = "relevance" | "price-low" | "price-high" | "rating";
type FilterOption = {
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
};

const useSearchData = () => {
  const [travels, setTravels] = useState<travel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getAllTravel();
        setTravels(data as travel[]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { travels, isLoading, error };
};

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FilterOption>({
    minPrice: null,
    maxPrice: null,
    minRating: null,
  });

  const { travels, isLoading, error } = useSearchData();
  const inputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Filter và sort logic
  const filteredTravels = useMemo(() => {
    let result = travels;

    // Filter theo search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (travel) =>
          travel.title.toLowerCase().includes(query) ||
          travel.departurePoint.toLowerCase().includes(query) ||
          travel.description?.toLowerCase().includes(query)
      );
    }

    // Filter theo giá
    if (filter.minPrice !== null) {
      result = result.filter((travel) => travel.price >= filter.minPrice!);
    }
    if (filter.maxPrice !== null) {
      result = result.filter((travel) => travel.price <= filter.maxPrice!);
    }

    // Filter theo rating
    if (filter.minRating !== null) {
      result = result.filter(
        (travel) => travel.averageRating >= filter.minRating!
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "relevance":
      default:
        // Sort theo relevance (có search query thì match nhiều hơn lên trước)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          result = [...result].sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(query);
            const bTitleMatch = b.title.toLowerCase().includes(query);
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            return 0;
          });
        }
        break;
    }

    return result;
  }, [travels, searchQuery, sortBy, filter]);

  const handleDetail = useCallback(
    (travel: travel) => {
      navigation.navigate("TravelDetail", { travel });
    },
    [navigation]
  );

  const clearFilters = () => {
    setFilter({
      minPrice: null,
      maxPrice: null,
      minRating: null,
    });
    setSortBy("relevance");
  };

  const hasActiveFilters =
    filter.minPrice !== null ||
    filter.maxPrice !== null ||
    filter.minRating !== null ||
    sortBy !== "relevance";

  const renderTravelItem = ({ item }: { item: travel }) => (
    <View style={styles.travelItemWrapper}>
      <TravelItemGrid travel={item} handleDetail={handleDetail} />
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <TextComponent text="Lỗi tải dữ liệu" color={colors.red} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#E0F7FF"
        translucent
      />
      <LinearGradient
        colors={["#E0F7FF", "#FFFFFF"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        {/* Header với back button và title */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0A2C4D" />
          </TouchableOpacity>
          <TextComponent
            text="Tìm kiếm tour"
            size={22}
            fontWeight="bold"
            color="#0A2C4D"
          />
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={22}
            color={colors.grey_text}
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            placeholder="Tìm kiếm điểm đến, tour..."
            placeholderTextColor={colors.grey_text}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.grey_text}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter và Sort Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showFilters && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={showFilters ? colors.white : "#0194F3"}
            />
            <TextComponent
              text="Lọc"
              size={13}
              fontWeight="600"
              color={showFilters ? colors.white : "#0194F3"}
              styles={{ marginLeft: 5 }}
            />
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <View style={styles.filterDot} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.sortContainer}>
            <TextComponent
              text="Sắp xếp: "
              size={13}
              color={colors.grey_text}
            />
            <View style={styles.sortButtons}>
              {(
                [
                  { key: "relevance", label: "Liên quan" },
                  { key: "price-low", label: "Giá thấp" },
                  { key: "price-high", label: "Giá cao" },
                  { key: "rating", label: "Đánh giá" },
                ] as const
              ).map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortButton,
                    sortBy === option.key && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(option.key as SortOption)}
                >
                  <TextComponent
                    text={option.label}
                    size={12}
                    fontWeight={sortBy === option.key ? "600" : "400"}
                    color={sortBy === option.key ? "#0194F3" : colors.grey_text}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Filter Panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterSection}>
              <TextComponent
                text="Khoảng giá"
                size={14}
                fontWeight="600"
                color="#0A2C4D"
                styles={{ marginBottom: 10 }}
              />
              <View style={styles.priceInputRow}>
                <View style={styles.priceInput}>
                  <TextComponent
                    text="Từ"
                    size={12}
                    color={colors.grey_text}
                    styles={{ marginBottom: 5 }}
                  />
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={
                      filter.minPrice !== null ? filter.minPrice.toString() : ""
                    }
                    onChangeText={(text) =>
                      setFilter({
                        ...filter,
                        minPrice: text ? parseInt(text) : null,
                      })
                    }
                  />
                </View>
                <View style={styles.priceInput}>
                  <TextComponent
                    text="Đến"
                    size={12}
                    color={colors.grey_text}
                    styles={{ marginBottom: 5 }}
                  />
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={
                      filter.maxPrice !== null ? filter.maxPrice.toString() : ""
                    }
                    onChangeText={(text) =>
                      setFilter({
                        ...filter,
                        maxPrice: text ? parseInt(text) : null,
                      })
                    }
                  />
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <TextComponent
                text="Đánh giá tối thiểu"
                size={14}
                fontWeight="600"
                color="#0A2C4D"
                styles={{ marginBottom: 10 }}
              />
              <View style={styles.ratingButtons}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      filter.minRating === rating && styles.ratingButtonActive,
                    ]}
                    onPress={() =>
                      setFilter({
                        ...filter,
                        minRating: filter.minRating === rating ? null : rating,
                      })
                    }
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={
                        filter.minRating === rating
                          ? "#FFA500"
                          : colors.grey_text
                      }
                    />
                    <TextComponent
                      text={`${rating}+`}
                      size={12}
                      fontWeight={filter.minRating === rating ? "600" : "400"}
                      color={
                        filter.minRating === rating
                          ? "#0A2C4D"
                          : colors.grey_text
                      }
                      styles={{ marginLeft: 3 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Ionicons name="close-circle" size={18} color={colors.white} />
                <TextComponent
                  text="Xóa bộ lọc"
                  size={13}
                  fontWeight="600"
                  color={colors.white}
                  styles={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsCount}>
          <TextComponent
            text={`Tìm thấy ${filteredTravels.length} tour`}
            size={13}
            color={colors.grey_text}
          />
        </View>
      </LinearGradient>

      {/* Results List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0194F3" />
        </View>
      ) : filteredTravels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={colors.grey_text} />
          <TextComponent
            text={
              searchQuery.trim()
                ? "Không tìm thấy tour nào"
                : "Nhập từ khóa để tìm kiếm"
            }
            size={16}
            color={colors.grey_text}
            styles={{ marginTop: 16 }}
          />
          <TextComponent
            text="Thử tìm kiếm với từ khóa khác"
            size={14}
            color={colors.grey_text}
            styles={{ marginTop: 8 }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredTravels}
          renderItem={renderTravelItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <SafeAreaView style={styles.safeAreaBottom} edges={["bottom"]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeAreaBottom: {
    flex: 0,
    backgroundColor: "transparent",
  },
  header: {
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0194F3",
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: "#0194F3",
    borderColor: "#0194F3",
  },
  filterBadge: {
    marginLeft: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
    position: "absolute",
    top: -2,
    right: -2,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  sortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 5,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sortButtonActive: {
    backgroundColor: "#EAF8FF",
    borderColor: "#0194F3",
  },
  filterPanel: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filterSection: {
    marginBottom: 15,
  },
  priceInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceInput: {
    flex: 0.48,
  },
  priceTextInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  ratingButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: colors.white,
  },
  ratingButtonActive: {
    backgroundColor: "#FFF9E6",
    borderColor: "#FFA500",
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 5,
  },
  resultsCount: {
    marginTop: 10,
    paddingVertical: 5,
  },
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
  travelItemWrapper: {
    width: "48%",
    marginBottom: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },
});
