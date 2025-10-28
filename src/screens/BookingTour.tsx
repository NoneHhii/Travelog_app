import { StaticParamList } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions } from "react-native";
import travel from "./HomeScreen";
import { colors } from "../constants/colors";
import { ButtonComponent } from "../components/ButtonComponent";
import { InforProps } from "./BookingInfor";

type Stack = NativeStackScreenProps<StaticParamList, 'BookingTour'>;

const BookingTour: React.FC<Stack> = ({navigation, route}) => {
    const travel: travel = route.params.travel;
    const destinationName = route.params.destinationName;
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

    const formatDate = (date: Date): string => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return `${days[date.getDay()]}\n${date.getDate()}/${date.getMonth() + 1}`;
    };

    const renderDateItem = ({ item }: { item: Date }) => {
        const isSelected = item.toDateString() === selectedDate.toDateString();
        return (
            <TouchableOpacity
                style={[
                    styles.dateButton,
                    isSelected && styles.selectedDateButton,
                ]}
                onPress={() => setSelectedDate(item)}
            >
                <Text style={[
                    styles.dateText,
                    isSelected && styles.selectedDateText
                ]}>
                    {formatDate(item)}
                </Text>
            </TouchableOpacity>
        );
    };

    const totalPrice = () => {
        return travel.price * selectedAdults + (travel.price * 30 / 100) * selectedChildren;
    }

    const handleInfor = () => {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dateTravel =  `${days[selectedDate.getDay()]} ${selectedDate.getDate()} tháng ${selectedDate.getMonth() + 1} ${selectedDate.getFullYear()}`;

        const props: InforProps = {
            tourID: travel.id,
            AdultNum: selectedAdults,
            Child: selectedChildren,
            totalPrice: totalPrice(),
            travelDate: dateTravel,
            departure: travel.departurePoint,
            destination: destinationName,
        }
        

        navigation.navigate("BookingInfor", {props});
    }

    return (
        <View style={styles.constainer}>
            <View style={styles.header}>
                <Text style={{fontWeight: 'bold', fontSize: 16}}>{"<"}</Text>
                <Text
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 'bold',
                    }}
                >
                    Chọn ngày và số lượng
                </Text>
            </View>
            <Text 
                style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginVertical: 20,
                }}
            >
                Vé {travel.departurePoint} - {destinationName}
            </Text>

            {/* Calendar */}
            <View style={styles.dateListContainer}>
                <FlatList
                    data={dates}
                    renderItem={renderDateItem}
                    keyExtractor={(item) => item.toISOString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateList}
                />
            </View>

            <View>
                {/* Adult */}
                <View style={[styles.row, {justifyContent: 'space-between', marginHorizontal: 20, marginTop: 30,}]}>
                    <View style={{flex: 1}}>
                        <Text>Người lớn</Text>
                        <Text style={styles.txtPrice}>{travel.price.toLocaleString('es-US')} VND</Text>
                        <Text>140cm trở lên</Text>
                    </View>
                    <View style={[styles.row, {justifyContent: 'space-between', flex: 1}]}>
                        <TouchableOpacity
                            style={styles.btnQuan}
                            onPress={() => setSelectedAdults(selectedAdults == 1? 1 : selectedAdults - 1)}
                        >
                            <Text style={{color: colors.blue, fontSize: 18,}}>
                                -
                            </Text>
                        </TouchableOpacity>
                        <Text style={{marginVertical: 10,}}>{selectedAdults}</Text>
                        <TouchableOpacity
                            style={styles.btnQuan}
                            onPress={() => setSelectedAdults(selectedAdults + 1)}
                        >
                            <Text style={{color: colors.blue, fontSize: 18,}}>
                                +
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Children */}
                <View style={[styles.row, styles.borderTop, {justifyContent: 'space-between', marginHorizontal: 20, marginTop: 30,}]}>
                    <View style={{flex: 1}}>
                        <Text>Trẻ em</Text>
                        <Text style={styles.txtPrice}>{(travel.price * 30 / 100).toLocaleString('es-US')} VND</Text>
                        <Text>100 - 139cm trở lên</Text>
                    </View>
                    <View style={[styles.row, {justifyContent: 'space-between', flex: 1}]}>
                        <TouchableOpacity
                            style={styles.btnQuan}
                            onPress={() => setSelectedChildren(selectedChildren == 0? 0 : selectedChildren - 1)}
                        >
                            <Text style={{color: colors.blue, fontSize: 18,}}>
                                -
                            </Text>
                        </TouchableOpacity>
                        <Text style={{marginVertical: 10,}}>{selectedChildren}</Text>
                        <TouchableOpacity
                            style={styles.btnQuan}
                            onPress={() => setSelectedChildren(selectedChildren + 1)}
                        >
                            <Text style={{color: colors.blue, fontSize: 18,}}>
                                +
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={[styles.footer, styles.borderTop]}>
                <View style={{marginLeft: 8}}>
                    <Text>Tổng giá:</Text>
                    <Text style={styles.txtPrice}>{totalPrice().toLocaleString('es-US')} VND</Text>
                    <Text style={{color: colors.grey_text, fontWeight: 'bold', fontSize: 12}}>
                        Bao gồm cả thuế và phí
                    </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'flex-end', marginLeft: 60}}>
                    <ButtonComponent
                        type="button"
                        text="Đặt ngay"
                        onPress={() => handleInfor()}
                        borderRadius={20}
                    />
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: colors.white,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomColor: colors.light,
        borderBottomWidth: 1,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dateListContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },

    dateList: {
        paddingVertical: 10,
    },

    dateButton: {
        width: 60,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 8,
        backgroundColor: colors.light,
        paddingVertical: 8,
    },

    selectedDateButton: {
        backgroundColor: colors.blue_splash,
    },

    dateText: {
        fontSize: 14,
        textAlign: 'center',
        color: colors.light_black,
    },

    selectedDateText: {
        color: colors.white,
        fontWeight: 'bold',
    },

    txtPrice: {
        marginVertical: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.red,
    },

    btnQuan: {
        width: 28,
        height: 28,
        backgroundColor: colors.light_Blue,
        borderRadius: "50%",
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },

    borderTop: {
        borderTopColor: colors.light_Blue,
        borderTopWidth: 1,
        paddingTop: 20,
    },

    border: {
        borderWidth: 1,
        borderColor: colors.light_Blue,
        borderRadius: 20,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        width: "100%",
        backgroundColor: colors.white,
        paddingVertical: 20,
        paddingHorizontal: 10,
        flexDirection: 'row',

    }
})
export default BookingTour;