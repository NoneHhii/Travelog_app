import React from "react";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { TextComponent } from "../components/TextComponent";
import { ButtonComponent } from "../components/ButtonComponent";

const blue = "#047cccff";
const white = "#FFFFFF";
const orange = "#dc6611ff";

export const BookingScreen: React.FC = () => {
  const tabs = ["Vé máy bay", "Khách sạn", "Vui chơi", "Ngân hàng"];
  const [selectedTab, setSelectedTab] = useState("Vé máy bay");
  const suggestions = ["Khách sạn", "Hoạt động du lịch", "Tất cả"];
  const [selectedSuggestion, setSelectedSuggestion] = useState("Khách sạn");

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      {/* Empty State */}
      <View style={styles.emptyState}>
        <Image
          source={require("../../assets/KhongYeuCauDatCho.png")}
          style={{ width: 195, height: 195, resizeMode: "contain" }}
        />

        <TextComponent
          text="Bạn hiện không có bất kỳ yêu cầu đặt chỗ nào"
          size={20}
          fontWeight="bold"
          color="#333"
          styles={{ textAlign: "center", marginBottom: 12 }}
        />

        <TextComponent
          text="Khám phá cuộc phiêu lưu mới với những ý tưởng truyền cảm hứng của chúng tôi dưới đây! Nếu bạn không thể tìm thấy đặt chỗ trước đó của mình, hãy thử đăng nhập bằng email mà bạn đã sử dụng khi đặt chỗ."
          size={10}
          color="#666"
          styles={{ textAlign: "center", lineHeight: 15 }}
        />
      </View>

      <View style={{ backgroundColor: "white", borderRadius: 20, margin: 10 }}>
        <View style={styles.couponContainer}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: "#0099FF",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/Coupon.png")}
              style={{ width: 35, height: 35, resizeMode: "contain" }}
            />
          </View>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <TextComponent
              text="Thư viện coupon"
              fontWeight="bold"
              size={25}
              styles={{ marginBottom: 4 }}
            />
            <TextComponent
              text="Cập nhật đều đặn tại Trang Chủ và Đặt chỗ"
              size={15}
              color="#666"
            />
          </View>

          <TouchableOpacity style={{ justifyContent: "center" }}>
            <Image
              source={require("../../assets/arrow_right.png")}
              style={{ width: 35, height: 35, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = tab === selectedTab;
            return (
              <ButtonComponent
                key={tab}
                text={tab}
                type="button"
                backgroundColor={isActive ? blue : white}
                textColor={isActive ? white : blue}
                borderRadius={50}
                onPress={() => setSelectedTab(tab)}
                bold
              />
            );
          })}
        </View>
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginBottom: 16,
            backgroundColor: orange,
            margin: 20,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <TextComponent
            text="Xem thêm ưu đãi"
            color={white}
            fontWeight="bold"
            size={20}
          />
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: "white", borderRadius: 20, margin: 10 }}>
        <View style={styles.couponContainer}>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <TextComponent
              text="🔥Đề xuất tuyệt vời"
              fontWeight="bold"
              size={25}
              styles={{ marginBottom: 4 }}
            />
            <TextComponent
              text="Gợi ý hoàn hảo cho chuyến đi trọn vẹn"
              size={15}
              color="#666"
            />
          </View>

          <TouchableOpacity style={{ justifyContent: "center" }}>
            <Image
              source={require("../../assets/arrow_right.png")}
              style={{ width: 35, height: 35, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.tabsContainer}>
          {suggestions.map((suggestion) => {
            const isActive = suggestion === selectedSuggestion;
            return (
              <ButtonComponent
                key={suggestion}
                text={suggestion}
                type="button"
                backgroundColor={isActive ? blue : white}
                textColor={isActive ? white : blue}
                borderRadius={50}
                bold
                onPress={() => setSelectedSuggestion(suggestion)}
              />
            );
          })}
        </View>
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginBottom: 16,
            backgroundColor: blue,
            margin: 20,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <TextComponent
            text="Xem thêm"
            color={white}
            fontWeight="bold"
            size={20}
          />
        </TouchableOpacity>
      </View>
      <TextComponent
        text="Tất cả các hoạt động mua hàng và hoàn vé"
        fontWeight="bold"
        size={20}
        styles={{ margin: 12 }}
      />
      <View style={styles.activityContainer}>
        <TouchableOpacity style={styles.item}>
          <TextComponent
            text="Danh sách mua hàng của bạn"
            size={12}
            flex={1}
            fontWeight="bold"
          />
          <Image
            source={require("../../assets/arrow_right.png")}
            style={{ width: 35, height: 35, resizeMode: "contain" }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <TextComponent
            text="Khoản hoàn tiền của bạn"
            size={12}
            flex={1}
            fontWeight="bold"
          />
          <Image
            source={require("../../assets/arrow_right.png")}
            style={{ width: 35, height: 35, resizeMode: "contain" }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.item, { borderBottomWidth: 0 }]}>
          <TextComponent
            text="Đánh giá trải nghiệm gần đây của bạn"
            size={12}
            flex={1}
            fontWeight="bold"
          />
          <Image
            source={require("../../assets/arrow_right.png")}
            style={{ width: 35, height: 35, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 12,
    paddingTop: 5,
  },
  emptyState: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  couponContainer: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  activityContainer: {
    padding: 10,
  },
  item: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#eee",
    margin: 10,
    padding: 12,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
});
