import React from "react"
import { Image, View } from "react-native";
import { colors } from "../constants/colors";
import travel from "../screens/HomeScreen";
import { TextComponent } from "./TextComponent";


interface travelProps {
    travel: travel,
    sale?: number,
    size?: number,
    RadiusTop?: number,
    RadiusBottom?: number,
}

export const TravelItem: React.FC<travelProps> = ({
    travel,
    sale,
    size=240,
    RadiusTop = 0,
    RadiusBottom = 0,
}) => {
    return (
        <View style={{
            marginVertical: 10,
        }}>
            <View style={{
                width: size,
                borderTopLeftRadius: RadiusTop,
                borderTopRightRadius: RadiusTop,
                
                overflow: "hidden",
            }}>
                <Image 
                    source={travel.img} 
                    style={{
                        width: size,
                        height: size,
                        resizeMode: 'cover',
                        
                        
                    }}
                />
            </View>
            <View style={{
                backgroundColor: colors.white,
                padding: 10,
                // alignItems: 'center',
                borderBottomLeftRadius: RadiusBottom,
                borderBottomRightRadius: RadiusBottom,
                overflow: "hidden",
                width: size,
                minHeight: 120,
                justifyContent: 'space-between',
            }}>
                <TextComponent
                    text={travel.title}
                    fontWeight='bold'
                    size={18}
                />
                <View>
                    <TextComponent
                        text={travel.date}
                        styles={{
                            textAlign: 'left'
                        }}
                    />
                    <TextComponent
                        text={`${travel.price.toString()} VND`}
                        fontWeight='bold'
                        color={colors.red}
                        size={16}
                    />
                </View>
            </View>
        </View>
    )
}