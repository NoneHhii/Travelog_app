// FILE: src/screens/MissionScreen.tsx (File mới)

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { TextComponent } from '../components/TextComponent';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import * as Progress from 'react-native-progress';
import { useAuth } from '../hooks/useAuth';
import moment from 'moment';
import { CheckInDaily } from '../api/apiClient'; // Giả định hàm API

type MissionScreenProps = NativeStackScreenProps<RootStackParamList, 'MissionScreen'>;

const isCheckedTodayFunction = (lastCheckinDate) => {
    return lastCheckinDate 
        ? moment(lastCheckinDate).isSame(moment(), 'day') 
        : false;
};


const AdCard: React.FC<{ title: string, reward: number, action: string, onPress: () => void }> = ({ title, reward, action, onPress }) => (
    <View style={adStyles.adCard}>
        <View style={adStyles.adContent}>
            <TextComponent text={title} size={14} color="#333" styles={{ maxWidth: '70%' }} />
            <TextComponent text={`+${reward} Điểm`} size={15} fontWeight="bold" color={colors.red} />
        </View>
        <TouchableOpacity style={adStyles.adButton} onPress={onPress}>
            <TextComponent text={action} size={13} fontWeight="bold" color={colors.white} />
        </TouchableOpacity>
    </View>
);

const DailyMissionCard: React.FC<{ user: any, onNaviMission: (route: string) => void }> = ({ user, onNaviMission }) => {
    const currentSearchCount = user?.searchCount || 0;
    const MAX_SEARCH_COUNT = 10;
    const progress = Math.min(currentSearchCount / MAX_SEARCH_COUNT, 1);
    
    return (
        <View style={adStyles.missionCard}>
            <TextComponent text="Nhiệm vụ Hàng ngày" size={16} fontWeight="bold" color="#0A2C4D" styles={{ marginBottom: 10 }} />
            <View style={adStyles.missionRow}>
                <TextComponent text={`Tìm kiếm tour ${MAX_SEARCH_COUNT} lần để nhận 400 điểm`} size={13} color={colors.grey_text} styles={{ width: '70%' }} />
                <TouchableOpacity style={adStyles.btnMiss} onPress={() => onNaviMission('Search')}>
                    <TextComponent text="Tìm kiếm" color={colors.white} size={13} />
                </TouchableOpacity>
            </View>
            <View style={adStyles.progressContain}>
                <Progress.Bar
                    progress={progress}
                    width={280} 
                    height={3}
                    color={colors.red}
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                />
                 {/* Điểm 5 lần */}
                <View style={[adStyles.point, { left: '48%' }]}>
                    <Image source={require('../../assets/point.png')} style={adStyles.imgPoint} />
                    <TextComponent text="5 lần" size={10} color={colors.grey_text} />
                </View>
                {/* Điểm 10 lần */}
                <View style={[adStyles.point, { right: 0 }]}>
                    <Image source={require('../../assets/point.png')} style={adStyles.imgPoint} />
                    <TextComponent text="10 lần" size={10} color={colors.grey_text} />
                </View>
            </View>
             <TextComponent text={`Bạn đã tìm kiếm ${currentSearchCount}/${MAX_SEARCH_COUNT} lần hôm nay.`} size={12} color={colors.grey_text} />
        </View>
    );
};

export const MissionScreen: React.FC<MissionScreenProps> = ({ navigation }) => {
    const { user, refreshUser } = useAuth();
    
    const isCheckedToday = isCheckedTodayFunction(user?.lastCheckInDate);
    
    const handleCheckinPress = async (check: any) => {
        if (!user || isCheckedToday) return;
        try {
            await CheckInDaily(user.uid, check.point); // Gọi API
            refreshUser(); // Làm mới dữ liệu
            Alert.alert("Thành công", `Bạn đã nhận được ${check.point} điểm!`);
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Không thể điểm danh.");
        }
    };
    
    // Giả định hàm xử lý điều hướng nhiệm vụ khác
    const handleNaviMission = (route: string) => {
        navigation.navigate(route as 'Search');
    };
    
    // Giả định logic để tạo mảng 7 ngày điểm danh
    const checkinDays = useMemo(() => {
        // [Logic getCheckpoints(user) được đặt ở đây]
        return []; // Trả về mảng 7 ngày đã tính toán
    }, [user]); 

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0A2C4D" />
                </TouchableOpacity>
                <TextComponent text="Nhiệm vụ & Ưu đãi" size={20} fontWeight="bold" color="#0A2C4D" styles={{ flex: 1, textAlign: 'center' }} />
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Điểm thưởng hiện tại */}
                <View style={styles.rewardSummary}>
                    <TextComponent text="Điểm thưởng hiện tại:" size={15} color={colors.grey_text} />
                    <TextComponent text={`${user?.pointReward || 0} điểm`} size={24} fontWeight="bold" color={colors.red} />
                </View>

                {/* Khu vực điểm danh 7 ngày */}
                <View style={styles.section}>
                    <TextComponent text="Điểm danh nhận xu hàng ngày" size={16} fontWeight="bold" color="#0A2C4D" styles={{ marginBottom: 10 }} />
                    <View style={styles.checkinGrid}>
                        {/* ⚠️ CHÚ Ý: Logic lặp qua 7 ngày checkinDays ở đây ⚠️ */}
                        {/* {checkinDays.map(day => (
                            <Checkpoint day={day} onPress={() => handleCheckinPress(day)} />
                        ))} */}
                    </View>
                    <TouchableOpacity
                        style={[styles.checkinButton, {
                            backgroundColor: isCheckedToday ? colors.grey_text : colors.red,
                        }]}
                        disabled={isCheckedToday}
                        onPress={() => handleCheckinPress(checkinDays[user?.checkinStreak || 0])} // Truyền mốc tiếp theo
                    >
                        <TextComponent text={isCheckedToday ? "Đã nhận hôm nay" : "Điểm danh ngay"} color={colors.white} fontWeight="bold" />
                    </TouchableOpacity>
                </View>

                {/* Nhiệm vụ tìm kiếm */}
                <DailyMissionCard user={user} onNaviMission={handleNaviMission} />

                {/* Khu vực ADS (Nhận điểm qua hành động) */}
                <View style={styles.section}>
                    <TextComponent text="Kiếm thêm điểm thưởng" size={16} fontWeight="bold" color="#0A2C4D" styles={{ marginBottom: 10 }} />
                    <AdCard 
                        title="Viết bình luận cho tour bạn đã tham gia" 
                        reward={100} 
                        action="Viết ngay"
                        onPress={() => Alert.alert('Navigate to Review Page')} 
                    />
                    <AdCard 
                        title="Chia sẻ ứng dụng lên mạng xã hội" 
                        reward={50} 
                        action="Chia sẻ"
                        onPress={() => Alert.alert('Share App')} 
                    />
                    <AdCard 
                        title="Xem video giới thiệu tour (30s)" 
                        reward={20} 
                        action="Xem video"
                        onPress={() => Alert.alert('Watch Video')} 
                    />
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: '#E0F7FF',
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 50,
        paddingHorizontal: 15,
    },
    rewardSummary: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#FFFBEF',
        borderRadius: 15,
        marginBottom: 15,
    },
    section: {
        paddingVertical: 15,
        paddingHorizontal: 0,
        backgroundColor: colors.white,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    checkinGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    checkinButton: {
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
});

const adStyles = StyleSheet.create({
    missionCard: {
        backgroundColor: '#EAF8FF', // Nền xanh nhạt
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    missionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    btnMiss: {
        backgroundColor: colors.red,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    progressContain: {
        width: '100%',
        height: 2,
        position: 'relative',
        marginVertical: 15,
        alignItems: 'center',
    },
    point: {
        position: 'absolute',
        top: -15,
        alignItems: 'center',
    },
    imgPoint: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    adCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    adContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
        marginRight: 10,
    },
    adButton: {
        backgroundColor: colors.blue_splash,
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
    },
});