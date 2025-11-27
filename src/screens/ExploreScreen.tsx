import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  Pressable,
  Share,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode, VideoReadyForDisplayEvent, AVPlaybackStatus } from "expo-av";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { db } from "../firebase/firebase";

// --- CẤU HÌNH KÍCH THƯỚC ---
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const BOTTOM_TAB_HEIGHT = 50;
const VIDEO_HEIGHT = WINDOW_HEIGHT - BOTTOM_TAB_HEIGHT;

interface ExploreItem {
  id: string;
  tourID: string | null;
  videoLink: string;
  title: string;
  description: string;
  likes: number;
  status: boolean;
}

// --- HÀM TIỆN ÍCH ---
const getOptimizedVideoUrl = (originalUrl: string) => {
  if (!originalUrl) return "";
  if (originalUrl.includes("cloudinary.com")) {
    const uploadIndex = originalUrl.indexOf("/upload/");
    if (uploadIndex !== -1 && !originalUrl.includes("f_mp4")) {
      const part1 = originalUrl.slice(0, uploadIndex + 8);
      const part2 = originalUrl.slice(uploadIndex + 8);
      return part1 + "f_mp4,w_720,q_auto/" + part2;
    }
  }
  return originalUrl;
};

const getThumbnailUrl = (videoUrl: string) => {
  if (!videoUrl) return "https://via.placeholder.com/400x800.png?text=No+Video";
  if (videoUrl.includes("cloudinary.com")) {
    if (videoUrl.includes("f_mp4")) {
      return videoUrl.replace("f_mp4", "f_jpg,so_1");
    }
    const uploadIndex = videoUrl.indexOf("/upload/");
    if (uploadIndex !== -1) {
      const part1 = videoUrl.slice(0, uploadIndex + 8);
      const part2 = videoUrl.slice(uploadIndex + 8);
      return part1 + "f_jpg,so_1,q_auto/" + part2;
    }
  }
  return videoUrl;
};

const formatTime = (millis: number | null | undefined) => {
  if (millis === null || millis === undefined || isNaN(millis)) return "00:00";
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// --- COMPONENT CON: RENDER VIDEO ITEM ---
const RenderVideoItem = memo(
  ({ item, index, isActive }: { item: ExploreItem; index: number; isActive: boolean }) => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const videoRef = useRef<Video>(null);

    // State
    const [currentPosition, setCurrentPosition] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isPausedByUser, setIsPausedByUser] = useState(false);
    const [videoResizeMode, setVideoResizeMode] = useState<ResizeMode>(ResizeMode.COVER);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes);
    const [shouldMountVideo, setShouldMountVideo] = useState(false);

    // Effect
    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (isActive) {
        timer = setTimeout(() => {
          setShouldMountVideo(true);
        }, 250);
      } else {
        setShouldMountVideo(false);
        setCurrentPosition(0);
        setIsPausedByUser(false);
        setIsExpanded(false); // Reset trạng thái mở rộng khi lướt qua video khác
      }
      return () => { if (timer) clearTimeout(timer); };
    }, [isActive]);

    // Handlers
    const handleToggleLike = async () => {
      const exploreRef = doc(db, "explores", item.id);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
        try { await updateDoc(exploreRef, { likes: increment(-1) }); } catch (e) { }
      } else {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        try { await updateDoc(exploreRef, { likes: increment(1) }); } catch (e) { }
      }
    };

    const handleShare = async () => {
      try {
        await Share.share({
          message: `${item.title}\nXem ngay tại Travelog: https://travelog.app/explore/${item.id}`,
          url: `https://travelog.app/explore/${item.id}`,
          title: "Travelog Explore",
        });
      } catch (error: any) { Alert.alert(error.message); }
    };

    const handleGoToTourDetail = () => {
      if (item.tourID) {
        setIsPausedByUser(true);
        navigation.navigate("TravelDetail", { id: item.tourID });
      }
    };

    const togglePlayPause = () => setIsPausedByUser(!isPausedByUser);

    const onLoad = (status: AVPlaybackStatus) => {
      if (status.isLoaded && status.durationMillis) setVideoDuration(status.durationMillis);
    };

    const onReadyForDisplay = (event: VideoReadyForDisplayEvent) => {
      const { width, height } = event.naturalSize;
      setVideoResizeMode(width > height ? ResizeMode.CONTAIN : ResizeMode.COVER);
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setCurrentPosition(status.positionMillis);
        if (status.durationMillis && videoDuration === 0) setVideoDuration(status.durationMillis);
      }
    };

    const handleSeek = async (event: any) => {
      if (videoDuration > 0) {
        const { locationX } = event.nativeEvent;
        const percentage = Math.max(0, Math.min(1, locationX / WINDOW_WIDTH));
        const seekTime = percentage * videoDuration;
        setCurrentPosition(seekTime);
        await videoRef.current?.setPositionAsync(seekTime, { toleranceMillisBefore: 100, toleranceMillisAfter: 100 });
      }
    };

    const optimizedSource = getOptimizedVideoUrl(item.videoLink);
    const thumbnailUrl = getThumbnailUrl(item.videoLink);
    const progressPercent = videoDuration > 0 ? (currentPosition / videoDuration) * 100 : 0;

    return (
      <View style={styles.videoContainer}>
        <Pressable onPress={togglePlayPause} style={styles.videoInnerContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={[styles.video, { zIndex: 0 }]}
            resizeMode="cover"
          />
          {shouldMountVideo ? (
            <Video
              ref={videoRef}
              style={[styles.video, { zIndex: 1 }]}
              source={{ uri: optimizedSource }}
              useNativeControls={false}
              resizeMode={videoResizeMode}
              isLooping
              shouldPlay={!isPausedByUser && isFocused}
              onLoad={onLoad}
              onReadyForDisplay={onReadyForDisplay}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              progressUpdateIntervalMillis={250}
              posterSource={{ uri: thumbnailUrl }}
              usePoster={false}
            />
          ) : (
            <View style={styles.loadingPlaceholder}>
              <Ionicons name="play-circle-outline" size={50} color="rgba(255,255,255,0.3)" />
            </View>
          )}

          {shouldMountVideo && (isPausedByUser || !isFocused) && (
            <View style={styles.playIconContainer}>
              <Ionicons name="play" size={60} color="rgba(255,255,255,0.6)" />
            </View>
          )}
        </Pressable>

        {/* --- UI OVERLAY --- */}
        <View style={styles.overlayUI}>
          <View style={styles.rightActionContainer}>
            <TouchableOpacity style={styles.actionItem} onPress={handleToggleLike}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={35} color={isLiked ? "red" : "white"} />
              <Text style={styles.actionText}>{likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
              <Ionicons name="share-social" size={32} color="white" />
              <Text style={styles.actionText}>Chia sẻ</Text>
            </TouchableOpacity>
            {item.tourID && (
              <TouchableOpacity style={styles.bookTourButton} onPress={handleGoToTourDetail}>
                <View style={styles.bookTourIconInner}>
                  <Ionicons name="airplane" size={20} color="#fff" />
                </View>
                <View style={styles.plusBadge}><Ionicons name="add" size={10} color="white" /></View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.bottomInfoContainer}>
            <Text style={styles.userName}>@travelog_explore</Text>
            <Text style={styles.videoTitle}>{item.title}</Text>
            
            {/* --- THAY ĐỔI Ở ĐÂY: Bấm vào text để mở rộng --- */}
            <TouchableOpacity 
              activeOpacity={1} // Giữ nguyên độ đậm nhạt khi bấm vào text
              onPress={() => {
                if (item.description.length > 80) {
                  setIsExpanded(!isExpanded);
                }
              }}
            >
              <Text style={styles.videoDesc} numberOfLines={isExpanded ? undefined : 2}>
                {item.description}
                {/* Nếu dài hơn 80 kí tự và đang đóng, hiển thị thêm chữ ... Xem thêm đậm */}
                {!isExpanded && item.description.length > 80 && (
                   <Text style={{ fontWeight: 'bold' }}> ... Xem thêm</Text>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SEEK BAR --- */}
        {shouldMountVideo && (
          <View style={styles.seekBarContainer}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {formatTime(currentPosition)} / {formatTime(videoDuration)}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handleSeek}
              style={styles.progressBarClickArea}
              hitSlop={{ top: 20, bottom: 20, left: 0, right: 0 }}
            >
              <View pointerEvents="none" style={styles.progressBarBackgroundLine} />
              <View pointerEvents="none" style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              {videoDuration > 0 && (
                <View pointerEvents="none" style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
);

// --- MAIN SCREEN ---
export const ExploreScreen: React.FC = ({ navigation }: any) => {
  const [videos, setVideos] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    const fetchExplores = async () => {
      try {
        const q = query(collection(db, "explores"), where("status", "==", true));
        const querySnapshot = await getDocs(q);
        const fetchedVideos: ExploreItem[] = [];
        querySnapshot.forEach((doc) => {
          fetchedVideos.push({ id: doc.id, ...doc.data() } as ExploreItem);
        });
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Lỗi tải video:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExplores();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  if (loading) return <ActivityIndicator size="large" color="white" style={styles.loadingContainer} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <RenderVideoItem
            item={item}
            index={index}
            isActive={index === activeVideoIndex}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={VIDEO_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({ length: VIDEO_HEIGHT, offset: VIDEO_HEIGHT * index, index })}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={100}
      />
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  loadingContainer: { flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" },
  videoContainer: { width: WINDOW_WIDTH, height: VIDEO_HEIGHT, backgroundColor: "black", position: "relative" },
  videoInnerContainer: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  video: { width: "100%", height: "100%", position: "absolute" },
  loadingPlaceholder: { position: 'absolute', zIndex: 2, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  playIconContainer: { position: "absolute", alignSelf: "center", top: "45%", zIndex: 3 },

  // Overlay UI
  overlayUI: {
    position: "absolute",
    bottom: 45,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingBottom: 10,
    zIndex: 2
  },
  bottomInfoContainer: { width: "100%", justifyContent: "flex-end", paddingRight: 80, marginBottom: 10 },
  userName: { color: "white", fontWeight: "bold", fontSize: 16, marginBottom: 8, textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  videoTitle: { color: "white", fontSize: 15, fontWeight: "600", marginBottom: 8, lineHeight: 22, textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  
  // Style text mô tả
  videoDesc: { 
    color: "#e0e0e0", 
    fontSize: 14, 
    lineHeight: 20, 
    textShadowColor: "rgba(0, 0, 0, 0.75)", 
    textShadowOffset: { width: -1, height: 1 }, 
    textShadowRadius: 10, 
    marginBottom: 5 
  },
  
  // Loại bỏ style seeMoreText cũ vì giờ dùng inline
  rightActionContainer: { position: "absolute", right: 10, bottom: 40, alignItems: "center", zIndex: 2 },
  actionItem: { alignItems: "center", marginBottom: 20 },
  actionText: { color: "white", marginTop: 5, fontSize: 12, fontWeight: "600", textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  bookTourButton: { marginTop: 10, alignItems: "center", justifyContent: "center" },
  bookTourIconInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#222", borderWidth: 2, borderColor: "white", justifyContent: "center", alignItems: "center" },
  plusBadge: { position: "absolute", bottom: -8, backgroundColor: "#FF4500", width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },

  // Seek Bar
  seekBarContainer: { position: 'absolute', bottom: 35, left: 0, width: '100%', height: 40, justifyContent: 'flex-end', zIndex: 999, paddingBottom: 10 },
  timerContainer: { position: 'absolute', right: 15, bottom: 25, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  timerText: { color: 'white', fontSize: 12, fontWeight: '600', textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  progressBarClickArea: { width: '100%', height: 30, justifyContent: 'center', backgroundColor: 'transparent' },
  progressBarBackgroundLine: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 },
  progressBarFill: { height: 3, backgroundColor: '#FF4500', position: 'absolute', left: 0, zIndex: 2 },
  progressThumb: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF4500', position: 'absolute', marginLeft: -7, zIndex: 3, transform: [{ scale: 1.2 }] }
});