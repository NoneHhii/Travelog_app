import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { colors } from "../constants/colors";
import { HomeScreen } from "../screens/HomeScreen";
import { Image, Animated } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ToolBarComponent } from "../components/ToolBarComponent";
import { AccountScreen } from "../screens/AccountScreen";

const Tab = createBottomTabNavigator();

export const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <ToolBarComponent bill={false} />,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: "#8D8585",
        tabBarStyle: {
          backgroundColor: "#F3F3F3",
          height: 60,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 14,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === "Home") {
            iconSource = focused
              ? require("../../assets/logo.png")
              : require("../../assets/logo.png");
          } else if (route.name === "explore") {
            iconSource = focused
              ? require("../../assets/explore.png")
              : require("../../assets/explore.png");
          } else if (route.name === "bookings") {
            iconSource = focused
              ? require("../../assets/bill.png")
              : require("../../assets/bill.png");
          } else if (route.name === "save") {
            iconSource = focused
              ? require("../../assets/save.png")
              : require("../../assets/save.png");
          } else if (route.name === "account") {
            iconSource = focused
              ? require("../../assets/account.png")
              : require("../../assets/account.png");
          }

          const scaleAnimate = useRef(new Animated.Value(1)).current;

          useEffect(() => {
            Animated.spring(scaleAnimate, {
              toValue: focused ? 1.2 : 1,
              friction: 4,
              useNativeDriver: true,
            }).start();
          }, [focused]);

          return (
            <Animated.View
              style={{
                transform: [{ scale: scaleAnimate }],
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={iconSource}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode="contain"
              />
            </Animated.View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="explore" component={HomeScreen} />
      <Tab.Screen
        name="bookings"
        component={HomeScreen}
        options={{
          header: () => <ToolBarComponent bill={true} />,
        }}
      />
      <Tab.Screen name="save" component={HomeScreen} />
      <Tab.Screen name="account" component={AccountScreen} />
    </Tab.Navigator>
  );
};
