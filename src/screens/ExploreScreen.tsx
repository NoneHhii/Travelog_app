import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Image, // Cần thêm Image
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
import { db } from "../firebase/firebase"; // Đảm bảo đường dẫn đúng
import { useNavigation } from "@react-navigation/native";

// --- CẤU HÌNH KÍCH THƯỚC ---
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
// Điều chỉnh chiều cao trừ đi Bottom Tab (nếu app có)
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

// --- HÀM TIỆN ÍCH 1: TỐI ƯU URL VIDEO ---
const getOptimizedVideoUrl = (originalUrl: string) => {
  if (!originalUrl) return "";
  if (originalUrl.includes("cloudinary.com")) {
    const uploadIndex = originalUrl.indexOf("/upload/");
    if (uploadIndex !== -1 && !originalUrl.includes("f_mp4")) {
      const part1 = originalUrl.slice(0, uploadIndex + 8); 
      const part2 = originalUrl.slice(uploadIndex + 8);
      // f_mp4: Ép về MP4, w_720: HD 720p, q_auto: Tối ưu dung lượng
      return part1 + "f_mp4,w_720,q_auto/" + part2;
    }
  }
  return originalUrl;
};

// --- HÀM TIỆN ÍCH 2: TẠO THUMBNAIL TỪ LINK VIDEO (QUAN TRỌNG CHO HIỆU NĂNG) ---
const getThumbnailUrl = (videoUrl: string) => {
  if (!videoUrl) return "https://via.placeholder.com/400x800.png?text=No+Video";
  
  // Hack link Cloudinary: đổi f_mp4 thành f_jpg và lấy giây thứ 1 (so_1)
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
  return videoUrl; // Fallback
};

// --- HÀM TIỆN ÍCH 3: FORMAT THỜI GIAN ---
const formatTime = (millis: number | null | undefined) => {
  if (millis === null || millis === undefined || isNaN(millis)) return "00:00";
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// --- COMPONENT CON: RENDER VIDEO ITEM ---
const RenderVideoItem = React.memo(
  ({ item, index, isActive }: { item: ExploreItem; index: number; isActive: boolean }) => {
    const navigation = useNavigation<any>();
    const videoRef = useRef<Video>(null);
    
    // State quản lý
    const [currentPosition, setCurrentPosition] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isPausedByUser, setIsPausedByUser] = useState(false);
    const [videoResizeMode, setVideoResizeMode] = useState<ResizeMode>(ResizeMode.COVER);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes);

    // State kiểm soát việc Mount Video (Chìa khóa tối ưu)
    const [shouldMountVideo, setShouldMountVideo] = useState(false);

    // Effect xử lý Logic Load/Unload thông minh
    useEffect(() => {
      let timer: NodeJS.Timeout;

      if (isActive) {
        // Nếu đang xem video này: Delay 250ms rồi mới load Video thật
        // Giúp lướt nhanh qua không bị khựng và không tốn data tải video thừa
        timer = setTimeout(() => {
          setShouldMountVideo(true);
          setIsPausedByUser(false);
        }, 250);
      } else {
        // Nếu lướt đi chỗ khác: Hủy ngay lập tức (Unmount) để giải phóng RAM
        setShouldMountVideo(false);
        setCurrentPosition(0);
        setIsPausedByUser(false);
      }

      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [isActive]);

    // Các hàm xử lý sự kiện
    const handleToggleLike = async () => {
      const exploreRef = doc(db, "explores", item.id);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
        try { await updateDoc(exploreRef, { likes: increment(-1) }); } catch (e) {}
      } else {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        try { await updateDoc(exploreRef, { likes: increment(1) }); } catch (e) {}
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
        const percentage = locationX / WINDOW_WIDTH;
        const seekTime = percentage * videoDuration;
        setCurrentPosition(seekTime);
        await videoRef.current?.setPositionAsync(seekTime);
      }
    };

    const optimizedSource = getOptimizedVideoUrl(item.videoLink);
    const thumbnailUrl = getThumbnailUrl(item.videoLink);
    const progressPercent = videoDuration > 0 ? (currentPosition / videoDuration) * 100 : 0;

    return (
      <View style={styles.videoContainer}>
        <Pressable onPress={togglePlayPause} style={styles.videoInnerContainer}>
          
          {/* LỚP 1: ẢNH THUMBNAIL (Luôn hiển thị để tránh màn hình đen) */}
          <Image 
            source={{ uri: thumbnailUrl }}
            style={[styles.video, { zIndex: 0 }]}
            resizeMode="cover"
          />

          {/* LỚP 2: VIDEO (Chỉ render khi shouldMountVideo = true) */}
          {shouldMountVideo ? (
            <Video
              ref={videoRef}
              style={[styles.video, { zIndex: 1 }]} // Đè lên ảnh
              source={{ uri: optimizedSource }}
              useNativeControls={false}
              resizeMode={videoResizeMode}
              isLooping
              shouldPlay={!isPausedByUser} // isActive đã được check ở logic shouldMountVideo
              onLoad={onLoad}
              onReadyForDisplay={onReadyForDisplay}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              progressUpdateIntervalMillis={250}
              posterSource={{ uri: thumbnailUrl }} // Poster dự phòng
              usePoster={false} // Tắt poster mặc định của Video để dùng Image custom
            />
          ) : (
            // Hiển thị icon play mờ khi đang chờ load (delay phase)
            <View style={styles.loadingPlaceholder}>
               <Ionicons name="play-circle-outline" size={50} color="rgba(255,255,255,0.3)" />
            </View>
          )}

          {/* Icon Play to ở giữa khi user bấm Pause */}
          {shouldMountVideo && isPausedByUser && (
            <View style={styles.playIconContainer}>
              <Ionicons name="play" size={60} color="rgba(255,255,255,0.6)" />
            </View>
          )}
        </Pressable>

        {/* CÁC NÚT BẤM VÀ TEXT (Luôn hiển thị) */}
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
            <Text style={styles.videoDesc} numberOfLines={isExpanded ? undefined : 2}>
              {item.description}
            </Text>
            {item.description.length > 80 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.seeMoreText}>{isExpanded ? "Thu gọn" : "Xem thêm"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* THANH TUA (Chỉ hiện khi Video đã Mount) */}
        {shouldMountVideo && (
          <View style={styles.seekBarContainer}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {formatTime(currentPosition)} / {formatTime(videoDuration)}
              </Text>
            </View>

            <TouchableOpacity 
              activeOpacity={1} 
              onPress={handleSeek} 
              style={styles.progressBarBackground}
            >
               <View style={styles.progressBarBackgroundLine} />
               <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
               {videoDuration > 0 && (
                  <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
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
        // Sắp xếp theo thời gian hoặc ngẫu nhiên tùy logic của bạn
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

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current; // Tăng lên 60 để chắc chắn vào khung hình mới load

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
        
        // --- CẤU HÌNH TỐI ƯU HÓA BỘ NHỚ ---
        initialNumToRender={1} // Chỉ render 1 item đầu
        maxToRenderPerBatch={1} // Mỗi lần chỉ load thêm 1 item
        windowSize={3} // Quan trọng: Chỉ giữ 3 màn hình trong bộ nhớ (1 trước, 1 hiện tại, 1 sau)
        removeClippedSubviews={true} // Cho phép gỡ bỏ view ngoài khung nhìn
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
  
  // Loading Placeholder
  loadingPlaceholder: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },

  playIconContainer: { position: "absolute", alignSelf: "center", top: "45%", zIndex: 3 },
  
  // Overlay UI
  overlayUI: { 
    position: "absolute", 
    bottom: 40, 
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
  videoDesc: { color: "#e0e0e0", fontSize: 14, lineHeight: 20, textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10, marginBottom: 5 },
  seeMoreText: { color: "#fff", fontWeight: "bold", fontSize: 14, marginTop: 2, textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  rightActionContainer: { position: "absolute", right: 10, bottom: 40, alignItems: "center", zIndex: 2 },
  actionItem: { alignItems: "center", marginBottom: 20 },
  actionText: { color: "white", marginTop: 5, fontSize: 12, fontWeight: "600", textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  bookTourButton: { marginTop: 10, alignItems: "center", justifyContent: "center" },
  bookTourIconInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#222", borderWidth: 2, borderColor: "white", justifyContent: "center", alignItems: "center" },
  plusBadge: { position: "absolute", bottom: -8, backgroundColor: "#FF4500", width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },

  // Seek Bar
  seekBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    width: '100%',
    height: 40,
    justifyContent: 'flex-end',
    zIndex: 10,
    paddingBottom: 10,
  },
  timerContainer: {
    position: 'absolute',
    right: 15,
    bottom: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBarBackground: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  progressBarBackgroundLine: { 
    position: 'absolute',
    left: 0, right: 0, top: 8.5,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 1
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#FF4500',
    position: 'absolute',
    left: 0,
    top: 8.5,
    zIndex: 2,
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4500',
    position: 'absolute',
    top: 4,
    marginLeft: -6,
    zIndex: 3
  }
});