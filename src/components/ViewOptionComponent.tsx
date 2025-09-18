import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const ViewOptionComponent = ({ img, title, content }) => {
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          alignItems: "center",
          padding: 20,
        }}
      >
        <Image style={{ width: 50, height: 50 }} source={img} />
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            width: 460,
            alignItems: "center",
            paddingLeft: 20,
          }}
        >
          <View>
            <Text style={{ fontWeight: "bold", fontSize: 25 }}>{title}</Text>
            <Text style={{ width: 350 }}>{content}</Text>
          </View>
          <View>
            <Image
              source={require("../../assets/AccountPage/black_arrow.png")}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(84,157,220,0.5)",
    height: 120,
    width: 550,
    borderRadius: 10,
    marginBottom: 5,
  },
});

export default ViewOptionComponent;
