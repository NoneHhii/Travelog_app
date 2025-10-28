import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { colors } from "../constants/colors";
import { HomeScreen } from "../screens/HomeScreen";
import { BookingScreen } from "../screens/BookingScreen";
import { SavingScreen } from "../screens/SavingScreen";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AccountScreen } from "../screens/AccountScreen";
// import { ExploreScreen } from "../screens/ExploreScreen";

const Tab = createBottomTabNavigator();

export const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0194F3",
        tabBarInactiveTintColor: "#8D8585",
        tabBarStyle: {
          backgroundColor: colors.white,
          height: Platform.OS === "ios" ? 85 : 70,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 5,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        } as any,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "explore") {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === "bookings") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "save") {
            iconName = focused ? "bookmark" : "bookmark-outline";
          } else if (route.name === "account") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }

          return (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: size + 8,
                height: size + 8,
              }}
            >
              {focused ? (
                <LinearGradient
                  colors={["#90cff9ff", "#0194F3"]}
                  style={[
                    styles.iconContainer,
                    {
                      width: size + 12,
                      height: size + 12,
                      borderRadius: (size + 12) / 2,
                    },
                  ]}
                >
                  <Ionicons name={iconName} size={size} color={colors.white} />
                </LinearGradient>
              ) : (
                <Ionicons name={iconName} size={size} color={color} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Trang chủ",
        }}
      />
      <Tab.Screen
        name="explore"
        component={HomeScreen}
        options={{
          tabBarLabel: "Khám phá",
        }}
      />
      <Tab.Screen
        name="bookings"
        component={BookingScreen}
        options={{
          tabBarLabel: "Đặt chỗ",
        }}
      />
      <Tab.Screen
        name="save"
        component={SavingScreen}
        options={{
          tabBarLabel: "Đã lưu",
        }}
      />
      <Tab.Screen
        name="account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Tài khoản",
        }}
      />
    </Tab.Navigator>
  ) as any;
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0194F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
