import React, { useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { Booking, Guest, InforProps } from "./BookingInfor";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StaticParamList } from "@react-navigation/native";
import { Text } from "react-native-gesture-handler";
import createAcronym from "../utils/acronym";
import { ButtonComponent } from "../components/ButtonComponent";
import { createBooking } from "../api/apiClient";

export interface PaymentType {
    infor: InforProps,
    guests: Guest[],
    email: string,
}

type Stack = NativeStackScreenProps<StaticParamList, 'Payment'>;

const Payment: React.FC<Stack> = ({navigation, route}) => {

    const {payment} : {payment: PaymentType} = route.params;
    const [loading, setLoading] = useState(false);

    const back = () => {
        navigation.goBack();
    }

    const postBooking = async () => {
        setLoading(true);
        try {
            const booking: Booking = {
                bookingDate: new Date().toDateString(),
                guestDetails: payment.guests,
                numberOfGuests: payment.guests.length,
                paymentInfo: {
                    method: "Card",
                    transactionID: "",
                },
                status: "confirmed",
                totalPrice: payment.infor.totalPrice,
                tourID: payment.infor.tourID,
                travelDate: payment.infor.travelDate,
            }

            const newBookingId = await createBooking(booking);
        } catch (error) {
            console.error("🔥 Lỗi khi tạo booking:", error.message);
            Alert.alert("Lỗi", "Không thể tạo booking. Vui lòng thử lại.");
        }
    }

    const handlePayment = async () => {
        const mockAmount = 1000; // Áp cứng 1000đ theo yêu cầu
        const paymentEmail = payment.email;
        const bookingDetails = {
            ...payment.infor,
            guests: payment.guests.map(g => ({
                name: g.fullName,
                seat: g.typeOfSeat
            }))
        };
        
        console.log(`Tiến hành thanh toán ${mockAmount} VND...`);

        try {
            await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500)); 

            console.log(`Đang gửi mail xác nhận đến: ${paymentEmail}`);
            await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500));

            Alert.alert(
                "Thành công!",
                `Đã thanh toán thành công ${payment.infor.totalPrice.toLocaleString('es-US')} VND.\nEmail xác nhận đã được gửi đến ${paymentEmail}.`,
                // [{ text: "OK", onPress: () => navigation.popToTop() }] 
                [{ text: "OK", onPress: () => {} }] 
            );
            postBooking();

        } catch (error) {
            
            console.error("Lỗi trong quá trình thanh toán/gửi mail:", error);
            Alert.alert(
                "Thất bại", 
                "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau."
            );
        }
    };

    return (
        <View style={styles.constainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => back()}
                    style={{
                        width: 24,
                        height: 24,
                    }}
                >
                    <Text style={{color: colors.white, fontSize: 18, fontWeight: 'bold'}}>{"<"}</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Travelog</Text>
            </View>

            {/* Card */}
            <View style={{width: "100%", alignItems: 'center', marginTop: "35%"}}>
                <View
                    style={styles.paymentCard}
                >
                    <Text style={{textAlign: 'center', marginVertical: 8}}>
                        {payment.infor.travelDate}
                    </Text>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.point}>
                                {createAcronym(payment.infor.departure)}
                            </Text>
                            <Text style={{fontSize: 12}}>{payment.infor.departure}</Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                marginHorizontal: 15,
                            }}
                        />
                        <View>
                            <Text style={styles.point}>
                                {createAcronym(payment.infor.destination)}
                            </Text>
                            <Text style={{fontSize: 12}}>{payment.infor.destination}</Text>
                        </View>
                    </View>
                    <Text style={{textAlign: 'center'}}>4 giờ 30 phút</Text>
                    <View style={{alignItems: 'center', marginVertical: 8}}>
                        <View style={styles.row}>
                            <Image 
                                source={require('../../assets/blackPr.png')}
                                style={{
                                    width: 16,
                                    height: 18,
                                }}
                            />
                            <Text
                                style={{
                                    marginLeft: 4,
                                }}
                            >
                                {payment.infor.AdultNum} Người lớn
                            </Text>
                        </View>
                        {payment.infor.Child > 0 && (
                            <View style={[styles.row, {marginTop: 4,}]}>
                                <Image 
                                    source={require('../../assets/primary.png')}
                                    style={{
                                        width: 16,
                                        height: 18,
                                    }}
                                />
                                <Text>{payment.infor.Child} Trẻ em</Text>
                                
                            </View>
                        )}
                        
                    </View>

                    {/* Infor */}
                    <View style={[styles.row, {width: '90%' ,justifyContent: 'space-between', marginVertical: 10}]}>
                        <View>
                            <Text style={{color: colors.grey_text}}>Người đại diện</Text>
                            <Text>{payment.guests[0].fullName}</Text>
                        </View>
                        <View>
                            <Text style={{color: colors.grey_text}}>Hạng ghế</Text>
                            <Text numberOfLines={1}>{payment.guests[0].typeOfSeat}</Text>
                        </View>
                        <View>
                            <Text style={{color: colors.grey_text}}>Số lượng</Text>
                            <Text numberOfLines={1}>{payment.infor.AdultNum + payment.infor.Child}</Text>
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            marginHorizontal: 15,
                            width: '80%',
                            marginVertical: 15,
                        }}
                    />
                    <Text style={{fontWeight: 'bold'}}> 
                        Tổng tiền cần thanh toán
                    </Text>
                    <Text style={styles.txtPrice}>
                        {payment.infor.totalPrice.toLocaleString('es-US')} VND
                    </Text>
                    <Text>
                        {payment.email}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={{marginBottom: 10,}}>
                    <Text style={{fontWeight: 'bold'}}>Điều khoản & Điều kiện</Text>
                    <Text style={{color: colors.grey_text}}>Bằng việc nhấn THANH TOÁN bạn đã đồng ý với các điều khoản & điều kiện và chính sách quyền riêng tư của Travelog</Text>
                </View>
                <ButtonComponent
                    type="button"
                    text={loading ? "Đang xử lý..." : "THANH TOÁN"}
                    onPress={() => handlePayment()}
                    width={"95%"} 
                    borderRadius={20}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    constainer: {
        flex: 1,
        backgroundColor: colors.white,
        position: 'relative'
    },

    header: {
        position: 'absolute',
        width: '100%',
        backgroundColor: "#7319FF",
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomColor: colors.light,
        borderBottomWidth: 1,
        borderBottomLeftRadius: "20%",
        borderBottomRightRadius: "20%",
        paddingBottom: 80,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    point: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    title: {
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.white,
    },

    paymentCard: {
        backgroundColor: colors.white,
        width: '80%',
        alignItems: 'center',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
        padding: 10,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        width: "100%",
        backgroundColor: "#F8F8F8",
        paddingVertical: 20,
        paddingHorizontal: 10,

    },

    txtPrice: {
        marginVertical: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.red,
    },
})

export default Payment;