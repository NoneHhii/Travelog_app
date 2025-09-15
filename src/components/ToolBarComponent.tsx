import React from "react";
import {View, TextInput, StyleSheet, Image} from 'react-native'
import { colors } from "../constants/colors";

interface toolProps {
    bill?: boolean,
}

export const ToolBarComponent: React.FC<toolProps> = ({
    bill = false,
}) => {
        return (
            <View style={styles.container}>
                <View style={styles.input}>
                    <Image 
                        source={require('../../assets/searchIcon.png')} 
                        style={{marginRight: 3}}
                    />
                    <TextInput
                        placeholder="Super sale 10.10 with 30% dea..."
                        
                    />
                </View>
                <View style={styles.tools}>
                    <Image 
                        source={require('../../assets/noti.png')} 
                        style={styles.icon}
                    />
                    <Image 
                        source={require('../../assets/chat.png')} 
                        style={styles.icon}
                    />
                    {bill && (
                        <Image 
                            source={require('../../assets/purchase.png')} 
                            style={styles.icon}
                        />
                    )}
                </View>
            </View>
        )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.themeGra1,
        paddingVertical: 20,
        paddingHorizontal: 12,
    },

    input: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 20,
        flex: 1,
        paddingHorizontal: 12,
        // paddingVertical: 3,
        marginRight: 10,
    },

    tools: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginLeft: 16,
    }
})