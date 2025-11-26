import { StackNavigationProp } from "@react-navigation/stack";
import React, { createRef, useEffect, useState, useRef } from "react";
import {Dimensions, FlatList, Image, ScrollView, StyleSheet, View, ViewToken} from 'react-native';
import { colors } from "../constants/colors";
import { RootStackParamList } from "../navigation/RootNavigator";
import Animated, {
    useAnimatedRef, 
    useSharedValue, 
    useDerivedValue, 
    scrollTo,
    useAnimatedScrollHandler,
    withTiming,
    useAnimatedStyle,
    runOnJS,
} from 'react-native-reanimated';
import { TextComponent } from "../components/TextComponent";
import { ButtonComponent } from "../components/ButtonComponent";
import { useNavigation } from "@react-navigation/native";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { makeRedirectUri } from "expo-auth-session";
import { LinearGradient } from 'expo-linear-gradient';

type IntroPageNavigationProp = StackNavigationProp<RootStackParamList, 'Intro'>;

WebBrowser.maybeCompleteAuthSession();

const IntroData = [
    {id: 1, img: require('../../assets/travelImg.jpg'),},
    {id: 2, img: require('../../assets/backImgRed.png'),},
    {id: 3, img: require('../../assets/travelImg.jpg'),},
]

const {width, height} = Dimensions.get('screen');

const WidthPagination = Math.floor((width - 50) / 3);

const renderImg = ({item}) => (
    <View
        key={item.id}
        style={styles.container}
    >
        <Image source={item.img} style={styles.img}/>
    </View>
)



export const IntroPage: React.FC = () => {
    const flatList = useAnimatedRef<Animated.FlatList<any>>();
    const [CurrentPage, setCurrentPage] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const intervalTime = useRef<number>(0);
    const offset = useSharedValue(0);
    const scrollX = useSharedValue(0);
    const process = useSharedValue(0);
    const navigation = useNavigation<IntroPageNavigationProp>();
    let idx = 0;

    const redirectUri = AuthSession.makeRedirectUri({
        
    })

    // set up ggl sign in
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: '622670897999-h8hkntn6n4uali9l4nu8bs0ih3hr67j5.apps.googleusercontent.com',
        redirectUri: redirectUri
    });

    // console.log('Redirect URI Cần Đăng Ký:', request?.redirectUri);

    useEffect(() => {
        if(response?.type === 'success') {
            const {id_token} = response.params;

            const credential = GoogleAuthProvider.credential(id_token);

            signInWithCredential(auth, credential)
            .then((userCredential) => {
                console.log("Log in success with ", userCredential.user.email);
                
            })
            .catch((err) => {
                console.error("Login fail ", err);
                
            }) 
        }
    }, [response]);

    const onScrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x;
            
        },

        onMomentumEnd: (e) => {
            offset.value = e.contentOffset.x;
        },
    });

    useEffect(() => {
        if(isAutoPlay) {
            process.value = 0;
            process.value = withTiming(1, {duration: 3000}, (finnished) => {

            });

            intervalTime.current = setInterval(() => {
                if(CurrentPage < IntroData.length - 1) {
                    offset.value = offset.value + width;
                    // process.value = 0;
                    // process.value = withTiming(1, {duration: 3000});
                } else {
                    clearInterval(intervalTime.current);
                    process.value = 1;
                }
            }, 3000)
        }else {
            clearInterval(intervalTime.current);
            setCurrentPage(Math.round(scrollX.value / width));
        }

        return () => clearInterval(intervalTime.current);
    }, [isAutoPlay, offset, width, CurrentPage]);

    useDerivedValue(() => {
        scrollTo(flatList, offset.value, 0, true);
    });

    const onViewableItemsChanged = ({viewableItems}: {viewableItems: ViewToken[]}) => {
        if(viewableItems[0].index !== undefined && viewableItems[0].index !== null) {
            setCurrentPage(viewableItems[0].index % IntroData.length);
        }
    }

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50
    }

    const viewabilityConfigCallbackPairs = useRef([
        {viewabilityConfig, onViewableItemsChanged},
    ])

    return (
        <LinearGradient
            colors={['#e4f2ff', '#fefeff', '#e7fbff']}
            style={styles.gradientWrapper}
        >
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
            <Animated.FlatList
                data={IntroData}
                renderItem={renderImg}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScrollHandler}
                ref={flatList}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                onScrollBeginDrag={() => {
                    setIsAutoPlay(false);
                }}
                onScrollEndDrag={() => {
                    setIsAutoPlay(true);
                }}
            />
            <View style={styles.pagiContain}>
                <View 
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                    }}
                >
                    {IntroData.map((_, index) => {

                        const animatedStyle = useAnimatedStyle(() => {
                            return {
                                width: CurrentPage === index ?
                                        WidthPagination * process.value :
                                        CurrentPage > index ?
                                            WidthPagination:
                                            0
                            };
                        });

                        return (
                            <View
                                key={index}
                                style={[styles.pagination, {
                                    
                                }]}
                            >
                                <Animated.View style={[styles.paginationActive, animatedStyle]}/>
                            </View>
                        )
                    })}
                </View>
            </View>
            <View style={styles.loginContain}>
                <TextComponent
                    text="Unlimited Offers"
                    fontWeight={'bold'}
                    size={20}
                    styles={{marginTop: 10}}
                />
                <View 
                    style={styles.btnContainer}
                    
                >
                    <Image
                        source={require('../../assets/google.png')}
                        style={{
                            width: 24,
                            height: 24,
                            marginRight: 10,
                        }}
                    />
                    <ButtonComponent
                        type="text"
                        text="Continue with Google"
                        textColor={colors.black}
                        onPress={() => {
                            // navigation.replace('Main')
                            promptAsync();
                        }}
                        width={'80%'}
                        backgroundColor={'transparent'}
                        height={50}
                        textFont= {'bold'}
                        textSize={16}
                        disable={!request}
                    />
                </View>
                <ButtonComponent
                    type="link"
                    text="Other options"
                    onPress={() => navigation.navigate('Login')}
                    
                />
            </View>
        </ScrollView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    gradientWrapper: {
        flex: 1
    },

    scrollView: {
        position: 'relative',
        marginBottom: 8
    },

    container: {
        alignItems: 'center',
        // gap: 20,
        // justifyContent: 'center',
        width: width,
    },

    img: {
        // resizeMode: 'contain',
        width: width,
        height: height*80/100,
    },

    pagiContain: {
        position: 'absolute',
        width: "100%",
        top: 10,
    },

    pagination: {
        width: WidthPagination,
        height: 5,
        backgroundColor: colors.white,
        borderRadius: 10,
        marginRight: 5,
        overflow: 'hidden',
    },

    paginationActive: {
        height: 5,
        backgroundColor: colors.blue,
        borderRadius: 10,
    },

    loginContain: {
        backgroundColor: 'rgba(255,255,255,0.95)', 
        minHeight: height*18/100,
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: -30,
        paddingVertical: 24,
        borderRadius: 24,
        shadowColor: '#0a3c8c',
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    btnContainer: {
        borderRadius: 18,
        width: '80%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
        backgroundColor: 'rgba(96,239,255,0.08)',
        borderColor: 'rgba(0,97,255,0.25)'
    }
})