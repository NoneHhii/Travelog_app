import { StaticParamList } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useEffect } from "react"
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import travel from "./HomeScreen";
import { getAllDestinations, getReviews, getUsers } from "../api/apiClient";
import { colors } from "../constants/colors";
import ReviewComponent from "../components/ReviewComponent";
import { ButtonComponent } from "../components/ButtonComponent";

export interface Review {
    comment: string,
    rating: number,
    userID: string,
    createdAt: string,
    tourID: number,
}

export interface User {
    id: string,
    displayName: string,
    profileImageUrl: string,
}

type Stack = NativeStackScreenProps<StaticParamList, 'TravelDetail'>;

const TravelDetail:React.FC<Stack> = ({navigation, route}) => {

    const [destinations, setDestinations] = React.useState([]);
    const [reviews, setReviews] = React.useState([]);
    const [users, setUsers] = React.useState([]);

    useEffect(() => {
        (async () => {
            const data = await getAllDestinations();
            const dataReviews = await getReviews();
            const dataUsers = await getUsers();
            setReviews(dataReviews);
            setUsers(dataUsers);
            setDestinations(data);
        })();
    }, []);

    const {travel}: {travel: travel} = route.params;

    const getDestination = () => {
        return destinations.find(dest => dest.id === travel.destinationID);
    }

    const getReviewTravel = () => {
        return reviews.filter(review => review.tourID === travel.id);
    }

    const renderReview = ({item}: {item: Review}) => {
        const user = users.find(user => user.id === item.userID);
        return (
            <ReviewComponent review={item} user={user}/>
        )
    }

    const handleBooking = () => {
        
        navigation.navigate('BookingTour', {travel: travel, destinationName: getDestination()?.name || ''});
    }
    
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <Image
                    source={{uri: travel.images[0]}}
                    style={styles.imgBanner}
                />
                {/* overview */}
                <View style={{width: '90%', marginTop: 16, borderBottomWidth: 1, borderBottomColor: colors.light_Blue, paddingBottom: 16,}}>
                    <Text 
                        style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                        }}
                    >
                        {travel.departurePoint} - {getDestination()?.name}
                    </Text>
                    <View style={{marginTop: 8,}}>
                        <View style={styles.row}>
                            <View style={[styles.row, styles.avgRate]}>
                                <Image
                                    source={require('../../assets/logo.png')}
                                    style={{width: 24, height: 24}}
                                />
                                <Text
                                    style={{
                                        color: colors.blue
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontWeight: 'bold',
                                            marginLeft: 4,
                                        }}
                                    >
                                        {travel.averageRating}
                                    </Text>
                                    /5 
                                </Text>
                            </View>
                            <Text
                                style={{
                                    flex: 1,
                                }}
                            >
                                • ({travel.reviewCount} reviews)
                            </Text>
                            <TouchableOpacity>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        color: colors.blue,
                                    }}
                                >
                                    {">"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text
                            style={{
                                marginTop: 8,
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: colors.red,
                            }}
                        >
                            Price: {travel.price.toLocaleString('en-US')} VND
                        </Text>
                    </View>
                </View>
                {/* detail */}
                <View style={{width: '90%', marginTop: 16, borderBottomWidth: 1, borderBottomColor: colors.light_Blue, paddingBottom: 16,}}>
                    <Text>
                        {travel.title}
                    </Text>
                    <Text style={styles.highlight}>
                        Điểm nổi bật
                    </Text>
                    <Text style={{color: colors.grey_text}}>
                        {travel.description}
                    </Text>
                    <Text style={styles.highlight}>
                        Hành trình
                    </Text>
                    {travel.itinerary.map((item, index) => (
                        <View key={index} style={{marginBottom: 8,}}>
                            <Text>{item.title}</Text>
                            <Text style={{
                                    color: colors.grey_text, marginVertical: 4
                                }}
                            >
                                {item.details}
                            </Text>
                            <Image
                                source={{uri: travel.images[index + 1]}}
                                style={styles.imgBanner}
                            />
                        </View>
                    ))}
                </View>

                {/* review */}
                <Text style={[styles.highlight, {width: '90%', fontSize: 18,}]}>
                    Đánh giá từ khách hàng
                </Text>
                <FlatList
                    data={getReviewTravel()}
                    renderItem={renderReview}
                    keyExtractor={(item) => item.id}
                    style={{width: '90%', marginBottom: 16,}}
                    horizontal={true}
                />

                <View style={[styles.service ,{width: '90%',}]}>
                    <Text style={[styles.highlight, {fontSize: 18, textAlign: 'left'}]}>
                        Những dịch vụ được đảm bảo
                    </Text>
                    <Text style={styles.highlight}>
                        Miễn phí hủy trong 24 giờ
                    </Text>
                    <Text style={{color: colors.grey_text, marginBottom: 8,}}>
                        Bạn có thể được hoàn tiền toàn bộ hoặc một phần cho các vé đã chọn nếu hủy đặt chỗ trong vòng 24 giờ sau khi đặt.
                    </Text>
                </View>

                <View style={{width: '100%'}}>
                    <ButtonComponent
                        type="button"
                        text="Đặt vé ngay"
                        textColor={colors.white}
                        onPress={() => handleBooking()}
                        width={"90%"}
                    />
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.white,
    },

    headContain: {
        backgroundColor: '#009aec',
        width: '100%',
        alignItems: 'center',
        
    },

    imgBanner: {
        width: '100%',
        height: 250,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avgRate: {
        backgroundColor: colors.light,
        marginRight: 8,
        paddingHorizontal: 4,
        borderRadius: 4,
    },

    highlight: {
        marginVertical: 8,
        fontWeight: 'bold',
    },

    service: {
        borderTopWidth: 1,
        borderTopColor: colors.light_Blue,
        paddingTop: 8,
        borderBottomColor: colors.light_Blue,
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 16,
    }
})

export default TravelDetail;