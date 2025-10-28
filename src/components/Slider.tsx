import React from "react";
import travel from "../screens/HomeScreen";
import { View, FlatList, StyleSheet } from "react-native";
import { TravelItem } from "../components/TravelItem"; // Đảm bảo import đúng

interface travelProps {
  travels: travel[];
  sale?: number;
  size?: number;
  RadiusTop?: number;
  RadiusBottom?: number;
  handleDetail?: (travel: travel) => void;
}

export const Slider: React.FC<travelProps> = ({
  travels,
  RadiusTop = 0, // Props này giờ được quản lý trong TravelItem
  RadiusBottom = 0, // Props này giờ được quản lý trong TravelItem
  handleDetail,
}) => {
  const renderItem = ({ item }: { item: travel }) => (
    <View key={item.id} style={styles.itemContainer}>
      <TravelItem
        travel={item}
        // Radius props không cần thiết nữa nếu TravelItem tự quản lý
        handleDetail={handleDetail}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={travels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Thêm contentContainerStyle để có padding ở 2 đầu
        contentContainerStyle={styles.flatlistContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10, // Giảm margin top
  },
  flatlistContent: {
    paddingHorizontal: 12, // Padding 20 ở đầu, 12 ở giữa
  },
  itemContainer: {
    marginHorizontal: 8, // Khoảng cách giữa các item
  },
});