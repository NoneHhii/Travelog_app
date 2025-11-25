import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import * as Progress from 'react-native-progress'
import { JumpingTransition } from "react-native-reanimated";
import { UserDB } from "./Register";
import { CheckInDaily, updatePointReward } from "../api/apiClient";
import moment from "moment";

type Stack = NativeStackScreenProps<RootStackParamList, 'RewardZone'>;

interface checkpoint {
    id: number,
    date: number,
    checked: boolean,
    point: number,
    today: boolean,
}

const getCheckpoints = (user: UserDB) => {
    const current = new Date();
    const currentDay = current.getDay() === 0 ? 7 : current.getDay()
    const currentDate = current.getDate()
    const startDateOfMonth = currentDate - (currentDay- 1);

    const checkpoints: checkpoint[] = [];

    let date = startDateOfMonth - 1;

    const lastChecked = user.lastCheckInDate
    const isChecked = lastChecked && moment(lastChecked).isSame(moment(), 'day');
    let dayIndex = 1;

    for(let i = 0; i < 7; i ++) {
        date+=1;

        dayIndex = i + 1;

        // if(isChecked) dayIndex = user.checkinStreak;

        checkpoints.push({
            id: i + 1, 
            date: date, 
            checked: i >= user.checkinStreak ? false : true,
            point: i === 6 ? 150 : 100,
            today: dayIndex === user.checkinStreak ? true : false
        });
    }

    return checkpoints;
}


// CheckpointComponent
interface CheckProps {
    date: checkpoint;
}

const currentD = new Date();

const Checkpoint:React.FC<CheckProps> = ({date}) => {
    // console.log(date);
    
    const url = date.checked ? require('../../assets/check-mark.png') : require('../../assets/dollar.png');

    return (
        <View 
            style={[
                {
                    backgroundColor: date.id === 7 ? 'gold' : (date.checked ? colors.white : '#E0E0E0'), 
                    padding: 4, 
                    paddingHorizontal: 7,
                    alignItems: 'center',
                    borderRadius: 8,
                },
                date.today && styles.borderCheck,
            ]}
        >
            <Text style={{color: colors.red, marginVertical: 6,}}>{date.point}</Text>
            <Image source={url} style={styles.img}/>
        </View>
    )
}


// Mission Layout
interface MissProp {
    handleNaviMission: (string) => void,
    user: UserDB,
    refreshUser: () => void,
}

const MissionLayout:React.FC<MissProp> = ({handleNaviMission, user, refreshUser}) => {
    const dates = getCheckpoints(user);
    const [checked, setChecked] = useState(false);
    const checkDaily = user.lastCheckInDate?.getDate();
    const currentDay = currentD.getDay() === 0 ? 6 : currentD.getDay() - 1
    // console.log(checkDaily);
    
    
    useEffect(() => {
        if(checkDaily === currentD.getDate()) {
            setChecked(true);
            dates[currentDay].checked = true;
            // console.log(dates[currentDay]);
            
        }
    }, [checked, currentD, user]);

    const checkedHandle = async(check: checkpoint) => {
        try {
            // await updatePointReward(user.uid, check.point);
            // check.checked = true;
            // handlePoint(check.point);
            // setChecked(true);
            // console.log("Point:", check);
            
            
            await CheckInDaily(user.uid, check.point);
            check.checked = true;
            setChecked(true);
            refreshUser();
            
            // if(user.lastCheckInDate.toDateString)
        } catch (error) {
            console.log(error);
            
        }

    }

    return (
        // <View> 
            <View style={[styles.missContain]}>
                {/* title */}
                <View style={styles.row}>
                    <Text style={styles.titleMiss}>Hoàn thành nhiệm vụ hôm nay để nhận
                        <Text style={{color: 'gold'}}> 600 điểm</Text>
                    </Text>
                    <Image source={require('../../assets/dailyReward.png')}/>
                </View>
                {/* Mission daily*/}
                <View style={styles.missView}>
                    <View style={styles.row}>
                        <Text style={{
                            width: '70%',
                        }}>Tìm kiếm tour 10 lần mỗi ngày để nhận 400 điểm</Text>
                        <TouchableOpacity 
                            style={styles.btnMiss}
                            onPress={() => handleNaviMission('Search')}
                        >
                            <Text style={{color: colors.white}}>Tìm kiếm</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressContain}>
                        <Progress.Bar
                            progress={0.7}
                            width={200}
                            height={2} 
                            color={colors.red}
                            unfilledColor="#E0E0E0" 
                            borderWidth={0} 
                        />

                        {/* Points */}
                        <View style={styles.firstPoint}>
                            <Image source={require('../../assets/point.png')} style={styles.imgPoint}/>
                            <Text
                                style={{
                                    fontSize: 10,
                                    textAlign: 'center',
                                    color: colors.grey_text
                                }}
                            >
                                5 lần
                            </Text>
                        </View>

                        <View style={styles.lasttPoint}>
                            <Image source={require('../../assets/point.png')} style={styles.imgPoint}/>
                            <Text
                                style={{
                                    fontSize: 10,
                                    textAlign: 'center',
                                    color: colors.grey_text
                                }}
                            >
                                10 lần
                            </Text>
                        </View>
                    </View>
                    {/* guide */}
                    <View>
                        <Text style={{color: colors.grey_text, fontSize: 13}}>
                            Nhận 40 điểm bằng cách nhập truy vấn vào thanh tìm kiếm hoặc nhấn vào các tìm kiếm đề xuất, hagtag.
                        </Text>
                    </View>
                    <View style={styles.line}/>
                    <View>
                        <Text>Điểm danh nhận xu</Text>
                        <View style={[styles.row, {justifyContent: 'space-between'}]}>
                            {dates.map(date => (
                                <View key={date.id}>
                                    <Checkpoint date={date}/>
                                    <Text 
                                        style={{
                                            textAlign: 'center',
                                            color: date.today ? colors.red : colors.grey_text,
                                            fontSize: 11,
                                        }}
                                    >
                                        {date.today ? "Hôm nay" : `Ngày ${date.id}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.red,
                                width: '80%',
                                margin: 'auto',
                                paddingVertical: 4,
                                marginVertical: 8,
                                borderRadius: 10
                            }}
                            disabled={checked}
                            onPress={() => checkedHandle(dates[user.checkinStreak])}
                        >
                            <Text style={{textAlign: 'center', color: colors.white}}>{checked ? "Đã nhận hôm nay" : "Điểm danh ngay"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            
        // </View>
    )
}


// Reward Layout
const RewardLayout:React.FC = () => {
    return (
        <View>
            <Text>Reward Layout</Text>
        </View>
    )
}

export const RewardZone:React.FC<Stack> = ({navigation}) => {
    const {user, refreshUser} = useAuth();
    const [tab, setTab] = useState(1);    
    const [point, setPoint] = useState(user.pointReward);

    const tabIndicator = useRef(new Animated.Value(0)).current;

    const [tabWidth, setTabWidth] = useState(0);

    useEffect(() => {
        if(tabWidth > 0) {
            const targetWidth = tab === 1 ? 0 : tabWidth / 2;
            
            Animated.timing(tabIndicator, {
                toValue: targetWidth,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [tab, tabWidth]);


    const onLayout = (event: any) => {
        setTabWidth(event.nativeEvent.layout.width);
    };

    const handleNaviMission = (string) => {
        navigation.navigate(string);
    }

    const handlePoint = (point: number) => setPoint(point);

    return (
        <ScrollView style={{flex: 1,}}>
            <View style={styles.container}>
                <View style={styles.headContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={18} style={{marginLeft: 4}}/>
                    </TouchableOpacity>
                    <Text style={styles.titleHead}>Khu vực nhận thưởng</Text>
                    
                </View>
                <View style={[styles.row, styles.zone, {justifyContent: 'space-around'}]}>
                    <TouchableOpacity style={styles.row}>
                        <Image source={require('../../assets/dollar.png')} style={styles.img}/>
                        <Text style={{marginLeft: 4}}><Text style={styles.txt}>{point}</Text> điểm</Text>
                    </TouchableOpacity>
                    <View style={styles.divider}/>
                    <TouchableOpacity 
                        style={styles.row}
                        onPress={() => navigation.navigate("MyCoupon")}
                    >
                        <Image source={require('../../assets/coupons.png')} style={styles.img}/>
                        <Text style={styles.txt}>Xem phần thưởng</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.row, {marginVertical: 12, paddingHorizontal: 6,}]}>
                    <View style={styles.tabWrapper} onLayout={onLayout}>
                        <TouchableOpacity 
                            style={[styles.tabBtn]}
                            onPress={() => setTab(1)}
                        >
                            <Text style={[tab === 1 ? styles.tabActiveTxt : styles.tabTxt]}>Nhiệm vụ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tabBtn]}
                            onPress={() => setTab(2)}
                        >
                            <Text style={[tab === 2 ? styles.tabActiveTxt : styles.tabTxt]}>Nhận thưởng</Text>
                        </TouchableOpacity>

                        {tabWidth > 0 && (
                            <Animated.View
                                style={[
                                    styles.tabIndicator,
                                    {
                                        width: tabWidth / 2,
                                        transform: [{translateX: tabIndicator}]
                                    }
                                ]}
                            />
                        )}
                    </View>
                </View>

                {tab === 1 ? 
                    <MissionLayout handleNaviMission={handleNaviMission} user={user} refreshUser={refreshUser}/> : 
                    <RewardLayout/>
                }
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.white
    },

    headContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: 8,
        borderBottomWidth: 1,
        paddingBottom: 6,
        borderBottomColor: colors.light,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    titleHead: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
    },

    zone: {
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 10,
    },

    img: {
        width: 24,
        height: 24,
    },

    divider: {
        borderRightColor: colors.light,
        borderRightWidth: 1,
        height: '100%'
    },

    txt: {
        color: colors.blue_splash, 
        fontWeight: 'bold',
        marginLeft: 4,
    },

    tabWrapper: {
        width: '100%',
        flexDirection: 'row',
        position: 'relative',
    },

    tabBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8
    },

    tabIndicator: {
        height: 2,
        backgroundColor: colors.blue_splash,
        position: 'absolute',
        bottom: 0,
        left: 0,
    },

    tabTxt: {
        fontWeight: 'bold',
        color: colors.grey_text,
        fontSize: 16,
    },

    tabActiveTxt: {
        fontWeight: 'bold',
        color: colors.blue_splash,
        fontSize: 16,
    },

    missContain: {
        backgroundColor: colors.blue_splash,
        width: '90%',
        flex: 1,
        padding: 8,
        borderRadius: 10,
    },

    titleMiss: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 24,
        width: '50%'
    },

    missView: {
        backgroundColor: colors.white,
        flex: 1,
        borderRadius: 10,
        padding: 8,
    },

    missText: {
        fontWeight: '600',
        fontSize: 16,
    },

    btnMiss: {
        backgroundColor: colors.red,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },

    progressContain: {
        width: 200,
        height: 2,
        position: 'relative',
        marginVertical: 30
    },

    firstPoint: {
        position: 'absolute',
        zIndex: 2,
        left: '40%',
        top: -8
    },

    lasttPoint: {
        position: 'absolute',
        zIndex: 2,
        right: 0,
        top: -8
    },

    imgPoint: {
        width: 16,
        height: 16,
    },

    line: {
        margin: 'auto',
        borderColor: colors.light,
        borderTopWidth: 1,
        width: '100%',
        height: 1,
        marginVertical: 6,
    },

    borderCheck: {
        borderWidth: 1,
        borderColor: colors.red,
    }
})