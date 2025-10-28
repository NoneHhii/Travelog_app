import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { TextComponent } from "../components/TextComponent";
import { colors } from "../constants/colors";
import { RootStackParamList } from "../navigation/RootNavigator";
import { fontFamilies } from "../types/fontFamilies";

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, "Splash">;

export const SplashScreen : React.FC = () => {

    const navigation = useNavigation<SplashScreenNavigationProp>();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("Intro");
        }, 4000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image source={require("../../assets/travelog.gif")} style={{width: 120, height: 120}}></Image>
            <TextComponent
                text="Bắt đầu hành trình của bạn"
                color={colors.white}
                size={16} 
                fontWeight="500"
                
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#45A1DE',
    }
})