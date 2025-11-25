import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Image, StyleSheet, View , Text, TouchableOpacity} from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { ButtonComponent } from "../components/ButtonComponent";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

export interface AssignProp {
    title: string,
    description: string,

}

const img = {
    "Thanh toán": require("../../assets/atm-card.png"),
    "Khu vực thưởng": require("../../assets/reward.png"),
    "Coupon của tôi": require("../../assets/discount.png"),
}

type Stack = NativeStackScreenProps<RootStackParamList, 'Assign'>;

interface AssignHeaderProps {
  onBackPress: () => void;
}
const AssignHeader: React.FC<AssignHeaderProps> = ({ onBackPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
      <Ionicons name="arrow-back" size={24} color="#0A2C4D" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Chọn ngày & số lượng</Text>
    <View style={styles.headerButton} />
  </View>
);

export const Assign:React.FC<Stack> = ({navigation, route}) => {
    const {prop} = route.params;
    
    return (
        <View style={styles.container}>
            <AssignHeader onBackPress={() => navigation.goBack()}/>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={img[prop.title]}/>
                <Text style={{textAlign: 'center'}}>{prop.description}</Text>
            </View>
            <ButtonComponent
                text="Login/Register"
                type="button"
                onPress={() => navigation.navigate("Login")}
                width={"90%"}
                borderRadius={30}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: colors.white,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomColor: colors.light_Blue,
        borderBottomWidth: 1,
      },
      headerButton: {
        width: 40,
        alignItems: "flex-start",
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0A2C4D",
      },
})