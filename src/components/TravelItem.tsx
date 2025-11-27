import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { TextComponent } from "./TextComponent";
import { Travel } from "../types/types"; // Import từ file type chung

interface TravelItemProps {
  travel: Travel;
  onPress: (travel: Travel) => void;
}

export const TravelItem: React.FC<TravelItemProps> = ({
  travel,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(travel)}
      activeOpacity={0.9}
      style={styles.container}
    >
      {/* Phần hình ảnh */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: travel.images[0] }} style={styles.image} />
        {/* Nút bookmark giả lập (UI only) */}
        <View style={styles.bookmarkBadge}>
             <Ionicons name="heart-outline" size={20} color="white" />
        </View>
      </View>

      {/* Phần thông tin */}
      <View style={styles.infoContainer}>
        <TextComponent
          numberOfLines={1}
          text={travel.title}
          fontWeight="bold"
          size={16}
          color="#0A2C4D"
        />

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.grey_text} />
          <TextComponent
            text={travel.departurePoint}
            size={12}
            color={colors.grey_text}
            styles={{ marginLeft: 4, flex: 1 }}
            numberOfLines={1}
          />
        </View>

        <View style={styles.bottomRow}>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color="#FFA500" />
            <TextComponent
              text={`${travel.averageRating ? travel.averageRating.toFixed(1) : "5.0"}`}
              size={13}
              fontWeight="bold"
              color="#0A2C4D"
              styles={{ marginLeft: 4 }}
            />
            <TextComponent
              text={`(${travel.reviewCount})`}
              size={12}
              color={colors.grey_text}
              styles={{ marginLeft: 2 }}
            />
          </View>

          {/* Giá tiền */}
          <TextComponent
            text={`${travel.price.toLocaleString("vi-VN")} ₫`}
            fontWeight="bold"
            color={colors.red}
            size={15}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: 260, // Kích thước thẻ
    marginRight: 16, // Khoảng cách bên phải để dùng trong FlatList horizontal
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 10,
    overflow: 'hidden'
  },
  imageContainer: {
    width: "100%",
    height: 150,
    position: 'relative',
  },
image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bookmarkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 5,
    borderRadius: 20,
  },
  infoContainer: {
    padding: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
