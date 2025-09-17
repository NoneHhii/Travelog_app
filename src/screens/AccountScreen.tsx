import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const AccountScreen: React.FC = () => {
  return (
    <View>
      <View style={styles.circleBorder}></View>
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            style={{ width: 80, height: 80 }}
            source={require("../../assets/AccountPage/avatar 1.png")}
          />
          <View style={{ paddingLeft: 30 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: 300,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                User Name
              </Text>
              <Image
                style={{ width: 30, height: 30 }}
                source={require("../../assets/AccountPage/pen 1.png")}
              />
            </View>
            <Text>Logged in with Google</Text>
            <Text>0 Posts</Text>
          </View>
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Pressable style={styles.button}>
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              View my profile
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={{ marginTop: 170, marginLeft: 25 }}>
        <LinearGradient
          colors={["#262626", "#4F5055", "#515257"]}
          start={{ x: 0.0, y: 0 }}
          end={{ x: 0.5, y: 5 }}
          style={styles.vip}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>
            Be part of Travelog PRIORITY
          </Text>
          <Image source={require("../../assets/AccountPage/white_arrow.png")} />
        </LinearGradient>
        <View style={{ marginTop: 25 }}>
          <Text style={styles.text}>My Payment Options</Text>
        </View>
        <View style={{ marginTop: 25 }}>
          <Text style={styles.text}>My rewards</Text>
        </View>
        <View style={{ marginTop: 25 }}></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circleBorder: {
    height: 180,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    backgroundColor: "#0099FF",
  },
  container: {
    position: "absolute",
    height: 300,
    width: 500,
    backgroundColor: "white",
    top: 20,
    left: 50,
    borderRadius: 20,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,

    // Bóng đổ (Android)
    elevation: 6,
  },
  button: {
    height: 55,
    borderRadius: 20,
    backgroundColor: "#549DDC",
    width: 380,
    justifyContent: "center",
    alignItems: "center",
  },
  vip: {
    height: 60,
    width: 550,
    backgroundColor: "red",
    borderRadius: 20,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
  },
  text: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
