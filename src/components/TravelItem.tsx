import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import travel from "../screens/HomeScreen";
import { TextComponent } from "./TextComponent";
import { Ionicons, FontAwesome } from "@expo/vector-icons"; // Import icons

interface travelProps {
  travel: travel;
  sale?: number;
  size?: number; // Prop này không còn dùng nhiều, kích thước sẽ tự co dãn
  RadiusTop?: number;
  RadiusBottom?: number;
  handleDetail?: (travel: travel) => void;
}

export const TravelItem: React.FC<travelProps> = ({
  travel,
  handleDetail,
}) => {
  return (
    <TouchableOpacity
      onPress={() => handleDetail && handleDetail(travel)}
      style={styles.container}
    >
      {/* Phần hình ảnh */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: travel.images[0] }} style={styles.image} />
      </View>

      {/* Phần thông tin */}
      <View style={styles.infoContainer}>
        <TextComponent
          numberOfLines={1}
          text={travel.title}
          fontWeight="bold"
          size={17}
          color="#0A2C4D"
        />

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.grey_text} />
          <TextComponent
            text={travel.departurePoint}
            size={13}
            color={colors.grey_text}
            styles={{ marginLeft: 4 }}
          />
        </View>

        <View style={styles.bottomRow}>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={16} color="#FFA500" />
            <TextComponent
              text={`${travel.averageRating.toFixed(1)}`}
              size={14}
              fontWeight="bold"
              color="#0A2C4D"
              styles={{ marginLeft: 5 }}
            />
            <TextComponent
              text={`(${travel.reviewCount})`}
              size={13}
              color={colors.grey_text}
              styles={{ marginLeft: 3 }}
            />
          </View>

          {/* Giá tiền */}
          <TextComponent
            text={`${travel.price.toLocaleString("vi-VN")} ₫`}
            fontWeight="bold"
            color={colors.red} // Hoặc màu cam #FF7A2F
            size={16}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Stylesheet cho TravelItem
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: 260, // Kích thước thẻ cố định
    minHeight: 280, // Chiều cao tối thiểu
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 10, // Khoảng cách giữa các thẻ (nếu dùng trong Vertical List)
  },
  imageContainer: {
    width: "100%",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: "cover",
  },
  bookmarkButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 6,
    borderRadius: 20,
  },
  infoContainer: {
    padding: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});