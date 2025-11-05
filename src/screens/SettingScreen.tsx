import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

const accountOptions = [
    {
        id: 1,
        icon: "person" as const,
        title: "Thông tin tài khoản",
        content: "",
    },
    {
        id: 2,
        icon: "key" as const,
        title: "Mật khẩu & bảo mật",
        content: "",
    },
    {
        id: 3,
        icon: "lock-closed" as const,
        title: "Quyền riêng tư",
        content: "",
    },
];

type Stack = NativeStackScreenProps<RootStackParamList, 'SettingScreen'>

interface OptionRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    content: string;
    onPress?: () => void;
    isLast?: boolean;
}

const OptionRow: React.FC<OptionRowProps> = ({ icon, title, content, onPress, isLast }) => (
    <TouchableOpacity style={[styles.optionRow, isLast && styles.optionRowLast]} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={24} color={colors.themeColor} style={styles.optionIcon} />
        <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{title}</Text> 
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={colors.grey_text} />
    </TouchableOpacity>
);

export const SettingScreen: React.FC<Stack> = ({navigation}) => {
    const {logout} = useAuth();

    return (
        <View>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Tài khoản và bảo mật</Text>
                {accountOptions.map((item, index) => (
                    <OptionRow
                        key={item.id}
                        icon={item.icon}
                        title={item.title}
                        content={item.content}
                        isLast={index === accountOptions.length - 1}
                    />
                ))}
            </View>

            <TouchableOpacity style={[styles.optionRow, styles.card]} onPress={() => logout()} activeOpacity={0.7}>
                <Ionicons name={'log-out'} size={24} color={colors.themeColor} style={styles.optionIcon} />
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Đăng xuất</Text> 
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.grey_text} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        backgroundColor: '#F4F7FF',
        flex: 1,

    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0A2C4D',
        marginBottom: 10,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 1.5,
        shadowColor: "#AAB2C8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    optionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.light_Blue,
        },
        optionRowLast: {
            borderBottomWidth: 0,
        },
        optionIcon: {
            marginRight: 15,
        },
        optionTextContainer: {
            flex: 1,
            marginRight: 10,
        },
        optionTitle: {
            fontSize: 15,
            fontWeight: '500',
            color: colors.primaryTextColor,
            marginBottom: 3,
        },
        optionContent: {
            fontSize: 13,
            color: colors.grey_text,
        },
})