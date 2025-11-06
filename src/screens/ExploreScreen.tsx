import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
} from 'react-native';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { YOUTUBE_API_KEY } from '@env';
import YoutubePlayer from "react-native-youtube-iframe";

const lightBackground = "#F4F7FF";
const themeColor = "#0194F3";
const cardBackgroundColor = colors.white;
const primaryTextColor = "#0A2C4D";
const secondaryTextColor = colors.grey_text;
const searchBarBackgroundColor = colors.white;


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const videoCardWidth = (SCREEN_WIDTH - 15 * 3) / 2;

interface YoutubeVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    channelTitle: string;
}

const ExploreHeader: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerButtonPlaceholder} />
        <Text style={styles.headerTitle}>Khám phá</Text>
        <View style={styles.headerButtonPlaceholder} />
    </View>
);

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
}
const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onSubmit }) => (
     <View style={styles.searchBarWrapper}>
        <View style={styles.searchBarContainer}>
            <Ionicons
                name="search"
                size={20}
                color={secondaryTextColor}
                style={styles.searchIcon}
            />
            <TextInput
                placeholder="Tìm video du lịch..."
                placeholderTextColor={secondaryTextColor}
                style={styles.searchInput}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                returnKeyType="search"
            />
        </View>
    </View>
);

interface VideoCardProps {
    video: YoutubeVideo;
    onPress: (videoId: string) => void;
}
const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => (
    <TouchableOpacity style={styles.videoCardContainer} onPress={() => onPress(video.id)} activeOpacity={0.8}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumbnail} />
        <View style={styles.videoInfoContainer}>
             <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
             <Text style={styles.videoChannel} numberOfLines={1}>{video.channelTitle}</Text>
        </View>
    </TouchableOpacity>
);

export const ExploreScreen: React.FC = () => {
    const [videos, setVideos] = useState<YoutubeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const playerRef = useRef<any>(null);

     const fetchYoutubeVideos = useCallback(async (baseQuery: string) => {
        setIsLoading(true);
        setError(null);
        setVideos([]);

        const queryTerm = baseQuery.trim() === "" ? " " : baseQuery.trim();
        let finalQuery = `du lịch Việt Nam ${queryTerm}`;

        console.log("Searching YouTube with query:", finalQuery);

        const API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(finalQuery)}&type=video&regionCode=VN&maxResults=6&key=${YOUTUBE_API_KEY}`;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const formattedVideos: YoutubeVideo[] = data.items.map((item: any) => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                    channelTitle: item.snippet.channelTitle,
                }));
                setVideos(formattedVideos);
            } else if (data.items && data.items.length === 0) {
                 setError("Không tìm thấy video nào.");
                 setVideos([]);
            } else {
                 console.error("YouTube API Error:", data.error || "Unknown error");
                 if (data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                     setError("Đã hết hạn ngạch YouTube API cho hôm nay.");
                 } else {
                     setError("Không tìm thấy video nào hoặc API Key lỗi.");
                 }
                 setVideos([]);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Lỗi kết nối mạng.");
            setVideos([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

     useEffect(() => {
        if(!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' ) {
            setError("Vui lòng thêm YouTube API Key vào file .env");
            setIsLoading(false);
            return;
        }
        console.log(process.env.YOUTUBE_API_KEY)
        fetchYoutubeVideos(searchTerm);
    }, [fetchYoutubeVideos, searchTerm]);

    const handleSearchSubmit = () => {
        fetchYoutubeVideos(searchTerm);
    };

    const playVideo = useCallback((videoId: string) => { setPlayingVideoId(videoId); setIsPlayerReady(false); }, []);
    const closePlayer = useCallback(() => { setPlayingVideoId(null); }, []);
    const onPlayerStateChange = useCallback((state: string) => { if (state === "ended") console.log("Video ended"); if (state === "playing") console.log("Video playing"); }, []);
    const onPlayerReady = useCallback(() => { console.log("Player is ready"); setIsPlayerReady(true); }, []);
    const onPlayerError = useCallback((error: any) => { console.error("Player Error:", error); setError("Không thể phát video này."); closePlayer(); }, [closePlayer]);

    const renderVideoItem = ({ item }: { item: YoutubeVideo }) => (
        <VideoCard video={item} onPress={playVideo} />
    );

    return (
        <SafeAreaView style={styles.screenContainer}>
            <ExploreHeader />
             <SearchBar
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmit={handleSearchSubmit}
            />

             <Modal
                visible={!!playingVideoId}
                transparent={true}
                animationType="fade"
                onRequestClose={closePlayer}
            >
                 <View style={styles.modalContainer}>
                     <Pressable style={styles.modalBackdrop} onPress={closePlayer} />
                     <View style={styles.playerWrapper}>
                         {playingVideoId && (
                             <YoutubePlayer
                                 ref={playerRef}
                                 height={SCREEN_WIDTH * 9 / 16}
                                 videoId={playingVideoId}
                                 play={isPlayerReady}
                                 onChangeState={onPlayerStateChange}
                                 onReady={onPlayerReady}
                                 onError={onPlayerError}
                                 webViewStyle={{opacity: 0.99}}
                             />
                         )}
                          <TouchableOpacity style={styles.closeButton} onPress={closePlayer}>
                              <Ionicons name="close-circle" size={30} color={colors.white} />
                          </TouchableOpacity>
                     </View>
                </View>
            </Modal>

            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.videoGridRow}
                contentContainerStyle={styles.videoGridContent}
                ListHeaderComponent={
                    <>
                         {isLoading && (
                            <ActivityIndicator size="large" color={themeColor} style={styles.loadingIndicator} />
                         )}
                         {error && !isLoading && (
                             <Text style={styles.errorText}>{error}</Text>
                         )}
                    </>
                }
                 ListEmptyComponent={
                     !isLoading && !error && videos.length === 0 ? (
                         <Text style={styles.emptyListText}>Không có video nào phù hợp.</Text>
                     ) : null
                 }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: lightBackground },
headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: colors.white,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomColor: colors.light_Blue,
        borderBottomWidth: 1,
    },    
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: primaryTextColor },
    headerButtonPlaceholder: { width: 40 },
    searchBarWrapper: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 15, backgroundColor: colors.white, borderBottomColor: colors.light_Blue, borderBottomWidth: 1 },
    searchBarContainer: { flexDirection: "row", alignItems: "center", backgroundColor: lightBackground, borderRadius: 10, paddingHorizontal: 12, height: 45 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: primaryTextColor },
    videoGridContent: { paddingHorizontal: 7.5, paddingBottom: 20, paddingTop: 15 },
    videoGridRow: { justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 7.5 },
    videoCardContainer: { width: videoCardWidth, backgroundColor: cardBackgroundColor, borderRadius: 10, overflow: 'hidden', elevation: 2, shadowColor: "#AAB2C8", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
    videoThumbnail: { width: '100%', height: videoCardWidth * 0.75, backgroundColor: '#eee' },
    videoInfoContainer: { padding: 10 },
    videoTitle: { fontSize: 14, fontWeight: '600', color: primaryTextColor, marginBottom: 3 },
    videoChannel: { fontSize: 12, color: secondaryTextColor },
    loadingIndicator: { marginTop: 50, alignSelf: 'center' },
    errorText: { color: colors.red, fontSize: 14, textAlign: 'center', marginTop: 20, paddingHorizontal: 20 },
    emptyListText: { color: secondaryTextColor, fontSize: 14, textAlign: 'center', marginTop: 50 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    playerWrapper: { width: '95%', backgroundColor: '#000', borderRadius: 5, overflow: 'hidden', position: 'relative' },
    closeButton: { position: 'absolute', top: -10, right: -10, borderRadius: 15, padding: 2, zIndex: 10 },
});