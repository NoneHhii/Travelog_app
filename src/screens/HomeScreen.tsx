import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  StyleSheet,
  View,
  FlatList,
  ImageBackground,
  PanResponder,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ButtonComponent } from "../components/ButtonComponent";
import { TextComponent } from "../components/TextComponent";
import { MenuComponent } from "../components/MenuComponent";
import { colors } from "../constants/colors";
import { TravelItem } from "../components/TravelItem";
import { Slider } from "../components/Slider";
import { getAllTravel } from "../api/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StaticParamList } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import ChatbotIcon from "../components/ChatbotIcon";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = 70;
export interface Itinerary {
  day: number;
  details: string;
  title: string;
}

export default interface travel {
  id: string;
  departurePoint: string;
  destinationID: string;
  images: string[];
  description: string;
  itinerary: Itinerary[];
  price: number;
  title: string;
  averageRating: number;
  reviewCount: number;
}
type Stack = NativeStackScreenProps<StaticParamList, "Home">;

export const HomeScreen: React.FC<Stack> = ({ navigation }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const hasMoved = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        hasMoved.current = false;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          hasMoved.current = true;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(evt, gestureState);
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();

        if (!hasMoved.current) {
          navigation.navigate("Chatbot" as never);
          return;
        }

        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        const containerStartX = SCREEN_WIDTH - 30 - BUTTON_SIZE;
        const containerStartY = SCREEN_HEIGHT - 30 - BUTTON_SIZE;

        const minX = -containerStartX;
        const maxX = SCREEN_WIDTH - containerStartX - BUTTON_SIZE;
        const minY = -containerStartY;
        const maxY = SCREEN_HEIGHT - containerStartY - BUTTON_SIZE;

        const clampedX = Math.max(minX, Math.min(maxX, currentX));
        const clampedY = Math.max(minY, Math.min(maxY, currentY));

        // Reset về vị trí mới nếu bị giới hạn
        if (clampedX !== currentX || clampedY !== currentY) {
          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;
  const [travels, setTravels] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getAllTravel();
      setTravels(data);
    })();
  }, []);

  const handleDetail = (travel: travel) => {
    navigation.navigate("TravelDetail", { travel });
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <LinearGradient
          colors={["#0099FF", "#0464B6"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
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
                bgColor="transparent"
              />
              <MenuComponent
                title="Car Rental"
                url={require("../../assets/car-rental.png")}
                bgColor="transparent"
              />
              <MenuComponent
                title="Flight Status"
                url={require("../../assets/flight-status.png")}
                bgColor="transparent"
                size={30}
              />
            </View>
          </View>

          {/* space */}
          <View
            style={{ width: "100%", height: 10, backgroundColor: colors.white }}
          ></View>
          {/* coupon */}
          <ImageBackground
            source={require("../../assets/bg1.png")}
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <View style={[styles.row, { marginVertical: 10, marginLeft: 10 }]}>
              <Image source={require("../../assets/Offer.png")} />
              <TextComponent
                text="New User Special Treats"
                size={18}
                color={colors.white}
                fontWeight={"400"}
                styles={{ marginLeft: 10 }}
              />
            </View>

            <View style={[styles.listCP, { zIndex: 2 }]}>
              <View style={{ justifyContent: "flex-start", marginBottom: 20 }}>
                <TextComponent
                  text="Up to 8% OFF Coupon & Earn Points!"
                  fontWeight={"bold"}
                />
                <TextComponent
                  text="Save a total of up to 690.000 VND"
                  fontWeight={"bold"}
                />
              </View>
              <View
                style={{
                  width: "100%",
                  borderStyle: "dashed",
                  borderTopWidth: 2,
                  borderColor: colors.grey_text,
                }}
              >
                <ButtonComponent
                  type="button"
                  text="Claim now"
                  textColor={colors.blue_splash}
                  onPress={() => {}}
                  width={"100%"}
                  height={45}
                  textFont={5}
                  backgroundColor={colors.light_Blue}
                />
              </View>
            </View>

            <Image
              source={require("../../assets/dollar.png")}
              style={{
                position: "absolute",
                top: -10,
                right: 80,
                width: 32,
                height: 32,
                resizeMode: "contain",
              }}
            />

            <Image
              source={require("../../assets/dollar.png")}
              style={{
                position: "absolute",
                top: 60,
                left: 5,
                width: 32,
                height: 32,
                resizeMode: "contain",
                zIndex: 1,
              }}
            />

            <Image
              source={require("../../assets/dollar.png")}
              style={{
                position: "absolute",
                top: 150,
                right: 10,
                width: 32,
                height: 32,
                resizeMode: "contain",
                zIndex: 2,
              }}
            />
          </ImageBackground>

          {/* Space */}
          <View
            style={{
              width: "100%",
              height: 10,
              backgroundColor: colors.white,
              marginTop: 15,
            }}
          ></View>

          <ImageBackground
            source={require("../../assets/backImgRed.png")}
            resizeMode="cover"
          >
            <Slider
              travels={travels}
              RadiusTop={15}
              RadiusBottom={15}
              handleDetail={handleDetail}
            />
          </ImageBackground>
        </LinearGradient>
      </ScrollView>
      {/* Chat bot - placed outside ScrollView to avoid being blocked */}
      <View style={styles.floatingButtonContainer}>
        <Animated.View
          style={[
            styles.floatingButton,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <ChatbotIcon width={40} height={40} color="#fff" />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  listCP: {
    backgroundColor: colors.white,
    width: "90%",
    // alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 10,
  },
  floatingButton: {
    width: 70,
    height: 70,
    backgroundColor: "#007AFF",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#007AFF",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
});
