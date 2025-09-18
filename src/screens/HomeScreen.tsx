import React from "react"
import { Image, StyleSheet, View, FlatList, ImageBackground, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ButtonComponent } from "../components/ButtonComponent"
import { TextComponent } from "../components/TextComponent"
import { MenuComponent } from "../components/MenuComponent"
import { colors } from "../constants/colors"
import { TravelItem } from "../components/TravelItem"
import { Slider } from "../components/Slider"

export default interface travel {
    id: number,
    title: string,
    date: string,
    price: number,
    img: any,

}

const travels : travel[] = [
    {
        id: 1, 
        title: 'Ho Chi Minh City - Hanoi', 
        date: '19 Dec 2025', 
        price: 896600, 
        img: require('../../assets/travelImg.jpg')
    },
    {
        id: 2, 
        title: 'Hanoi - Ho Chi Minh City', 
        date: '19 Dec 2025', 
        price: 896600, 
        img: require('../../assets/travelImg.jpg')
    },
    {
        id: 3, 
        title: 'Ho Chi Minh City - Quang Ngai', 
        date: '19 Dec 2025', 
        price: 697000, 
        img: require('../../assets/travelImg.jpg')
    }

]

export const HomeScreen : React.FC = () => {

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#0099FF', '#0464B6']}
                start={{x: 0.5, y: 0}}
                end={{x:0.5, y:1}}
                style={styles.container}
            >
                {/* menu list */}
                <View style={styles.menuContain}>
                    <View style={styles.mainMenu}>
                        <MenuComponent
                            title="Flights"
                            url={require("../../assets/airplane.png")}
                            size={40}
                        />
                        <MenuComponent
                            title="Hotels"
                            url={require("../../assets/hotel.png")}
                            size={40}
                        />
                        <MenuComponent
                            title="Thinks to Do"
                            url={require("../../assets/think-to-do.png")}
                            size={40}
                        />
                        <MenuComponent
                            title="Bus & Shuttle"
                            url={require("../../assets/bus-shuttle.png")}
                            size={40}
                        />
                    </View>
                    <View style={styles.mainMenu}>
                        <MenuComponent
                            title="Cruises"
                            url={require("../../assets/cruise-ship.png")}
                            bgColor='transparent'
                        />
                        <MenuComponent
                            title="Car Rental"
                            url={require("../../assets/car-rental.png")}
                            bgColor='transparent'
                        />
                        <MenuComponent
                            title="Flight Status"
                            url={require("../../assets/flight-status.png")}
                            bgColor='transparent'
                            size={30}
                        />
                    </View>
                </View>
                {/* space */}
                <View style={{width: "100%", height: 10, backgroundColor: colors.white}}>

                </View>
                {/* coupon */}
                <ImageBackground 
                    source={require('../../assets/bg1.png')} 
                    style={{
                        width: "100%", 
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                    }}
                >
                    <View style={[styles.row, {marginVertical: 10, marginLeft: 10}]}>
                        <Image source={require('../../assets/Offer.png')}/>
                        <TextComponent
                            text="New User Special Treats"
                            size={18}
                            color={colors.white}
                            fontWeight={"400"}
                            styles={{marginLeft: 10}}
                        />
                    </View>

                    <View style={[styles.listCP, {zIndex: 2}]}>
                        <View style={{justifyContent: "flex-start", marginBottom: 20}}>
                            <TextComponent
                                text="Up to 8% OFF Coupon & Earn Points!"
                                fontWeight={'bold'}
                            />
                            <TextComponent
                                text="Save a total of up to 690.000 VND"
                                fontWeight={'bold'}
                            />
                        </View>
                        <View 
                            style={{
                                width:"100%",
                                borderStyle: 'dashed',
                                borderTopWidth: 2,
                                borderColor: colors.grey_text
                            }}
                        >
                            <ButtonComponent
                                type="button"
                                text="Claim now"
                                textColor={colors.blue_splash}
                                onPress={() => {}} 
                                width= {'100%'}
                                height= {45}
                                textFont={5}
                                backgroundColor={colors.light_Blue}
                            />
                        </View>
                    </View>

                    <Image 
                        source={require('../../assets/dollar.png')}
                        style={{
                            position: 'absolute',
                            top: -10,
                            right: 80,
                            width: 32,
                            height: 32,
                            resizeMode: 'contain',
                        }}
                    />

                    <Image 
                        source={require('../../assets/dollar.png')}
                        style={{
                            position: 'absolute',
                            top: 60,
                            left: 5,
                            width: 32,
                            height: 32,
                            resizeMode: 'contain',
                            zIndex: 1,
                        }}
                    />

                    <Image 
                        source={require('../../assets/dollar.png')}
                        style={{
                            position: 'absolute',
                            top: 150,
                            right: 10,
                            width: 32,
                            height: 32,
                            resizeMode: 'contain',
                            zIndex: 2,
                        }}
                    />
                </ImageBackground>

                {/* Space */}
                <View style={{width: "100%", height: 10, backgroundColor: colors.white, marginTop: 15}}></View>

                <ImageBackground
                    source={require('../../assets/backImgRed.png')}
                    resizeMode='cover'
                >
                    <Slider
                        travels={travels}
                        RadiusTop={15}
                        RadiusBottom={15}
                    />
                </ImageBackground
                
                >

            </LinearGradient>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
    },

    menuContain: {
        width: "95%",
        backgroundColor: "#fff",
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        // paddingHorizontal: 10,
        borderRadius: 20,
        marginBottom: 20,
    },

    mainMenu: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginVertical: 10,
    },

    row: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
    },

    listCP: {
        backgroundColor: colors.white,
        width: "90%",
        // alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 10,
        borderRadius: 15,
    }
})