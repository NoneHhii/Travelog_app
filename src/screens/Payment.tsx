import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { colors } from "../constants/colors";
import { Booking, Coupon, Guest, InforProps } from "./BookingInfor";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import createAcronym from "../utils/acronym";
import { ButtonComponent } from "../components/ButtonComponent";
import { checkPaymentStatus, createBooking, createPayOSLink } from "../api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import * as WebBrowser from 'expo-web-browser'; // Import WebBrowser
import * as Linking from 'expo-linking'; // Import Linking

export interface PaymentType {
  infor: InforProps;
  guests: Guest[];
  contact: {
      email: string;
      name: string;
      phone: string;
  };
  // THÊM 2 TRƯỜNG NÀY
  finalPrice?: number; // Giá sau khi giảm
  coupon?: Coupon | null; // Mã giảm giá đã áp dụng
}

type StackProps = NativeStackScreenProps<RootStackParamList, "Payment">;

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

    <View style={styles.summaryDivider} />

    <View style={styles.contactRow}>
        <Text style={styles.summaryLabel}>Người đại diện:</Text>
        <Text style={styles.summaryValue}>{payment.contact.name || payment.guests[0].fullName}</Text>
    </View>
     <View style={styles.contactRow}>
        <Text style={styles.summaryLabel}>Email:</Text>
        <Text style={styles.summaryValue}>{payment.contact.email}</Text>
    </View>

    <View style={styles.summaryDivider} />

    <Text style={styles.totalLabel}>Tổng tiền cần thanh toán</Text>
    <Text style={styles.totalPriceText}>
      {payment.finalPrice?.toLocaleString("vi-VN")} ₫
    </Text>
  </View>
);

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
      text={loading ? "" : "THANH TOÁN"}
      onPress={onPay}
      width={"100%"}
      height={50}
      backgroundColor="#0194F3"
      borderRadius={15}
      disabled={loading}
    >
      {loading && <ActivityIndicator size="small" color={colors.white} />}
    </ButtonComponent>
  </View>
);

const Payment: React.FC<StackProps> = ({ navigation, route }) => {
  const { payment } = route.params;
  const [loading, setLoading] = useState(false);

  // Hàm lưu booking vào Firebase (chỉ chạy khi đã thanh toán thành công)
  const postBooking = async (transactionId: string) => {
    try {
      // Lấy giá đã giảm hoặc giá gốc
      const amountToPay = payment.finalPrice !== undefined ? payment.finalPrice : payment.infor.totalPrice;

      const booking: Booking = {
        bookingDate: new Date().toISOString(),
        guestDetails: payment.guests,
        numberOfGuests: payment.guests.length,
        paymentInfo: {
          method: "PayOS", // Đổi method thành PayOS
          transactionID: transactionId,
        },
        status: "confirmed",
        totalPrice: amountToPay,
        tourID: payment.infor.tourID,
        travelDate: payment.infor.travelDate,
        contactName: payment.contact.name,
        contactEmail: payment.contact.email,
        contactPhone: payment.contact.phone,
      };

      const newBookingId = await createBooking(booking);
      console.log("Booking created with ID:", newBookingId);
      return newBookingId;

    } catch (error) {
      console.error("🔥 Lỗi khi tạo booking:", (error as Error).message);
      throw error;
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    const paymentEmail = payment.contact.email;
    const amountToPay = payment.finalPrice !== undefined ? payment.finalPrice : payment.infor.totalPrice;

    // 1. Kiểm tra nếu giá trị = 0 (Free) thì không cần PayOS
    if (amountToPay <= 0) {
        try {
            await postBooking("FREE_ORDER");
            Alert.alert("Thành công", "Đặt tour thành công!", [{ text: "OK", onPress: () => navigation.popToTop() }]);
        } catch (e) {
            Alert.alert("Lỗi", "Không thể tạo đơn hàng.");
        } finally {
            setLoading(false);
        }
        return;
    }

    try {
      // 2. Tạo Deep Link để PayOS quay trở lại App (nếu chạy trên máy thật/build)
      // Nếu chạy Expo Go, việc redirect tự động hơi phức tạp, ta dùng phương pháp check thủ công sau khi đóng browser.
      const returnUrl = Linking.createURL("payment-success");
      const cancelUrl = Linking.createURL("payment-cancel");

      // 3. Gọi API tạo link thanh toán
      console.log("Đang tạo link PayOS...");
      const paymentData = await createPayOSLink(10000, returnUrl, cancelUrl);

      if (!paymentData || !paymentData.checkoutUrl) {
          throw new Error("Không thể tạo link thanh toán");
      }

      const { checkoutUrl, orderCode } = paymentData;

      // 4. Mở trình duyệt để thanh toán
      // openAuthSessionAsync hoạt động tốt hơn openBrowserAsync cho flow xác thực/thanh toán
      await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrl);

      // 5. Sau khi trình duyệt đóng (người dùng quay lại App), kiểm tra trạng thái
      console.log("Trình duyệt đóng, đang kiểm tra trạng thái đơn hàng:", orderCode);
      setLoading(true); // Hiện lại loading khi đang check
      
      const orderInfo = await checkPaymentStatus(orderCode);

      if (orderInfo && orderInfo.status === "PAID") {
          // THANH TOÁN THÀNH CÔNG
          console.log("PayOS Status: PAID");
          
          await postBooking(String(orderCode)); // Lưu vào Firebase

          // Gửi mail xác nhận (simulation)
          console.log(`Đang gửi mail xác nhận đến: ${paymentEmail}`);
          // await sendEmailAPI(...) 

          Alert.alert(
            "Thành công! 🎉",
            `Đã thanh toán thành công ${amountToPay.toLocaleString("vi-VN")} ₫.\nEmail xác nhận đã được gửi.`,
            [{ text: "OK", onPress: () => navigation.popToTop() }]
          );

      } else {
          // THANH TOÁN THẤT BẠI HOẶC HỦY
          console.log("PayOS Status:", orderInfo?.status);
          Alert.alert(
              "Chưa hoàn tất", 
              "Giao dịch chưa được thanh toán hoặc đã bị hủy. Vui lòng thử lại."
          );
      }

    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      Alert.alert("Thất bại", "Có lỗi xảy ra trong quá trình thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PaymentHeader onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView}>
        <PaymentSummaryCard payment={payment} />
      </ScrollView>
      <PaymentBottomBar onPay={handlePayment} loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
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
    marginBottom: 20,
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
    color: '#0A2C4D',
    fontSize: 28,
    fontWeight: 'bold',
  },
  pointName: {
    color: '#333',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  dashedLine: {
    flex: 0.4,
    borderBottomWidth: 1,
    borderBottomColor: colors.light_Blue,
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
    color: '#FF7A2F',
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
});

export default Payment;