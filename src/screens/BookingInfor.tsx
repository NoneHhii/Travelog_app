import { StaticParamList } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useMemo, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-gesture-handler";
import { colors } from "../constants/colors";
import createAcronym from "../utils/acronym";
import { Picker } from "@react-native-picker/picker";
import DatePickerInput from "../components/DatePickerInput";
import { ButtonComponent } from "../components/ButtonComponent";
import { PaymentType } from "./Payment";

export interface Guest {
    id: number,
    birthDate: string,
    fullName: string,
    typeOfSeat: "Premium" | "Child" |  "Standard" ,
}

export interface Person {
    email: string,
    phone: string,
    name: string,
}

const seatClassOptions = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Premium', value: 'Premium' },
];

export interface Booking {
    bookingDate: string,
    guestDetails: Guest[],
    numberOfGuests: number,
    paymentInfo: {
        method: string,
        transactionID: string,
    },
    status: "confirmed" | "cancelled" | "pending",
    totalPrice: number,
    tourID: string,
    travelDate: string,
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


type Stack = NativeStackScreenProps<StaticParamList, 'BookingInfor'>;

const BookingInfor: React.FC<Stack> = ({navigation, route}) => {

    const {props}: {props: InforProps} = route.params;

    const [email, setEmail] = useState("");

    const [passengers, setPassengers] = useState<Guest[]>(() => {
        return Array.from({ length: props.AdultNum }, (_, index) => ({
            id: index + 1,
            fullName: '',
            birthDate: '',
            typeOfSeat: 'Standard',
        }));
    });

    const [child, setChild] = useState<Guest[]>(() => {
        return Array.from({ length: props.AdultNum }, (_, index) => ({
            id: passengers.length + 1,
            fullName: '',
            birthDate: '',
            typeOfSeat: 'Child',
        }));
    });

    const handleInputChange = useCallback((
        id: number, 
        field: keyof Guest, 
        value: string
    ) => {
        setPassengers(prevPassengers => 
            prevPassengers.map(passenger => 
                passenger.id === id 
                    ? { ...passenger, [field]: value } 
                    : passenger 
            )
        );
    }, []);

    const handleSubmit = () => {
        console.log('Dữ liệu hành khách:', passengers);
        const payment: PaymentType = {
            infor: props,
            guests: passengers,
            email: email
        }
        navigation.navigate("Payment", {payment});
    };

    const back = () => {
        navigation.goBack();
    }

    // Render passenger input set inline to avoid remounting component on each render
    // which can cause TextInput to lose focus (keyboard dismisses after one char).

    return (
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'none' : 'none'}>
            <View style={styles.constainer}>
                <View style={styles.header}>
                    <View style={styles.row}>
                        <TouchableOpacity
                            onPress={() => back()}
                            style={{
                                width: 24,
                                height: 24,
                            }}
                        >
                            <Text style={{fontWeight: 'bold', fontSize: 16, color: colors.white, lineHeight: 20}}>
                                {"<"}
                            </Text>
                        </TouchableOpacity>
                        <Text
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: colors.white,
                            }}
                        >
                            Điền thông tin
                        </Text>
                    </View>
                    <Text style={{textAlign: 'center', color: colors.white, marginVertical: 8}}>
                        {props.travelDate}
                    </Text>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.point}>
                                {createAcronym(props.departure)}
                            </Text>
                            <Text style={{color: colors.white, fontSize: 12}}>{props.departure}</Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                marginHorizontal: 15,
                                borderColor: colors.white,
                            }}
                        />
                        <View>
                            <Text style={styles.point}>
                                {createAcronym(props.destination)}
                            </Text>
                            <Text style={{color: colors.white, fontSize: 12}}>{props.destination}</Text>
                        </View>
                    </View>
                    <Text style={{textAlign: 'center', color: colors.white}}>4 giờ 30 phút</Text>
                    <View style={{alignItems: 'center', marginVertical: 8}}>
                        <View style={styles.row}>
                            <Image 
                                source={require('../../assets/primary.png')}
                                style={{
                                    width: 16,
                                    height: 18,
                                }}
                            />
                            <Text
                                style={{
                                    color: colors.white,
                                    marginLeft: 4,
                                }}
                            >
                                {props.AdultNum} Người lớn
                            </Text>
                        </View>
                        {props.Child > 0 && (
                            <View style={[styles.row, {marginTop: 4,}]}>
                                <Image 
                                    source={require('../../assets/primary.png')}
                                    style={{
                                        width: 16,
                                        height: 18,
                                    }}
                                />
                                <Text>{props.Child} Trẻ em</Text>
                                
                            </View>
                        )}
                        
                    </View>
                </View>

                {/* Contact */}
                <View style={{marginTop: 20, width: "100%", alignItems: 'center'}}>
                    <View style={{width: "90%"}}>
                        <Text
                            style={{
                                fontWeight: 'bold',

                            }}
                        >
                            Thông tin liên hệ (nhận vé/phiếu thanh toán)
                        </Text>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                color: colors.grey_text,
                                fontSize: 13,
                                marginVertical: 6,
                            }}
                        >
                            Chúng tôi sẽ gửi tất cả các e-ticket/vourcher đến liên hệ này
                        </Text>

                        <View 
                            style={{
                                marginVertical: 10,
                                borderWidth: 1,
                                borderColor: colors.light_Blue,
                                padding: 8,
                                borderRadius: 8,
                            }}
                        >
                            <Text>Tên:</Text>
                            <TextInput
                                placeholder="Họ tên"
                                style={{
                                    backgroundColor: '#F8F9FB',
                                    borderRadius: 8
                                }}
                            />
                            <Text>Số điện thoại:</Text>
                            <TextInput
                                placeholder="xxxxxxxxx"
                                style={{
                                    backgroundColor: '#F8F9FB',
                                    borderRadius: 8
                                }}
                            />
                            <Text>Email:</Text>
                            <TextInput
                                placeholder="example@gmail.com"
                                style={{
                                    backgroundColor: '#F8F9FB',
                                    borderRadius: 8
                                }}
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <Text style={{
                        textAlign: 'left', 
                        width: "90%",
                        marginVertical: 10,
                        fontWeight: 'bold'
                    }}>
                        Thông tin khách hành:
                    </Text>

                    {/* Infor Member */}
                    <View style={{width: "90%"}}>
                        {passengers.map((passenger, index) => (
                            <View style={styles.passengerContainer} key={passenger.id.toString()}>
                                <Text style={styles.passengerHeader}>Hành khách #{index + 1}</Text>

                                {/* Tên */}
                                <Text style={styles.label}>Tên:</Text>
                                <TextInput
                                    placeholder="Họ tên"
                                    value={passenger.fullName}
                                    onChangeText={(text) => handleInputChange(passenger.id, 'fullName', text)}
                                    style={styles.textInput}
                                />

                                <Text style={styles.label}>Ngày sinh:</Text>
                                <DatePickerInput
                                    label="Ngày sinh"
                                    value={passenger.birthDate}
                                    onDateChange={(dateString) => handleInputChange(passenger.id, 'birthDate', dateString)}
                                />

                                <Text style={styles.label}>Hạng ghế:</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={passenger.typeOfSeat}
                                        onValueChange={(itemValue) => 
                                            handleInputChange(passenger.id, 'typeOfSeat', itemValue as 'Standard' | 'Premium')
                                        }
                                        style={styles.pickerStyle} 
                                    >
                                        {seatClassOptions.map(option => (
                                            <Picker.Item 
                                                key={option.value} 
                                                label={option.label} 
                                                value={option.value} 
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <ButtonComponent
                    text="Tiếp tục"
                    type="button"
                    onPress={() => handleSubmit()}
                    width={"90%"}
                    borderRadius={20}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    constainer: {
        flex: 1,
        backgroundColor: colors.white,
        position: 'relative'
    },

    header: {
        width: '100%',
        backgroundColor: "#7319FF",
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomColor: colors.light,
        borderBottomWidth: 1,
        borderBottomLeftRadius: "20%",
        borderBottomRightRadius: "20%"
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    point: {
        color: colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },

    passengerContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#f9f9f9',
    },
    passengerHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    label: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: '500',
        color: '#555',
    },
    textInput: {
        height: 40,
        paddingHorizontal: 12,
        backgroundColor: '#F8F9FB', 
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    debugText: {
        marginTop: 20,
        fontSize: 12,
        color: '#888',
    },

    pickerContainer: {
        backgroundColor: '#F8F9FB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden', 
        height: 40,
        justifyContent: 'center', 
    },
    pickerStyle: {
        height: 60,
        width: '100%',
    }
})

export default BookingInfor;