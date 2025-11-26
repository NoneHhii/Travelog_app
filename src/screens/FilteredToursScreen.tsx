import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Image, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { TextComponent } from '../components/TextComponent';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getAllTravel } from '../api/apiClient'; // Giả định có hàm này
import travel from './HomeScreen'; // Giả định type travel
import { TravelItemGrid } from '../components/TravelItemGrid'; // Giả định component hiển thị tour
import { Slider } from '../components/Slider';

// Khai báo type props (RootStackParamList cần được import)
type FilteredToursProps = NativeStackScreenProps<RootStackParamList, 'FilteredTours'>;

// Component hiển thị Flash Sale/Ads
const FlashSaleAd: React.FC = () => (
    <View style={adStyles.flashSaleContainer}>
        <TextComponent text="FLASH SALE HÔM NAY!" size={18} fontWeight="bold" color="#FF3D00" />
        <TextComponent text="Giảm thêm 10% khi thanh toán bằng ví điện tử." size={14} color="#FF3D00" />
        {/* <Image source={require('../../assets/sale_ad.png')} style={adStyles.adImage} /> */}
        <TextComponent text="⏰ Kết thúc sau: 03:20:15" size={14} fontWeight="bold" color="#0A2C4D" styles={{marginTop: 8}} />
    </View>
);

// Component hiển thị Ads dạng Banner
const BannerAd: React.FC<{ title: string, subtitle: string, bgColor: string }> = ({ title, subtitle, bgColor }) => (
    <View style={[adStyles.bannerContainer, { backgroundColor: bgColor }]}>
        <TextComponent text={title} size={16} fontWeight="bold" color="#FFF" />
        <TextComponent text={subtitle} size={13} color="#EEE" />
    </View>
);

interface TravelSectionProps {
  travels: travel[];
  onPressItem: (item: travel) => void;
  title: string,
}
const TravelSection: React.FC<TravelSectionProps> = ({
  travels,
  onPressItem,
  title,
}) => (
  <ImageBackground 
    style={styles.travelSectionContainer}
    >
    <View style={styles.sectionHeader}>
      <TextComponent
        text={title}
        size={18}
        fontWeight="bold"
        color="#0A2C4D"
      />
      
    </View>
    <Slider
      travels={travels}
      RadiusTop={16}
      RadiusBottom={16}
      handleDetail={onPressItem}
    />
  </ImageBackground>
);

export const FilteredToursScreen: React.FC<FilteredToursProps> = ({ navigation, route }) => {
    const { transportType } = route.params;
    const [travels, setTravels] = useState<travel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const bgurl = transportType === "Máy bay" ? require("../../assets/bg-sky.jpg") :
                                               (transportType === "Tàu thuyền" ? require("../../assets/bg-beach.jpg") : 
                                                require("../../assets/bg-bus.jpg"))

    // 1. Lấy và Lọc dữ liệu Tour
    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const allData = await getAllTravel();
                
                // Lọc dữ liệu dựa trên tham số truyền vào
                const filteredData = (allData as travel[]).filter(
                    (tour) => tour.transport === transportType
                );
                
                setTravels(filteredData);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [transportType]);


    const handleDetail = (travel: travel) => {
        navigation.navigate("TravelDetail", { travel });
    };

    if (error) {
        return <View style={styles.center}><TextComponent text="Lỗi tải dữ liệu" color={colors.red} /></View>;
    }

    
    
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <TextComponent text={`Tour Du Lịch bằng ${transportType}`} size={20} fontWeight="bold" color={colors.white} styles={{flex: 1, textAlign: 'center'}} />
                <View style={{width: 24}} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 2. Phần Ads và Ưu đãi (Thêm nhiều cái Ads) */}
                <ImageBackground
                    source={require("../../assets/bg-flashsale.jpg")}
                    style={{
                        
                    }}
                >
                    <FlashSaleAd />
                    <View style={{marginTop: 20, marginBottom: 15, paddingHorizontal: 15}}>
                        <TextComponent text={`Gợi ý tour ${transportType} cho bạn`} size={18} fontWeight="bold" color={colors.white} />
                    </View>
                    
                    <BannerAd title="Đặt tour theo nhóm nhận ưu đãi lớn!" subtitle="Giảm ngay 20% khi đặt trên 5 người." bgColor={colors.blue_splash} />
                    <BannerAd title="Tour cao cấp" subtitle="Trải nghiệm dịch vụ 5 sao với giá ưu đãi." bgColor={colors.grey_text} />
                </ImageBackground>
                
                {/* 3. Danh sách Kết quả Tour */}
                {isLoading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color="#0194F3" /></View>
                ) : travels.length === 0 ? (
                    <View style={styles.center}><TextComponent text={`Không tìm thấy tour ${transportType} nào.`} color={colors.grey_text} /></View>
                ) : (
                    <ImageBackground
                        source={bgurl}
                    >
                        <TravelSection travels={travels} onPressItem={handleDetail} title={`Tour Du Lịch bằng ${transportType}`}/>
                        <TravelSection travels={travels.filter(travel => travel.price <= 9500000)} onPressItem={handleDetail} title="Ưu đãi tốt nhất"/>
                    </ImageBackground>
                )}
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
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        padding: 5,
        backgroundColor: colors.blue_splash,
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    travelSectionContainer: {
        paddingTop: 25,
        paddingBottom: 20, // Thêm padding dưới cùng
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    }
});

const adStyles = StyleSheet.create({
    flashSaleContainer: {
        backgroundColor: '#FFEFEB', // Nền đỏ/hồng nhạt
        padding: 15,
        marginHorizontal: 15,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FF3D00',
        alignItems: 'center',
        marginTop: 15,
    },
    adImage: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        marginVertical: 10,
    },
    bannerContainer: {
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 8,
        borderRadius: 10,
    }
});