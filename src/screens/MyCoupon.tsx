import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View} from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../hooks/useAuth";
import { getCouponByIds } from "../api/apiClient";
import { Text } from "react-native-gesture-handler";
import { CouponItem } from "../components/CouponItem";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

type Stack = NativeStackScreenProps<RootStackParamList, 'MyCoupon'>

export interface Coupon {
    code: string,
    cost: number,
    description: string,
    id: string,
    maximumDiscount: number,
    miniumOrderValue: number,
    title: string,
    type: string,
}

export const MyCoupon:React.FC<Stack> = ({navigation}) => {
    const {user} = useAuth();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            if(user && user.coupons && user.coupons.length > 0) {
                // console.log("Đang lấy coupons...");
                const coupons = await getCouponByIds(user.coupons);

                // console.log(coupons);
                // console.log("done");
                setCoupons(coupons);
                setLoading(false);
            }
        }

        fetchCoupons();
    }, [user]);

    if(loading) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator size={28}/>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.headContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={18} style={{marginLeft: 4}}/>
                </TouchableOpacity>
                <Text style={styles.titleHead}>Thẻ của tôi</Text>
            </View>
            {coupons.length > 0 ? (
                <View style={{width: '100%', marginHorizontal: 'auto'}}>
                    {coupons.map(coupon => (
                        <View key={coupon.id} style={{width: '100%', alignItems: 'center'}}>
                            <CouponItem coupon={coupon}/>
                        </View>
                    ))}
                </View>
            ): (
                <View style={{width: '85%', alignItems: 'center'}}>
                    <Text style={{fontWeight: '600', fontSize: 16}}>Hiện tại bạn chưa có phiếu giảm giá nào</Text>
                    <Text style={{color: colors.grey_text}}>Đừng lo lắng, bạn có thể nhận các phiếu giảm giá cho các giao dịch tiếp theo của bạn</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },

    headContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: 8,
    },

    titleHead: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
    }
})