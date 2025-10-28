import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { ToolBarComponent } from "../components/ToolBarComponent";
import travel, { HomeScreen } from "../screens/HomeScreen";
import { IntroPage } from "../screens/IntroPage";
import { SplashScreen } from "../screens/SplashScreen";
import { BottomTabs } from "./BottomTabs";
import { SearchScreen } from "../screens/SearchScreen";
import TravelDetail from "../screens/TravelDetail";
import BookingTour from "../screens/BookingTour";
import BookingInfor, { InforProps } from "../screens/BookingInfor";
import Payment, { PaymentType } from "../screens/Payment";
import { ChatbotScreen } from "../screens/ChatbotScreen";

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Intro: undefined;
  Main: undefined;
  Search: undefined;
  TravelDetail: { travel: travel };
  BookingTour: { travel: travel; destinationName: string };
  BookingInfor: { props: InforProps };
  Payment: { payment: PaymentType };
};

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: true }}
        // screenOptions={{
        //     header: () => <ToolBarComponent bill={false}/>, // default
        // }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            header: () => <ToolBarComponent bill={true} />,
          }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Intro"
          component={IntroPage}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TravelDetail"
          component={TravelDetail}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="BookingTour"
          component={BookingTour}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="BookingInfor"
          component={BookingInfor}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Payment"
          component={Payment}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
