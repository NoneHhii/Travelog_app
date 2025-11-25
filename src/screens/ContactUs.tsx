import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { ButtonComponent } from "../components/ButtonComponent";
import { TextComponent } from "../components/TextComponent";

type Stack = NativeStackScreenProps<RootStackParamList, 'ContactUs'>

interface propView {
    press : () => void
}

const ViewContact:React.FC<propView> = ({press}) => {
    return (
        <View style={styles.contactContainer}>
            <Image source={require("../../assets/product-management.png")} style={{width: 128, height: 128}}/>
            <View style={{marginVertical: 12, marginBottom: 80}}>
                <Text style={{fontWeight: 'bold'}}>Bạn cần hỗ trợ về sản phẩm hoặc đặt vé?</Text>
                <Text style={{fontWeight: 'bold', marginBottom: 8,}}>Liên hệ với chúng tôi!</Text>
                <Text style={{fontSize: 13}}>Xin lưu ý rằng dịch vụ gọi điện chỉ khả dụng nếu bạn đã đặt chỗ. 
                    Vui lòng cung cấp Mã đặt chỗ của bạn khi liên hệ với chúng tôi.
                </Text>
            </View>
            <ButtonComponent
                text="Chatbot ngay"
                type="button"
                onPress={() => press()}
                width={"80%"}
                borderRadius={20}
            />
        </View>
    )
}

export const ContactUs:React.FC<Stack> = ({navigation}) => {
    const {user} = useAuth();

    return (
        <ScrollView style={{backgroundColor: colors.blue_splash,}}>
            <View style={styles.container}>
                <View style={styles.headContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={18} style={{marginLeft: 4}} color={colors.white}/>
                    </TouchableOpacity>
                    <Text style={styles.titleHead}>Liên hệ</Text>
                </View>
                <View style={{width: "90%", marginTop: 10}}>
                    <Text style={{color: colors.light_Blue}}>Xin chào {user.displayName},</Text>
                    <Text style={{fontWeight: 'bold', color: colors.white}}>Chúng tôi có thể giúp gì cho bạn?</Text>
                </View>
                <ViewContact press={() => navigation.navigate('Chatbot')}/>
                <View style={styles.contactContainer}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Ionicons name="alert-circle-sharp"/>
                        <Text 
                            style={{
                                fontWeight: 'bold', 
                                color: colors.grey_text, 
                                marginLeft: 8
                            }}
                        >
                                Giờ hoạt động chăm sóc khách hàng
                        </Text>
                    </View>
                    <View style={{padding: 8}}>
                        <Text style={{fontSize: 13}}>Gọi: Thứ 2-chủ nhật (từ 8h - 22h)</Text>
                        <Text style={{fontSize: 13}}>+84 37 5143 083</Text>
                        <Text style={{fontSize: 13, marginTop: 8,}}>Chat: 24/7</Text>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: colors.white,
                        width: "100%",
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 12,
                    }}
                >
                    <Text style={{fontWeight: 'bold'}}>Bạn đang tìm kiếm thứ gì khác?</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                            marginTop: 15,
                        }}
                    >
                        <Ionicons name="help-circle-outline" size={24}/>
                        <View style={{width: "75%", marginHorizontal: 10}}>
                            <Text 
                                style={{fontWeight: 'bold', fontSize: 12}}
                            >
                                Khám phá trung tâm trợ giúp
                            </Text>
                            <Text 
                                style={{fontWeight: 'bold', fontSize: 12, color: colors.grey_text}}
                            >
                                Trả lời nhanh chóng những mối quan tâm hàng đầu của bạn
                            </Text>
                        </View>
                         <TouchableOpacity onPress={() => {}}>
                            <TextComponent
                                text={"Explore"}
                                flex={0}
                                color={colors.blue}
                                fontWeight = {'bold'}
                                size={13}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        
        paddingTop: 8,
    },

    headContainer: {
        flexDirection: 'row',

    },

    titleHead: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
        color: colors.white,
    },

    contactContainer: {
        backgroundColor: colors.white,
        width: '90%',
        padding: 8,
        borderRadius: 20,
        marginVertical: 15,
    }
})