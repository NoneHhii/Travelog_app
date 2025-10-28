import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView, // Thêm
  Text,         // Dùng Text của RN
  ActivityIndicator,
  ScrollView,   // Thêm
} from "react-native";
import { colors } from "../constants/colors";
import { Booking, Guest, InforProps } from "./BookingInfor"; // Giả sử types ở đây
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import createAcronym from "../utils/acronym";
import { ButtonComponent } from "../components/ButtonComponent";
import { createBooking } from "../api/apiClient";
import { Ionicons } from "@expo/vector-icons"; // Thêm
import { RootStackParamList } from "../navigation/RootNavigator";

export interface PaymentType {
  infor: InforProps;
  guests: Guest[];
  contact: { // Thêm contact nếu cần gửi mail
      email: string;
      name: string;
      phone: string;
  };
}

type StackProps = NativeStackScreenProps<RootStackParamList, "Payment">;

// --- Component Con: Header ---
interface PaymentHeaderProps {
  onBackPress: () => void;
}
const PaymentHeader: React.FC<PaymentHeaderProps> = ({ onBackPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
      <Ionicons name="arrow-back" size={24} color="#0A2C4D" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Xác nhận & Thanh toán</Text>
    <View style={styles.headerButton} />
  </View>
);

// --- Component Con: Thẻ Tóm Tắt Thanh Toán ---
const PaymentSummaryCard: React.FC<{ payment: PaymentType }> = ({ payment }) => (
  <View style={styles.card}>
    <Text style={styles.paymentDate}>{payment.infor.travelDate}</Text>
    <View style={styles.routeContainer}>
      <View style={styles.routePoint}>
        <Text style={styles.pointAcronym}>
          {createAcronym(payment.infor.departure)}
        </Text>
        <Text style={styles.pointName}>{payment.infor.departure}</Text>
      </View>
      <View style={styles.dashedLine} />
      <View style={styles.routePoint}>
        <Text style={styles.pointAcronym}>
          {createAcronym(payment.infor.destination)}
        </Text>
        <Text style={styles.pointName}>{payment.infor.destination}</Text>
      </View>
    </View>

    {/* Guest Info */}
    <View style={styles.guestInfoContainer}>
        <View style={styles.guestRow}>
            <Ionicons name="people-outline" size={16} color={colors.grey_text} />
            <Text style={styles.guestText}>{payment.infor.AdultNum} Người lớn</Text>
        </View>
        {payment.infor.Child > 0 && (
            <View style={styles.guestRow}>
            <Ionicons name="person-outline" size={16} color={colors.grey_text} />
            <Text style={styles.guestText}>{payment.infor.Child} Trẻ em</Text>
            </View>
        )}
    </View>

    {/* Separator */}
    <View style={styles.summaryDivider} />

    {/* Contact Info */}
    <View style={styles.contactRow}>
        <Text style={styles.summaryLabel}>Người đại diện:</Text>
        <Text style={styles.summaryValue}>{payment.contact.name || payment.guests[0].fullName}</Text>
    </View>
     <View style={styles.contactRow}>
        <Text style={styles.summaryLabel}>Email:</Text>
        <Text style={styles.summaryValue}>{payment.contact.email}</Text>
    </View>

    {/* Separator */}
    <View style={styles.summaryDivider} />

    {/* Total Price */}
    <Text style={styles.totalLabel}>Tổng tiền cần thanh toán</Text>
    <Text style={styles.totalPriceText}>
      {payment.infor.totalPrice.toLocaleString("vi-VN")} ₫
    </Text>
  </View>
);

// --- Component Con: Thanh Footer Thanh Toán ---
interface PaymentBottomBarProps {
  onPay: () => void;
  loading: boolean;
}
const PaymentBottomBar: React.FC<PaymentBottomBarProps> = ({ onPay, loading }) => (
  <View style={styles.bottomBar}>
    <View style={styles.termsContainer}>
      <Text style={styles.termsTitle}>Điều khoản & Điều kiện</Text>
      <Text style={styles.termsText}>
        Bằng việc nhấn THANH TOÁN bạn đã đồng ý với các{" "}
        <Text style={styles.linkText}>điều khoản & điều kiện</Text> và{" "}
        <Text style={styles.linkText}>chính sách quyền riêng tư</Text> của Travelog.
      </Text>
    </View>
    <ButtonComponent
      type="button"
      text={loading ? "" : "THANH TOÁN"} // Ẩn text khi loading
      onPress={onPay}
      width={"100%"}
      height={50}
      backgroundColor="#0194F3" // Màu xanh
      borderRadius={15}
      disabled={loading} // Disable nút khi loading
    >
      {/* Hiển thị ActivityIndicator khi loading */}
      {loading && <ActivityIndicator size="small" color={colors.white} />}
    </ButtonComponent>
  </View>
);


// --- Component Chính: Payment ---
const Payment: React.FC<StackProps> = ({ navigation, route }) => {
  const { payment } = route.params;
  const [loading, setLoading] = useState(false);

  const postBooking = async (transactionId: string) => { // Nhận transactionId
    try {
      const booking: Booking = {
        bookingDate: new Date().toISOString(), // Dùng ISOString cho chuẩn
        guestDetails: payment.guests,
        numberOfGuests: payment.guests.length,
        paymentInfo: {
          method: "Card", // Hoặc phương thức thanh toán thực tế
          transactionID: transactionId, // Lưu ID giao dịch
        },
        status: "confirmed", // Hoặc "pending" tùy logic
        totalPrice: payment.infor.totalPrice,
        tourID: payment.infor.tourID,
        travelDate: payment.infor.travelDate,
        // Thêm thông tin liên hệ nếu cần lưu vào booking
        contactName: payment.contact.name,
        contactEmail: payment.contact.email,
        contactPhone: payment.contact.phone,
      };

      const newBookingId = await createBooking(booking);
      console.log("Booking created with ID:", newBookingId);
      return newBookingId; // Trả về ID để dùng nếu cần

    } catch (error) {
      console.error("🔥 Lỗi khi tạo booking:", (error as Error).message);
      // Không cần Alert ở đây vì đã có Alert ở handlePayment
      throw error; // Ném lỗi để handlePayment biết
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    // const mockAmount = 1000; // Có thể không cần nữa
    const paymentEmail = payment.contact.email;
    const paymentAmount = payment.infor.totalPrice;

    console.log(`Tiến hành thanh toán ${paymentAmount.toLocaleString('vi-VN')} VND...`);

    try {
      // 1. Giả lập gọi API thanh toán (thay bằng API thật)
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500));
      const mockTransactionId = `TXN_${Date.now()}`; // Tạo ID giao dịch giả
      console.log("Thanh toán thành công. Transaction ID:", mockTransactionId);

      // 2. Tạo booking trên Firestore SAU KHI thanh toán thành công
      await postBooking(mockTransactionId);

      // 3. Giả lập gửi mail xác nhận (thay bằng API thật)
      console.log(`Đang gửi mail xác nhận đến: ${paymentEmail}`);
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      console.log("Mail xác nhận đã gửi.");

      // 4. Thông báo thành công và điều hướng
      Alert.alert(
        "Thành công!",
        `Đã thanh toán thành công ${paymentAmount.toLocaleString( "vi-VN" )} VND.\nEmail xác nhận đã được gửi đến ${paymentEmail}.`,
        [{ text: "OK", onPress: () => navigation.popToTop() }] // Về màn hình Home
      );

    } catch (error) {
      console.error("Lỗi trong quá trình thanh toán/tạo booking/gửi mail:", error);
      Alert.alert(
        "Thất bại",
        "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false); // Luôn tắt loading dù thành công hay thất bại
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PaymentHeader onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView}>
        <PaymentSummaryCard payment={payment} />
        {/* Thêm các phương thức thanh toán khác ở đây nếu cần */}
      </ScrollView>
      <PaymentBottomBar onPay={handlePayment} loading={loading} />
    </SafeAreaView>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF', // Nền xanh nhạt
  },
  scrollView: {
    flex: 1,
    paddingTop: 20, // Thêm khoảng cách trên
  },
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
  headerButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2C4D',
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20, // Thêm khoảng cách dưới card
  },
  paymentDate: {
    color: colors.grey_text,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 15,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  routePoint: {
    alignItems: 'center',
    flex: 0.3,
  },
  pointAcronym: {
    color: '#0A2C4D', // Màu chữ đậm
    fontSize: 28,
    fontWeight: 'bold',
  },
  pointName: {
    color: '#333', // Màu chữ thường
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  dashedLine: {
    flex: 0.4,
    borderBottomWidth: 1,
    borderBottomColor: colors.light_Blue, // Màu nhạt hơn
    borderStyle: 'dashed',
    marginTop: 15,
  },
  guestInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.light_Blue,
    paddingTop: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  guestText: {
    color: '#333',
    fontSize: 15,
    marginLeft: 8,
  },
  summaryDivider: {
      height: 1,
      backgroundColor: colors.light_Blue,
      marginVertical: 15,
  },
  contactRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  summaryLabel: {
      fontSize: 14,
      color: colors.grey_text,
  },
  summaryValue: {
      fontSize: 14,
      color: '#333',
      fontWeight: '500',
  },
  totalLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2C4D',
    marginBottom: 5,
  },
  totalPriceText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7A2F', // Màu cam giá tiền
  },
  bottomBar: {
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
  termsContainer: {
      marginBottom: 15,
  },
  termsTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#0A2C4D',
      marginBottom: 5,
  },
  termsText: {
      fontSize: 13,
      color: colors.grey_text,
      lineHeight: 18,
  },
  linkText: {
      color: colors.blue_splash,
      textDecorationLine: 'underline',
  },
  // Xóa các style cũ không cần thiết
  // constainer, header, title, paymentCard, footer, txtPrice
});

export default Payment;