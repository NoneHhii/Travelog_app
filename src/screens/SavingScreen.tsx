import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { TextComponent } from "../components/TextComponent";
import { ButtonComponent } from "../components/ButtonComponent";

const blue = "#0099FF";
const white = "#FFFFFF";
const gray = "#666";

export const SavingScreen: React.FC = () => {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.cardContent} activeOpacity={0.8}>
        {/* Left side */}
        <View style={styles.leftContent}>
          <TextComponent
            text="Xem tất cả sản phẩm đã lưu"
            size={16}
            fontWeight="bold"
            color={blue}
          />
          <Image
            source={require("../../assets/arrow_right.png")}
            style={{ width: 18, height: 18, marginLeft: 6 }}
          />
        </View>

        {/* Right side grid preview */}
        <View style={styles.gridRight}>
          <View style={[styles.leftBox, { backgroundColor: "#dbeafe" }]} />
          <View style={styles.rightColumn}>
            <View style={[styles.smallBox, { backgroundColor: "#e0f2fe" }]} />
            <View style={[styles.smallBox, { backgroundColor: "#f0f9ff" }]} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.row}>
          <Image
            source={require("../../assets/Collection.png")}
            style={{ width: 100, height: 100, resizeMode: "contain" }}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <TextComponent
              text="Hãy sắp xếp các sản phẩm đã lưu!"
              size={20}
              fontWeight="bold"
              styles={{ marginBottom: 4 }}
            />
            <TextComponent
              text="Tạo danh sách yêu thích và lên kế hoạch dễ dàng khi sắp xếp các sản phẩm đã lưu với Bộ sưu tập!"
              size={17}
              color={gray}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.createBtn}>
          <TextComponent
            text="Tạo bộ sưu tập mới"
            color={blue}
            size={20}
            fontWeight="bold"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <TextComponent
            text="Must-see attractions ✨"
            size={24}
            fontWeight="bold"
          />
          <Image
            source={require("../../assets/arrow_right.png")}
            style={{ width: 24, height: 24 }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingTop: 5,
    backgroundColor: "#f8f8f8",
  },
  card: {
    backgroundColor: white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: blue,
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 10,
  },

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  gridRight: {
    flexDirection: "row",
    marginLeft: 16,
  },

  leftBox: {
    width: 70,
    height: 90,
    borderRadius: 12,
    marginRight: 8,
  },

  rightColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
  },

  smallBox: {
    width: 50,
    height: 42,
    borderRadius: 12,
    marginBottom: 6,
  },
});
