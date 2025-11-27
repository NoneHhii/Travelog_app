// FILE: CouponSelectionScreen.tsx (Hướng dẫn)

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { getAvailableCoupons, Coupon } from '../api/apiClient'; // Giả định
// ... (imports khác)

type CouponSelectionProps = StackScreenProps<RootStackParamList, 'CouponSelection'>;

export const CouponSelectionScreen: React.FC<CouponSelectionProps> = ({ navigation, route }) => {
    const { rawPrice, selectedCouponId } = route.params;
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            setIsLoading(true);
            const data = await getAvailableCoupons();
            setCoupons(data);
            setIsLoading(false);
        };
        fetchCoupons();
    }, []);

    // Hàm chọn coupon và quay lại màn hình BookingInfor
    const handleSelect = (coupon: Coupon | null) => {
        // Sử dụng navigation.navigate để gửi dữ liệu về màn hình trước
        navigation.navigate('BookingInfor', { 
            props: navigation.getState().routes.find(r => r.name === 'BookingInfor').params.props,
            // couponResult: coupon // Gửi đối tượng coupon về
        });
    };

    const renderItem = ({ item }: { item: Coupon }) => {
        const isApplicable = rawPrice >= item.minOrderValue;
        const isSelected = selectedCouponId === item.id;

        return (
            <TouchableOpacity 
                style={styles.couponCard}
                onPress={() => handleSelect(item)}
                disabled={!isApplicable}
            >
                {/* ... (Hiển thị chi tiết coupon, style, nút Chọn) ... */}
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <ActivityIndicator size="large" style={{flex: 1}} />;
    }

    return (
        <View style={styles.container}>
            {/* Header và nút Hủy/Gỡ bỏ */}
            <TouchableOpacity onPress={() => handleSelect(null)}>
                <Text>Không áp dụng mã</Text>
            </TouchableOpacity>
            
            <FlatList
                data={coupons}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    couponCard: { /* ... */ },
});