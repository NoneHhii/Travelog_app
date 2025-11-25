import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { Coupon } from "../screens/MyCoupon";
import { Ionicons } from "@expo/vector-icons";
import { ButtonComponent } from "./ButtonComponent";

interface Prop {
    coupon: Coupon;
}

export const CouponItem:React.FC<Prop> = ({coupon}) => {

    const formatDate = (date: Date) => {
        return `${date.getDay()}/${date.getMonth() + 1}/${date.getFullYear()}`
    }
    

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={{padding: 4}}>
                    <Image source={require('../../assets/Coupon.png')} style={styles.img}/>
                </View>
                <View style={{width: '80%'}}>
                    <Text style={styles.title}>{coupon.title}</Text>
                    <Text style={{
                        color: colors.grey_text,
                        fontSize: 12
                    }}>{coupon.description}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="alert-circle-outline" size={16}/>
                </TouchableOpacity>
            </View>
            <View style={styles.line}/>
            <View style={[styles.row, {marginBottom: 8, marginTop: 16}]}>
                <View style={styles.cpForm}>
                    <Text style={{fontWeight: 'bold', color: colors.green}}>{coupon.code}</Text>
                </View>
                <TouchableOpacity style={styles.btnCpy}>
                    <Text style={{color: colors.blue, fontWeight: '700'}}>Copy</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.circleCusLeft}/>
            <View style={styles.circleCusRight}/>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
        width: '90%',
        padding: 10,
        borderRadius: 10,
        position: 'relative',
    },

    row: {
        flexDirection: 'row'
    },

    img: {
        width: 42,
        height: 42,
    },

    title: {
        fontWeight: '600',
        fontSize: 16,
    },

    cpForm: {
        backgroundColor: colors.light,
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10,
    }, 

    btnCpy: {
        backgroundColor: colors.light_Blue,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 12,
    },

    line: {
        margin: 'auto',
        borderColor: colors.grey_text,
        borderTopWidth: 1,
        borderStyle: 'dashed',
        width: '100%',
        height: 1,
        marginTop: 4,
    },

    circleCusLeft: {
        width: 16,
        height: 16,
        borderRadius: 16,
        position: 'absolute',
        left: -8,
        top: '50%',
        backgroundColor: '#F0F0F0',
    },

    circleCusRight: {
        width: 16,
        height: 16,
        borderRadius: 16,
        position: 'absolute',
        right: -8,
        top: '50%',
        backgroundColor: '#F0F0F0',
    }
})