import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Text,
  Alert,
  ActivityIndicator
} from "react-native";
import { colors } from "../constants/colors";
import createAcronym from "../utils/acronym";
import { Picker } from "@react-native-picker/picker";
import DatePickerInput from "../components/DatePickerInput";
import { ButtonComponent } from "../components/ButtonComponent";
import { PaymentType } from "./Payment";
import travel from "./HomeScreen";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { StaticParamList } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
// THÊM IMPORT
import Modal from 'react-native-modal';
import { useAuth } from "../hooks/useAuth";
import { getCouponByIds } from "../api/apiClient";
import moment from "moment";

// --- CÁC INTERFACE CŨ GIỮ NGUYÊN ---
export interface Guest {
  id: number;
  birthDate: string;
  fullName: string;
  typeOfSeat: "Premium" | "Child" | "Standard";
}

export interface Person {
  email: string;
  phone: string;
  name: string;
}

const seatClassOptions = [
  { label: 'Standard', value: 'Standard' },
  { label: 'Premium', value: 'Premium' },
];

export interface Booking {
  bookingDate: string;
  guestDetails: Guest[];
  numberOfGuests: number;
  paymentInfo: {
    method: string;
    transactionID: string;
  };
  status: "confirmed" | "cancelled" | "pending";
  totalPrice: number;
  tourID: string;
  travelDate: string;
  contactEmail: string,
  contactName: string,
  contactPhone: string,
}

export interface InforProps {
    tourID: string,
    totalPrice: number,
    AdultNum: number,
    Child: number,
    travelDate: string,
    departure: string,
    destination: string,
}

// THÊM: Interface Coupon (Khớp với MyCoupon)
export interface Coupon {
    code: string,
    discountValue: number, // Sửa từ cost để khớp logic tính toán hoặc map lại
    description: string,
    id: string,
    maximumDiscount: number,
    minOrderValue: number,
    title: string,
    type: string,
    timeEnd: Date,
    timeStart: Date,
    status: boolean,
}

type StackProps = NativeStackScreenProps<RootStackParamList, "BookingInfor">;

// --- CÁC COMPONENT CON CŨ GIỮ NGUYÊN ---
interface BookingHeaderProps {
  onBackPress: () => void;
}
const BookingHeader: React.FC<BookingHeaderProps> = ({ onBackPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
      <Ionicons name="arrow-back" size={24} color="#0A2C4D" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Điền thông tin</Text>
    <View style={styles.headerButton} />
  </View>
);

const TourInfoCard: React.FC<{ props: InforProps }> = ({ props }) => (
  <View style={[styles.card, styles.tourInfoCard]}>
    <Text style={styles.tourInfoDate}>{props.travelDate}</Text>
    <View style={styles.routeContainer}>
      <View style={styles.routePoint}>
        <Text style={styles.pointAcronym}>
          {createAcronym(props.departure)}
        </Text>
        <Text style={styles.pointName}>{props.departure}</Text>
      </View>
      <View style={styles.dashedLine} />
      <View style={styles.routePoint}>
        <Text style={styles.pointAcronym}>
          {createAcronym(props.destination)}
        </Text>
        <Text style={styles.pointName}>{props.destination}</Text>
      </View>
    </View>
    <View style={styles.guestInfoContainer}>
      <View style={styles.guestRow}>
        <Ionicons name="person-outline" size={16} color={colors.grey_text} />
        <Text style={styles.guestText}>{props.AdultNum} Người lớn</Text>
      </View>
      {props.Child > 0 && (
        <View style={styles.guestRow}>
          <Ionicons name="person-outline" size={16} color={colors.grey_text} />
          <Text style={styles.guestText}>{props.Child} Trẻ em</Text>
        </View>
      )}
    </View>
  </View>
);

interface ContactInfoCardProps {
  email: string;
  onEmailChange: (text: string) => void;
  name: string;
  onNameChange: (text: string) => void;
  phone: string;
  onPhoneChange: (text: string) => void;
}
const ContactInfoCard: React.FC<ContactInfoCardProps> = (props) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
    <Text style={styles.cardSubtitle}>
      Chúng tôi sẽ gửi e-ticket/voucher đến liên hệ này
    </Text>
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Họ tên:</Text>
      <TextInput
        placeholder="Họ và tên của bạn"
        style={styles.textInput}
        value={props.name}
        onChangeText={props.onNameChange}
      />
      <Text style={styles.label}>Số điện thoại:</Text>
      <TextInput
        placeholder="09xxxxxxxx"
        style={styles.textInput}
        keyboardType="phone-pad"
        value={props.phone}
        onChangeText={props.onPhoneChange}
      />
      <Text style={styles.label}>Email:</Text>
      <TextInput
        placeholder="example@gmail.com"
        style={styles.textInput}
        keyboardType="email-address"
        autoCapitalize="none"
        value={props.email}
        onChangeText={props.onEmailChange}
      />
    </View>
  </View>
);

interface PassengerCardProps {
  guest: Guest;
  index: number;
  onInputChange: (id: number, field: keyof Guest, value: string) => void;
  isChild: boolean;
}
const PassengerCard: React.FC<PassengerCardProps> = ({ guest, index, onInputChange, isChild }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      {isChild ? `Trẻ em #${index + 1}` : `Người lớn #${index + 1}`}
    </Text>
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Họ tên:</Text>
      <TextInput
        placeholder="Họ tên đầy đủ"
        style={styles.textInput}
        value={guest.fullName}
        onChangeText={(text) => onInputChange(guest.id, 'fullName', text)}
      />
      <Text style={styles.label}>Ngày sinh:</Text>
      <DatePickerInput
        label="Chọn ngày sinh"
        value={guest.birthDate}
        onDateChange={(dateString) => onInputChange(guest.id, 'birthDate', dateString)}
      />
      {!isChild && (
        <>
          <Text style={styles.label}>Hạng ghế:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={guest.typeOfSeat}
              onValueChange={(itemValue) =>
                onInputChange(guest.id, 'typeOfSeat', itemValue as 'Standard' | 'Premium')
              }
              style={styles.pickerStyle}
            >
              {seatClassOptions.map(option => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </>
      )}
    </View>
  </View>
);

interface BookingBottomBarProps {
  totalPrice: number;
  discountAmount: number; // Thêm prop
  onContinue: () => void;
}
const BookingBottomBar: React.FC<BookingBottomBarProps> = ({ totalPrice, discountAmount, onContinue }) => (
  <View style={styles.bottomBar}>
    <View style={styles.priceContainer}>
      <Text style={styles.priceLabel}>Tổng giá:</Text>
      <Text style={styles.priceText}>
        {totalPrice.toLocaleString("vi-VN")} ₫
      </Text>
      {discountAmount > 0 && (
          <Text style={{fontSize: 11, color: colors.red}}>Đã giảm: -{discountAmount.toLocaleString("vi-VN")}đ</Text>
      )}
    </View>
    <View style={styles.bookButtonContainer}>
      <ButtonComponent
        type="button"
        text="Tiếp tục"
        textColor={colors.white}
        onPress={onContinue}
        width={"100%"}
        height={50}
        backgroundColor="#0194F3"
        borderRadius={15}
      />
    </View>
  </View>
);

// --- COMPONENT CHÍNH BOOKINGINFOR ---
const BookingInfor: React.FC<StackProps> = ({ navigation, route }) => {
  const { props } = route.params;
  const { user } = useAuth(); // Lấy user để lấy coupons

  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // STATES MỚI CHO MODAL VÀ COUPON
  const [isModalVisible, setModalVisible] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const [allGuests, setAllGuests] = useState<Guest[]>(() => {
    const adults = Array.from({ length: props.AdultNum }, (_, index) => ({
      id: index + 1,
      fullName: '',
      birthDate: '',
      typeOfSeat: 'Standard' as const,
    }));
    const children = Array.from({ length: props.Child }, (_, index) => ({
      id: props.AdultNum + index + 1,
      fullName: '',
      birthDate: '',
      typeOfSeat: 'Child' as const,
    }));
    return [...adults, ...children];
  });

  // Fetch Coupons khi Modal mở (hoặc khi component mount)
  useEffect(() => {
      const fetchCoupons = async () => {
          if(user && user.coupons && user.coupons.length > 0) {
              setLoadingCoupons(true);
              try {
                  const data = await getCouponByIds(user.coupons);
                  // Map dữ liệu
                  const mappedCoupons = data.map((c: any) => ({
                      ...c,
                      // Map 'cost' từ backend sang 'discountValue' để dùng chung
                      discountValue: c.cost || c.discountValue || 0, 
                      // Đảm bảo minOrderValue luôn có giá trị số
                      minOrderValue: Number(c.miniumOrderValue || c.minOrderValue) || 0, 
                  }));
                  setCoupons(mappedCoupons);
              } catch (error) {
                  console.error(error);
              } finally {
                  setLoadingCoupons(false);
              }
          }
      }
      if (isModalVisible) {
          fetchCoupons();
      }
  }, [user, isModalVisible]);


  const handleInputChange = useCallback((
    id: number,
    field: keyof Guest,
    value: string
  ) => {
    setAllGuests(prevGuests =>
      prevGuests.map(guest =>
        guest.id === id
          ? { ...guest, [field]: value }
          : guest
      )
    );
  }, []);

  // TÍNH TOÁN GIÁ VÀ GIẢM GIÁ
  const rawTotalPrice = useMemo(() => {
      return props.totalPrice; // Giả sử props.totalPrice là tổng chưa giảm
  }, [props.totalPrice]);

  const finalCalculation = useMemo(() => {
      let price = rawTotalPrice;
      let discount = 0;

      if (selectedCoupon) {
          // Kiểm tra điều kiện đơn tối thiểu (nếu không đủ thì không giảm)
          if (price >= selectedCoupon.minOrderValue) {
              
              const { type, discountValue, maximumDiscount } = selectedCoupon;
              const couponType = type ? type.toLowerCase() : 'fixed';

              // --- LOGIC XỬ LÝ GIẢM GIÁ ---
              
              // Trường hợp 1: Loại Phần trăm (percent) HOẶC tự động phát hiện nếu giá trị nhỏ (ví dụ < 100 và type không rõ)
              if (couponType.includes('percent') || couponType === 'p') {
                  let percent = discountValue;
                  
                  // Xử lý case "15" thành "0.15" (15%)
                  // Nếu backend trả về số nguyên > 1 (vd: 10, 15, 20), ta chia cho 100
                  if (percent > 1) {
                      percent = percent / 100;
                  }
                  
                  let rawDiscount = price * percent;

                  // Áp dụng mức giảm tối đa (nếu có)
                  if (maximumDiscount && maximumDiscount > 0) {
                      rawDiscount = Math.min(rawDiscount, maximumDiscount);
                  }
                  
                  discount = rawDiscount;
              } 
              // Trường hợp 2: Giảm giá tiền mặt cố định (Fixed)
              else {
                  discount = discountValue;
              }

              // Đảm bảo giá không âm
              price = Math.max(0, price - discount);
          }
      }
      
      // Trả về số nguyên (làm tròn) để hiển thị đẹp hơn
      return { 
          finalPrice: Math.round(price), 
          discountAmount: Math.round(discount) 
      };
  }, [rawTotalPrice, selectedCoupon]);


  const checkEmpty = () => {
    if(contactEmail.trim() === "" || contactName.trim() === "" || contactPhone.trim() === "") return false;

    const existEmp = allGuests.find(guest => guest.fullName.trim() === "" || guest.birthDate.trim() === "" );
    if(existEmp) return false;
    return true;
  }

  const handleSubmit = () => {
    const payment: PaymentType = {
      infor: props,
      guests: allGuests,
      contact: {
        email: contactEmail,
        name: contactName,
        phone: contactPhone,
      },
      // Có thể truyền thêm coupon info vào payment nếu cần
      coupon: selectedCoupon, 
      finalPrice: finalCalculation.finalPrice
    };
    if(checkEmpty()) {
      navigation.navigate("Payment", { payment });
    } else {
      Alert.alert("Thông báo","Vui lòng nhập đầy đủ thông tin");
    }
  };

  // RENDER MODAL CONTENT
  const renderCouponItem = (item: Coupon) => {
      const isSelected = selectedCoupon?.id === item.id;
      
      // Vẫn tính toán để hiển thị thông tin (nếu cần), nhưng không dùng để chặn
      const minCondition = Number(item.minOrderValue) || 0;
      const isApplicable = rawTotalPrice >= minCondition;

      return (
          <TouchableOpacity 
              key={item.id}
              style={[
                  modalStyles.couponCard, 
                  isSelected && modalStyles.couponSelected,
                  // Bỏ style làm mờ nếu bạn muốn nó sáng như bình thường
                  // !isApplicable && {opacity: 0.5, backgroundColor: '#f0f0f0'} 
              ]}
              onPress={() => {
                  // --- SỬA ĐỔI: BỎ LOGIC CHẶN ---
                  // Chọn luôn coupon và đóng modal, không cần kiểm tra điều kiện
                  setSelectedCoupon(item);
                  setModalVisible(false);
              }}
          >
              <View style={{flex: 1}}>
                  <Text style={modalStyles.couponCode}>{item.code}</Text>
                  <Text style={modalStyles.couponDesc}>{item.title}</Text>
                  <Text style={{fontSize: 12, color: colors.grey_text}}>
                      HSD: {item.timeEnd ? moment(item.timeEnd).format("DD/MM/YYYY") : 'Vô thời hạn'}
                  </Text>
                  {/* Vẫn hiển thị dòng điều kiện để biết, nhưng không bắt buộc */}
                  {/* <Text style={{fontSize: 11, color: isApplicable ? colors.blue_splash : colors.red, marginTop: 2}}>
                      Đơn tối thiểu: {formatCurrency(minCondition)}đ
                  </Text> */}
              </View>
              <View style={{justifyContent: 'center', paddingLeft: 10}}>
                  {isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color={colors.blue_splash} />
                  ) : (
                      // Luôn hiện radio button bình thường
                      <View style={[modalStyles.radioButton, {borderColor: colors.grey_text}]} />
                  )}
              </View>
          </TouchableOpacity>
      )
  }

  return (
    <SafeAreaView style={styles.container}>
      <BookingHeader onBackPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TourInfoCard props={props} />

        <ContactInfoCard
          email={contactEmail}
          onEmailChange={setContactEmail}
          name={contactName}
          onNameChange={setContactName}
          phone={contactPhone}
          onPhoneChange={setContactPhone}
        />

        {allGuests.map((guest, index) => (
          <PassengerCard
            key={guest.id}
            guest={guest}
            index={guest.typeOfSeat === 'Child' ? index - props.AdultNum : index}
            onInputChange={handleInputChange}
            isChild={guest.typeOfSeat === 'Child'}
          />
        ))}

        {/* PHẦN CHỌN MÃ GIẢM GIÁ */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Mã Giảm Giá</Text>
            <TouchableOpacity 
                style={styles.btnCoupon}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.priceLabel, {color: colors.black, fontWeight: 'bold', flex: 1}]}>
                    {selectedCoupon ? `Đã chọn: ${selectedCoupon.code}` : 'Chọn mã giảm giá ngay'}
                </Text>
                <FontAwesome5 name="arrow-alt-circle-right" size={18} color={colors.black} />
            </TouchableOpacity>
            {selectedCoupon && (
                <TouchableOpacity onPress={() => setSelectedCoupon(null)} style={{marginTop: 5, alignSelf: 'flex-end'}}>
                    <Text style={{color: colors.red, fontSize: 12}}>Gỡ bỏ mã</Text>
                </TouchableOpacity>
            )}
        </View>

      </ScrollView>

      <BookingBottomBar
        totalPrice={finalCalculation.finalPrice} // Dùng giá đã giảm
        discountAmount={finalCalculation.discountAmount}
        onContinue={handleSubmit}
      />

      {/* MODAL CHỌN COUPON */}
      <Modal 
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        style={modalStyles.modal}
      >
          <View style={modalStyles.modalContent}>
              <View style={modalStyles.modalHeader}>
                  <Text style={modalStyles.modalTitle}>Chọn mã giảm giá</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={24} color={colors.black} />
                  </TouchableOpacity>
              </View>
              
              {loadingCoupons ? (
                  <ActivityIndicator size="large" color={colors.blue_splash} style={{marginTop: 20}} />
              ) : coupons.length > 0 ? (
                  <ScrollView style={{marginTop: 10}}>
                      {coupons.map(item => renderCouponItem(item))}
                  </ScrollView>
              ) : (
                  <Text style={{textAlign: 'center', marginTop: 20, color: colors.grey_text}}>
                      Bạn chưa có mã giảm giá nào.
                  </Text>
              )}
          </View>
      </Modal>

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
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tourInfoCard: {
    backgroundColor: "#0A2C4D",
  },
  tourInfoDate: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
    color: colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  pointName: {
    color: colors.white,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  dashedLine: {
    flex: 0.4,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
    borderStyle: 'dashed',
    marginTop: 15,
  },
  guestInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 15,
    alignItems: 'center',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  guestText: {
    color: colors.white,
    fontSize: 15,
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2C4D',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.grey_text,
    marginBottom: 15,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  textInput: {
    height: 45,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
  },
  pickerContainer: {
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    height: 45,
    justifyContent: 'center',
  },
  pickerStyle: {
    height: 55, // Giữ nguyên chiều cao picker có thể khác TextInput
    width: '100%',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: '#FF7A2F',
  },
  bookButtonContainer: {
    flex: 0.45,
  },

  btnCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFBEF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFA500', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  }
});

const modalStyles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: colors.white,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '60%', // Chiều cao modal
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black,
    },
    couponCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    couponSelected: {
        borderColor: colors.blue_splash,
        backgroundColor: '#F0F8FF',
    },
    couponCode: {
        fontWeight: 'bold',
        fontSize: 16,
        color: colors.blue_splash,
    },
    couponDesc: {
        fontSize: 14,
        color: '#333',
        marginVertical: 2,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.grey_text,
    },
});

export default BookingInfor;