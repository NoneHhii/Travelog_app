import React from "react"
import { StyleSheet, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ButtonComponent } from "../components/ButtonComponent"
import { TextComponent } from "../components/TextComponent"

export const HomeScreen : React.FC = () => {


    return (
        <LinearGradient
            colors={['#0099FF', '#0464B6']}
            start={{x: 0.5, y: 0}}
            end={{x:0.5, y:1}}
            style={styles.container}
        >
            <TextComponent
                text="Welcome to Travelog"
            />
            <ButtonComponent
                text="Getting start"
                onPress={() => {}}
                type='button'
            />
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
})