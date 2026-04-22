import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors } from '../theme/colors';
import { GENRES, getUpcomingVideos } from '../data/mockData';
import { fetchUpcomingVideos, deleteVideo } from '../services/videoService';
import { useAuth } from '../context/AuthContext';

const { width: W, height: H } = Dimensions.get('window');

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// Normalise both real Supabase rows and mock data into the same shape
function normaliseVideo(v) {
  return {
    id: v.id,
    uploaderId: v.uploader_id ?? null,
    storagePath: v.storage_path ?? null,
    videoUrl: v.video_url ?? null,
    uploader: v.artist_name ?? v.uploader ?? '',
    uploaderName: v.uploader_display_name ?? null,
    handle: v.handle ?? '',
    avatarLetter: (v.artist_name ?? v.uploader ?? 'A')[0].toUpperCase(),
    caption: v.caption ?? null,
    likes: v.likes ?? 0,
    views: v.views ?? 0,
    color: v.artist_color ?? v.color ?? '#2D1B69',
    accentColor: v.accentColor ?? '#6B3FA0',
    genre: v.genre ?? '',
    eventName: v.event_title ?? v.eventName ?? '',
    venueName: v.venue_name ?? v.venueName ?? '',
    eventDate: v.concert_date ?? v.eventDate ?? '',
    daysUntil: v.daysUntil ?? null,
    event: v.event ?? null,
  };
}

// ─── Single video card ────────────────────────────────────────────────────────
function VideoCard({ video, isActive, cardHeight, onDeleted }) {
  const [liked, setLiked] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const isOwner = user?.id === video.uploaderId;

  const handleDelete = () => {
    Alert.alert('Delete clip', 'Remove this video permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteVideo(video.id, video.storagePath);
            onDeleted?.(video.id);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const player = useVideoPlayer(
    video.videoUrl ? { uri: video.videoUrl } : null,
    (p) => {
      p.loop = true;
      p.muted = true;
    }
  );

  useEffect(() => {
    if (!player || !video.videoUrl) return;

    // Play immediately in case already ready
    if (isActive) player.play();
    else player.pause();

    // Also listen for status — fires when source finishes loading
    const sub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        if (isActive) player.play();
      }
    });

    return () => sub.remove();
  }, [isActive, player]);

  return (
    <View style={{ width: W, height: cardHeight }}>
      {/* ── Video layer (or gradient placeholder if no URL) ── */}
      {video.videoUrl ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={true}
        />
      ) : (
        <LinearGradient
          colors={[video.accentColor || '#6B3FA0', video.color || '#2D1B69', '#080010']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
        />
      )}

      {/* Bottom dark fade */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)']}
        style={[StyleSheet.absoluteFill, { top: '45%' }]}
        pointerEvents="none"
      />

      {/* Play button for gradient placeholders */}
      {!video.videoUrl && (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.playWrap}>
            <Ionicons name="play" size={44} color="rgba(255,255,255,0.55)" />
          </View>
        </View>
      )}

      {/* Right sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sideAvatar}>
          <Text style={styles.sideAvatarLetter}>{video.avatarLetter}</Text>
        </View>
        <View style={styles.sideItem}>
          <TouchableOpacity
            onPress={() => setLiked((l) => !l)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={30}
              color={liked ? '#FF6B9D' : 'white'}
            />
          </TouchableOpacity>
          <Text style={styles.sideCount}>
            {formatCount(liked ? video.likes + 1 : video.likes)}
          </Text>
        </View>
        <View style={styles.sideItem}>
          <Ionicons name="eye-outline" size={28} color="white" />
          <Text style={styles.sideCount}>{formatCount(video.views)}</Text>
        </View>
        <View style={styles.sideItem}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-redo-outline" size={27} color="white" />
          </TouchableOpacity>
          <Text style={styles.sideCount}>Share</Text>
        </View>
        {isOwner && (
          <View style={styles.sideItem}>
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={26} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.uploaderName}>{video.uploader}</Text>
        {video.uploaderName ? (
          <Text style={styles.handle}>uploaded by {video.uploaderName}</Text>
        ) : video.handle ? (
          <Text style={styles.handle}>{video.handle}</Text>
        ) : null}
        {video.caption ? (
          <Text style={styles.caption} numberOfLines={2}>{video.caption}</Text>
        ) : null}

        {(video.eventName || video.venueName) && (
          <TouchableOpacity
            onPress={() =>
              video.event
                ? navigation.navigate('EventDetail', { event: video.event })
                : navigation.navigate('Events')
            }
            activeOpacity={0.8}
          >
            <View style={styles.eventBadge}>
              <Ionicons name="musical-notes" size={13} color="#FFD700" />
              <Text style={styles.eventBadgeText} numberOfLines={1}>
                {video.eventName}{video.venueName ? ` · ${video.venueName}` : ''}
              </Text>
              {video.daysUntil != null && (
                <View style={styles.countdownPill}>
                  <Text style={styles.countdownText}>{video.daysUntil}d</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('forYou');
  const [activeIndex, setActiveIndex] = useState(0);
  // Start with mock data immediately so screen never blacks out
  const [videos, setVideos] = useState(() => getUpcomingVideos().map(normaliseVideo));
  const [loading, setLoading] = useState(false);

  const CARD_HEIGHT = H - insets.top;

  // Refetch every time the screen comes into focus (picks up new uploads)
  useFocusEffect(
    useCallback(() => {
      const mockVideos = getUpcomingVideos().map(normaliseVideo);

      fetchUpcomingVideos()
        .then((real) => {
          // Only count Supabase rows that have an actual playable URL
          const realWithUrls = (real ?? []).filter(v => v.video_url);
          if (realWithUrls.length > 0) {
            // Prepend real uploads before the mock feed
            setVideos([...realWithUrls.map(normaliseVideo), ...mockVideos]);
          } else {
            // Nothing real to show yet — keep mock data
            setVideos(mockVideos);
          }
        })
        .catch(() => {
          // Network or DB error — fall back to mock
          setVideos(mockVideos);
        });
    }, [])
  );

  const filtered =
    activeGenre === 'All'
      ? videos
      : videos.filter((v) => v.genre === activeGenre);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const handleDeleted = useCallback((deletedId) => {
    setVideos(prev => prev.filter(v => v.id !== deletedId));
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <VideoCard
        video={item}
        isActive={index === activeIndex}
        cardHeight={CARD_HEIGHT}
        onDeleted={handleDeleted}
      />
    ),
    [activeIndex, CARD_HEIGHT, handleDeleted]
  );

  const getItemLayout = useCallback(
    (_, index) => ({ length: CARD_HEIGHT, offset: CARD_HEIGHT * index, index }),
    [CARD_HEIGHT]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#080010' }}>
      <StatusBar barStyle="light-content" />

      {loading ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListEmptyComponent={
            <View style={[styles.empty, { height: CARD_HEIGHT }]}>
              <Ionicons name="videocam-outline" size={52} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No clips yet</Text>
              <Text style={styles.emptySubtitle}>
                Videos for upcoming shows will appear here
              </Text>
            </View>
          }
        />
      )}

      {/* Top overlay — tabs + genre filter */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.tabRow} pointerEvents="auto">
          {['forYou', 'following'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'forYou' ? 'For You' : 'Following'}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
          style={styles.genreScroll}
          pointerEvents="auto"
        >
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genreChip, activeGenre === g && styles.genreChipActive]}
              onPress={() => setActiveGenre(g)}
              activeOpacity={0.8}
            >
              <Text style={[styles.genreChipText, activeGenre === g && styles.genreChipTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  tabRow: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginBottom: 10 },
  tabText: { color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  tabTextActive: { color: colors.white, fontWeight: '800' },
  tabUnderline: { height: 2, backgroundColor: colors.white, borderRadius: 2, marginTop: 3 },
  genreScroll: { flexGrow: 0 },
  genreList: { paddingHorizontal: 16, gap: 8 },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  genreChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genreChipText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  genreChipTextActive: { color: colors.white, fontWeight: '700' },
  playWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: { position: 'absolute', right: 14, bottom: 110, alignItems: 'center', gap: 22 },
  sideAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    marginBottom: 4,
  },
  sideAvatarLetter: { color: colors.white, fontSize: 18, fontWeight: '800' },
  sideItem: { alignItems: 'center', gap: 4 },
  sideCount: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  bottomInfo: { position: 'absolute', bottom: 28, left: 14, right: 68, gap: 4 },
  uploaderName: { color: colors.white, fontSize: 16, fontWeight: '800' },
  handle: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    alignSelf: 'flex-start',
  },
  eventBadgeText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500', flex: 1 },
  countdownPill: {
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countdownText: { color: '#000', fontSize: 11, fontWeight: '800' },
  empty: { width: W, justifyContent: 'center', alignItems: 'center', gap: 14 },
  emptyTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
