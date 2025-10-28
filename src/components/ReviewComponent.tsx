import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { Review, User } from "../screens/TravelDetail"
import { colors } from "../constants/colors"

interface ReviewProps {
    review: Review,
    user: User,
}

const ReviewComponent: React.FC<ReviewProps> = ({ review, user }) => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Image
                    source={{uri: user.profileImageUrl}}
                    style={styles.avatar}
                />
                <View>
                    <Text>{user.displayName}</Text>
                    <View style={[styles.row, styles.avgRate]}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={{width: 16, height: 16}}
                        />
                        <Text>
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    marginLeft: 4,
                                    color: colors.blue,
                                }}
                            >
                                {review.rating}
                            </Text>
                            /5 
                        </Text>
                    </View>
                </View>
            </View>
            
            <Text
                style={{
                    marginVertical: 10,
                }}
            >
                {review.comment}
            </Text>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        shadowColor: "#000",
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        width: 250,
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
        marginVertical: 4,
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    }
})

export default ReviewComponent;