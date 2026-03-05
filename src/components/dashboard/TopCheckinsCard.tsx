import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { DashboardTheme } from "./theme";
import { fetchTopTenCheckins } from "../../api/member";
import { TopCheckinItem } from "../../types/api";
import { API_BASE_URL } from "../../api/config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.3;
const CARD_MARGIN = 6;

interface TopCheckinsCardProps {
  accessToken: string;
  theme: DashboardTheme;
}

const RANK_BADGES: Record<number, { emoji: string; color: string }> = {
  1: { emoji: "🥇", color: "#FFD700" },
  2: { emoji: "🥈", color: "#C0C0C0" },
  3: { emoji: "🥉", color: "#CD7F32" },
};

/** Check if imageLoc actually has a real image path */
function hasRealImage(imageLoc: string): boolean {
  if (!imageLoc) return false;
  const trimmed = imageLoc.trim().replace(/\/+$/, "");
  return trimmed !== "Image/Members" && trimmed.length > "Image/Members/".length;
}

/** Build full image URL */
function getImageUrl(imageLoc: string): string {
  return `${API_BASE_URL}/${imageLoc}`;
}

/** Get initials from full name */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TopCheckinsCard({
  accessToken,
  theme: T,
}: TopCheckinsCardProps) {
  const [data, setData] = useState<TopCheckinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const result = await fetchTopTenCheckins(accessToken);
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (CARD_WIDTH + CARD_MARGIN * 2));
    setActiveIndex(idx);
  }, []);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
        <Text style={styles.sectionTitle}>🏆 Top Check-ins</Text>
        <ActivityIndicator size="small" color={T.accent} style={{ marginVertical: 20 }} />
      </View>
    );
  }

  if (error || data.length === 0) {
    return null;
  }

  const renderItem = ({ item, index }: { item: TopCheckinItem; index: number }) => {
    const rank = index + 1;
    const badge = RANK_BADGES[rank];
    const isTop3 = rank <= 3;
    const realImage = hasRealImage(item.imageLoc);
    const avatarSize = isTop3 ? 56 : 48;
    const borderColor = badge?.color ?? T.accent;

    return (
      <View
        style={[
          styles.slideCard,
          {
            width: CARD_WIDTH,
            marginHorizontal: CARD_MARGIN,
            backgroundColor: T.card,
            borderColor: isTop3 ? borderColor + "55" : T.border,
          },
        ]}
      >
        {/* Rank indicator */}
        {isTop3 ? (
          <Text style={styles.rankEmoji}>{badge!.emoji}</Text>
        ) : (
          <View style={[styles.rankBubble, { borderColor: T.accent + "44" }]}>
            <Text style={[styles.rankNumber, { color: T.accent }]}>#{rank}</Text>
          </View>
        )}

        {/* Avatar */}
        <View
          style={[
            styles.avatarWrapper,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              borderColor: borderColor,
              borderWidth: isTop3 ? 3 : 2,
            },
          ]}
        >
          {realImage ? (
            <Image
              source={{ uri: getImageUrl(item.imageLoc) }}
              style={{
                width: avatarSize - 6,
                height: avatarSize - 6,
                borderRadius: (avatarSize - 6) / 2,
                resizeMode: "cover",
              }}
            />
          ) : (
            <View
              style={{
                width: avatarSize - 6,
                height: avatarSize - 6,
                borderRadius: (avatarSize - 6) / 2,
                backgroundColor: (badge?.color ?? T.accent) + "33",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: isTop3 ? 18 : 16,
                  fontWeight: "800",
                  color: badge?.color ?? T.accent,
                }}
              >
                {getInitials(item.fullname)}
              </Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={styles.slideName} numberOfLines={2}>
          {item.fullname}
        </Text>

        {/* Check-in count */}
        <View
          style={[
            styles.countPill,
            { backgroundColor: (badge?.color ?? T.accent) + "22" },
          ]}
        >
          <Text style={[styles.countValue, { color: badge?.color ?? T.accent }]}>
            {item.TotalCheckins}
          </Text>
          <Text style={[styles.countLabel, { color: badge?.color ?? T.accent }]}>
            check-ins
          </Text>
        </View>

        {/* Branch */}
        <View style={[styles.branchPill, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
          <Text style={styles.branchText}>📍 {item.branch}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>🏆 Top Check-ins</Text>
        <Text style={[styles.subtitle, { color: T.accent }]}>This Year</Text>
      </View>

      {/* Horizontal carousel */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, idx) => `checkin-${idx}-${item.fullname}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {data.map((_, idx) => (
          <View
            key={`dot-${idx}`}
            style={[
              styles.dot,
              {
                backgroundColor:
                  idx === activeIndex ? T.accent : "rgba(255,255,255,0.2)",
                width: idx === activeIndex ? 18 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Carousel ───────────────────────────────────────────────
  carouselContent: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  slideCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  rankEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  rankBubble: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 6,
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: "700",
  },
  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  slideName: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    textTransform: "capitalize",
    marginBottom: 4,
    lineHeight: 14,
  },
  countPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    marginBottom: 4,
  },
  countValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  countLabel: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  branchPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  branchText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    textTransform: "capitalize",
  },

  // ── Dot indicators ─────────────────────────────────────────
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});
