import React from "react"
import { StyleSheet, View } from "react-native"
import { ButtonComponent } from "../components/ButtonComponent"
import { TextComponent } from "../components/TextComponent"

export const HomeScreen : React.FC = () => {


    return (
        <View style={styles.container}>
            <TextComponent
                text="Welcome to Travelog"
            />
            <ButtonComponent
                text="Getting start"
                onPress={() => {}}
                type='button'
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
})