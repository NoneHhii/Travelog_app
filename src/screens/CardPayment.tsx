import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { ButtonComponent } from "../components/ButtonComponent";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type stack = NativeStackScreenProps<RootStackParamList, 'CardPayment'>

export const CardPayment: React.FC<stack> = ({navigation}) => {
    return (
        <View style={styles.container}>
            <View style={styles.headContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={18} style={{marginLeft: 4}}/>
                </TouchableOpacity>
                <Text style={styles.titleHead}>Thẻ của tôi</Text>
            </View>
            <Image source={require('../../assets/3d-cardpayment.jpg')} style={{width: 150, height: 150}}/>
            <View style={styles.paragraph}>
                <Text style={{
                        fontWeight: 'bold',
                            
                    }}
                >Tận hưởng thanh toán liền mạch với thẻ đã lưu</Text>
                <Text style={{
                        fontSize: 13,
                    }}
                >Lưu trữ tối đa 10 thẻ tín dụng/thẻ ghi nợ để thanh toán dễ dàng! 
                    Đừng lo lắng, mọi giao dịch thẻ luôn được bảo vệ bởi hệ thống bảo mật đa lớp của chúng tôi.
                </Text>
            </View>
            <ButtonComponent
                text="Add credit/debit card"
                type="button"
                onPress={() => {}}
                width={"80%"}
                borderRadius={30}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.white,
    },

    paragraph: {
        width: "95%",
        padding: 8,
        backgroundColor: colors.light_Blue,
        borderRadius: 8,
    },

    headContainer: {
        flexDirection: 'row',

    },

    titleHead: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
    }
})