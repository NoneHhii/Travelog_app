import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import travel from "./HomeScreen"; 
import { colors } from "../constants/colors";
import { ButtonComponent } from "../components/ButtonComponent";
import { InforProps } from "./BookingInfor";
import { Ionicons } from "@expo/vector-icons";
import { TextComponent } from "../components/TextComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/RootNavigator";
// --- Types ---

type StackProps = NativeStackScreenProps<RootStackParamList, "BookingTour">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface BookingHeaderProps {
  onBackPress: () => void;
}
const BookingHeader: React.FC<BookingHeaderProps> = ({ onBackPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
      <Ionicons name="arrow-back" size={24} color="#0A2C4D" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Chọn ngày & số lượng</Text>
    <View style={styles.headerButton} />
  </View>
);

interface DateSelectorProps {
  dates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}
const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  selectedDate,
  onSelectDate,
}) => {
  const formatDate = (date: Date): string => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return `${days[date.getDay()]}\n${date.getDate()}/${date.getMonth() + 1}`;
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = item.toDateString() === selectedDate.toDateString();
    return (
      <TouchableOpacity
        style={[styles.dateButton, isSelected && styles.selectedDateButton]}
        onPress={() => onSelectDate(item)}
      >
        <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
          {formatDate(item)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={dates}
      renderItem={renderDateItem}
      keyExtractor={(item) => item.toISOString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dateListContainer}
    />
  );
};

interface CounterRowProps {
  label: string;
  price: number;
  description: string;
  count: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabledDecrease: boolean;
}
const CounterRow: React.FC<CounterRowProps> = ({
  label,
  price,
  description,
  count,
  onDecrease,
  onIncrease,
  disabledDecrease,
}) => (
  <View style={styles.counterRow}>
    <View style={styles.textContainer}>
      <Text style={styles.counterLabel}>{label}</Text>
      <Text style={styles.txtPrice}>{price.toLocaleString("vi-VN")} ₫</Text>
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
    <View style={styles.counterControls}>
      <TouchableOpacity
        style={[styles.btnQuan, disabledDecrease && styles.btnQuanDisabled]}
        onPress={onDecrease}
        disabled={disabledDecrease}
      >
        <Ionicons
          name="remove"
          size={18}
          color={disabledDecrease ? colors.grey_text : "#6A5AE0"}
        />
      </TouchableOpacity>
      <Text style={styles.countText}>{count}</Text>
      <TouchableOpacity style={styles.btnQuan} onPress={onIncrease}>
        <Ionicons name="add" size={18} color="#6A5AE0" />
      </TouchableOpacity>
    </View>
  </View>
);

const PassengerSelector: React.FC<{
  travelPrice: number;
  selectedAdults: number;
  setSelectedAdults: (val: number) => void;
  selectedChildren: number;
  setSelectedChildren: (val: number) => void;
}> = ({
  travelPrice,
  selectedAdults,
  setSelectedAdults,
  selectedChildren,
  setSelectedChildren,
}) => (
  <View style={styles.card}>
    <CounterRow
      label="Người lớn"
      price={travelPrice}
      description="140cm trở lên"
      count={selectedAdults}
      onDecrease={() =>
        setSelectedAdults(selectedAdults > 1 ? selectedAdults - 1 : 1)
      }
      onIncrease={() => setSelectedAdults(selectedAdults + 1)}
      disabledDecrease={selectedAdults === 1}
    />
    <View style={styles.counterDivider} />
    <CounterRow
      label="Trẻ em"
      price={travelPrice * 0.3}
      description="100 - 139cm"
      count={selectedChildren}
      onDecrease={() =>
        setSelectedChildren(selectedChildren > 0 ? selectedChildren - 1 : 0)
      }
      onIncrease={() => setSelectedChildren(selectedChildren + 1)}
      disabledDecrease={selectedChildren === 0}
    />
  </View>
);

interface BookingBottomBarProps {
  totalPrice: number;
  onBookNow: () => void;
}
const BookingBottomBar: React.FC<BookingBottomBarProps> = ({
  totalPrice,
  onBookNow,
}) => (
  <View style={styles.bottomBar}>
    <View style={styles.priceContainer}>
      <Text style={styles.priceLabel}>Tổng giá:</Text>
      <Text style={styles.priceText}>
        {totalPrice.toLocaleString("vi-VN")} ₫
      </Text>
      <Text style={styles.priceSubLabel}>Bao gồm cả thuế và phí</Text>
    </View>
    <View style={styles.bookButtonContainer}>
      <ButtonComponent
        type="button"
        text="Đặt ngay"
        textColor={colors.white}
        onPress={onBookNow}
        width={"100%"}
        height={50}
        backgroundColor="#0194F3"
        borderRadius={15}
      />
    </View>
  </View>
);

const BookingTour: React.FC<StackProps> = ({ navigation, route }) => {
  const { travel, destinationName } = route.params;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedAdults, setSelectedAdults] = useState<number>(1);
  const [selectedChildren, setSelectedChildren] = useState<number>(0);

  useEffect(() => {
    const generateDates = () => {
      const dateList: Date[] = [];
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dateList.push(date);
      }
      setDates(dateList);
    };
    generateDates();
  }, []);

  const totalPrice = useCallback(() => {
    return (
      travel.price * selectedAdults + travel.price * 0.3 * selectedChildren
    );
  }, [travel.price, selectedAdults, selectedChildren]);

  const handleInfor = useCallback(() => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const dateTravel = `${
      days[selectedDate.getDay()]
    } ${selectedDate.getDate()} tháng ${
      selectedDate.getMonth() + 1
    } ${selectedDate.getFullYear()}`;

    const props: InforProps = {
      tourID: travel.id,
      AdultNum: selectedAdults,
      Child: selectedChildren,
      totalPrice: totalPrice(),
      travelDate: dateTravel,
      departure: travel.departurePoint,
      destination: destinationName,
    };

    navigation.navigate("BookingInfor", { props });
  }, [
    navigation,
    travel,
    destinationName,
    selectedDate,
    selectedAdults,
    selectedChildren,
    totalPrice,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <BookingHeader onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.tourTitle}>Vé {travel.title}</Text>

        <DateSelector
          dates={dates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <PassengerSelector
          travelPrice={travel.price}
          selectedAdults={selectedAdults}
          setSelectedAdults={setSelectedAdults}
          selectedChildren={selectedChildren}
          setSelectedChildren={setSelectedChildren}
        />
      </ScrollView>

      <BookingBottomBar totalPrice={totalPrice()} onBookNow={handleInfor} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FF",
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomColor: colors.light_Blue,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A2C4D",
  },
  tourTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A2C4D",
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dateListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  dateButton: {
    width: 65,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedDateButton: {
    backgroundColor: "#0194F3",
    elevation: 4,
  },
  dateText: {
    fontSize: 14,
    textAlign: "center",
    color: colors.light_black,
    fontWeight: "500",
  },
  selectedDateText: {
    color: colors.white,
    fontWeight: "bold",
  },
  card: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  counterDivider: {
    borderTopColor: colors.light_Blue,
    borderTopWidth: 1,
    marginHorizontal: 15,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  counterLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0A2C4D",
  },
  txtPrice: {
    marginVertical: 2,
    fontSize: 15,
    fontWeight: "bold",
    color: colors.red,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.grey_text,
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnQuan: {
    width: 30,
    height: 30,
    backgroundColor: "#EAF2FF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  btnQuanDisabled: {
    backgroundColor: colors.light,
  },
  countText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A2C4D",
    marginHorizontal: 15,
    width: 25,
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.light_Blue,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingBottom: 20,
  },
  priceContainer: {
    flex: 0.5,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.grey_text,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF7A2F",
  },
  priceSubLabel: {
    color: colors.grey_text,
    fontWeight: "500",
    fontSize: 12,
  },
  bookButtonContainer: {
    flex: 0.45,
  },
});

export default BookingTour;