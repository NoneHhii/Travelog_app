import React, { useState } from "react";
import { ActivityIndicator, Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { ButtonComponent } from "../components/ButtonComponent";
import { TextComponent } from "../components/TextComponent";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

type Stack = NativeStackScreenProps<RootStackParamList, 'Login'>

export const Login:React.FC<Stack> = ({navigation}) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (email: string, password: string) => {
        Keyboard.dismiss();
        setLoading(true);
        signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            setLoading(false);
            const user = userCredential.user;
            // console.log("Login success", user.displayName);
            navigation.navigate('Main');
        }) 
        .catch(err => {
            setLoading(false);
            Alert.alert("Login failure");
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleView}>
                <Text style={styles.title}>Welcome</Text>
            </View>
            <View style={styles.formView}>
                <View style={{marginTop: 35, alignItems: 'center'}}>
                    <Text style={styles.subTitle}>Đăng nhập</Text>
                    <Text>Nhập tài khoản của bạn để đăng nhập</Text>
                </View>
                <View style={{width: '100%', alignItems: 'center'}}>
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
                <TouchableOpacity
                    style={[styles.button, {
                        width:'50%',
                        borderRadius: 30,
                        backgroundColor: '#2196F3'
                    }]}
                    onPress={() => handleLogin(email, password)}
                >
                    {loading? (
                        <ActivityIndicator color={'#fff'}/>
                    ) : (
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>Đăng nhập</Text>
                    )}
                </TouchableOpacity>
                {/* <ButtonComponent
                    type="button"
                    text="Login"
                    onPress={() => handleLogin(email, password)}
                    borderRadius={30}
                    width={'50%'}
                    fontWeight={'bold'} 
                /> */}
                <ButtonComponent
                    type="text"
                    text="Quên mật khẩu?"
                    onPress={() => {}}
                    textSize={12}
                />
                <View style={[styles.row, {marginTop: 8}]}>
                    <Text style={{fontSize: 10}}>Chưa có tài khoản? </Text>
                    <ButtonComponent
                        type="text"
                        text="Đăng ký"
                        onPress={() => navigation.navigate('Register')}
                        textSize={10}
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
        fontSize: 42,
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
    },

    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        margin: 8,
    }
})