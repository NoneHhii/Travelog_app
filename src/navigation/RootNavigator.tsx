import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { HomeScreen } from "../screens/HomeScreen";
import { SplashScreen } from "../screens/SplashScreen";

export type RootStackParamList = {
    Splash: undefined,
    Home: undefined,
}

const Stack = createStackNavigator();

export const RootNavigator :React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{headerShown: false}}
            >
                <Stack.Screen name="Splash" component={SplashScreen}/>
                <Stack.Screen name="Home" component={HomeScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}