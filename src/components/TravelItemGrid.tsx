import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import travel from "../screens/HomeScreen";
import { TextComponent } from "./TextComponent";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

interface travelProps {
  travel: travel;
  handleDetail?: (travel: travel) => void;
}

export const TravelItemGrid: React.FC<travelProps> = ({
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
          size={15}
          color="#0A2C4D"
        />

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={12}
            color={colors.grey_text}
          />
          <TextComponent
            numberOfLines={1}
            text={travel.departurePoint}
            size={12}
            color={colors.grey_text}
            styles={{ marginLeft: 4, flex: 1 }}
          />
        </View>

        <View style={styles.bottomRow}>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color="#FFA500" />
            <TextComponent
              text={`${travel.averageRating.toFixed(1)}`}
              size={12}
              fontWeight="bold"
              color="#0A2C4D"
              styles={{ marginLeft: 3 }}
            />
            <TextComponent
              text={`(${travel.reviewCount})`}
              size={11}
              color={colors.grey_text}
              styles={{ marginLeft: 2 }}
            />
          </View>

          {/* Giá tiền */}
          <TextComponent
            text={`${travel.price.toLocaleString("vi-VN")} ₫`}
            fontWeight="bold"
            color={colors.red}
            size={14}
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
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 10,
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
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});
