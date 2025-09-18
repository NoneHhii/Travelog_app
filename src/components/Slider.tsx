import React from "react"
import travel from "../screens/HomeScreen";
import {View, FlatList, StyleSheet, ViewToken} from 'react-native'
import {TravelItem} from '../components/TravelItem'
import { useRef } from "react";


interface travelProps {
    travels: travel[],
    sale?: number,
    size?: number,
    RadiusTop?: number,
    RadiusBottom?: number,
}



export const Slider: React.FC<travelProps> = ({
    travels,
    sale,
    size=240,
    RadiusTop = 0,
    RadiusBottom = 0,
}) => {

    const renderItem = ({item}: {item: travel}) => (
        <View
            key={item.id}
            style={[styles.row, {marginHorizontal: 15}]}
        >
            <TravelItem
                travel={item}
                RadiusTop={RadiusTop}
                RadiusBottom={RadiusBottom}
            />
        </View>
    ) 

    

    return (
        <View style={[styles.row, {marginTop: 30}]}>
            <FlatList
                data={travels}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                // viewabilityConfigCallbackPairs
                
            />
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        // width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
    },
})