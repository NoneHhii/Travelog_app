import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { TextComponent } from "../components/TextComponent";
import { colors } from "../constants/colors";
import { RootStackParamList } from "../navigation/RootNavigator";
import { fontFamilies } from "../types/fontFamilies";
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from "../hooks/useAuth";

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, "Splash">;

export const SplashScreen : React.FC = () => {

    const {user, loading} = useAuth();

    // if(user) console.log("User: ", user.displayName);
    

    const navigation = useNavigation<SplashScreenNavigationProp>();

    // const [request] = Google.useAuthRequest({
    //     webClientId: '622670897999-h8hkntn6n4uali9l4nu8bs0ih3hr67j5.apps.googleusercontent.com',
    //     androidClientId: '622670897999-svklm1kv0osv2ujvljg2uatcac10lfo4.apps.googleusercontent.com',
    // });

    // console.log(request?.redirectUri);
    

    useEffect(() => {
        if(!loading) {
            const timer = setTimeout(() => {
                // console.log("user:", user);
                
                if (user) {
                    navigation.replace("Main");
                } else {
                    navigation.replace("Intro"); 
                }
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [loading, user, navigation]);

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