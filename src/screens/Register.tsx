import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { ButtonComponent } from "../components/ButtonComponent";
import { colors } from "../constants/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createUser } from "../api/apiClient";

type Stack = NativeStackScreenProps<RootStackParamList, 'Register'>

export interface UserDB {
    displayName: string,
    email: string,
    phoneNumber: string,
    profileImageUrl: string,
    saveTour: [],
    uid: string,
}

export const Register: React.FC<Stack> = ({navigation}) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");

    const postUser = async (uid: string) => {
        try {
            const user: UserDB = {
                displayName: fullName,
                email: email,
                phoneNumber: phoneNumber,
                profileImageUrl: "",
                saveTour: [],
                uid: uid,
            }

            const newUser = await createUser(user);
            return newUser;
        } catch (error) {
            
        }
    }

    const handleSummit = (emailL: string, password: string) => {
        createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log("Register success with ", user.email);
            postUser(user.uid);
            navigation.navigate('Main');
        })
        .catch(err => {
            console.error("Register fail: ", err.message);
            
        }) 
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleView}>
                <Text style={styles.title}>Tạo tài khoản</Text>
            </View>
            <View style={styles.formView}>
                <View style={{width: '100%', alignItems: 'center', marginTop: 35}}>
                    <View style={styles.form}>
                        <Text style={styles.label}>Tên</Text>
                        <TextInput
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Nguyễn Văn A"
                            style={styles.inputView}
                        />
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@gmail.com"
                            style={styles.inputView}
                        />
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="+ 123 456 789"
                            style={styles.inputView}
                        />
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.label}>Mật khẩu</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="●●●●●●●●"
                            style={styles.inputView}
                            secureTextEntry={true}
                        />
                    </View>
                </View>
                <View style={[styles.row, {marginTop: 8}]}>
                    <Text style={{fontSize: 12}}>Bằng việc tiếp tục, bạn đồng ý với </Text>
                    <ButtonComponent
                        type="text"
                        text="Điều khoản sử dụng"
                        onPress={() => {}}
                        textSize={12}
                        fontWeight={'bold'}
                    />
                    <Text style={{fontSize: 12}}> và </Text>
                    <ButtonComponent
                        type="text"
                        text="Chính sách bảo mật"
                        onPress={() => {}}
                        textSize={12}
                        fontWeight={'bold'}
                    />
                </View>
                <ButtonComponent
                    type="button"
                    text="Đăng ký"
                    onPress={() => handleSummit(email, password)}
                    borderRadius={30}
                    width={'50%'}
                    fontWeight={'bold'} 
                />
                <View style={[styles.row, {marginTop: 4}]}>
                    <Text style={{fontSize: 12}}>Đã có tài khoản? </Text>
                    <ButtonComponent
                        type="text"
                        text="Đăng nhập"
                        onPress={() => navigation.navigate('Login')}
                        textSize={12}
                        textColor={colors.blue}
                    />
                </View>
                
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#45A1DE',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    titleView: {
        justifyContent: 'center',
        padding: 50,
    },

    title: {
        color: colors.white,
        fontSize: 36,
        fontWeight: 'bold',
        
    },

    subTitle: {
        color: '#45A1DE',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },

    formView: {
        backgroundColor: colors.white,
        flex: 1,
        width: '100%',
        alignItems: 'center',
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        
    },

    form: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },

    inputView: {
        borderWidth: 1,
        borderColor: '#90D5FF',
        width: '80%',
        height: 40,
        borderRadius: 18,
        paddingHorizontal: 12,
    },

    label: {
        width: '80%', 
        textAlign: 'left',
        marginBottom: 8,
    }
})