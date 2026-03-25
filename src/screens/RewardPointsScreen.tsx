import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useMemberInfo } from "../context/MemberInfoContext";
import { fetchRewardPoints } from "../api/member";
import { RewardPoint } from "../types/api";

const ACTIVITY_ICONS: Record<string, string> = {
  MembershipRenew: "\u{1F504}",
  MembershipNew: "\u{1F389}",
  LockerNew: "\u{1F512}",
  LockerRenew: "\u{1F511}",
  Checkin: "\u{2705}",
  Referral: "\u{1F91D}",
};

function getActivityIcon(type: string): string {
  return ACTIVITY_ICONS[type] ?? "\u{2B50}";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RewardPointsScreen() {
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();
  const { memberInfo, theme: T } = useMemberInfo();
  const [data, setData] = useState<RewardPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!accessToken || !memberInfo?.memberId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(false);
      try {
        const result = await fetchRewardPoints(accessToken, memberInfo.memberId);
        setData(result);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, memberInfo?.memberId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const totalPoints = useMemo(
    () => data.reduce((sum, item) => sum + item.Points, 0),
    [data]
  );

  const activityTypes = useMemo(
    () => [...new Set(data.map((item) => item.ActivityType))],
    [data]
  );

  const filteredData = useMemo(
    () => (selectedFilter ? data.filter((item) => item.ActivityType === selectedFilter) : data),
    [data, selectedFilter]
  );

  const filteredTotal = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.Points, 0),
    [filteredData]
  );

  const sortedData = useMemo(
    () =>
      [...filteredData].sort(
        (a, b) =>
          new Date(b.ActivityDate).getTime() -
          new Date(a.ActivityDate).getTime()
      ),
    [filteredData]
  );

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity
          style={[styles.menuBtn, { borderColor: T.border }]}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={[styles.menuIcon, { color: T.text }]}>{"\u2630"}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: T.text }]}>
          Reward Points
        </Text>
        <View style={[styles.countBadge, { backgroundColor: T.accent }]}>
          <Text style={styles.countText}>{totalPoints}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={T.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ color: T.textMuted, fontSize: 14 }}>
            Failed to load reward points.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: T.accent }]}
            onPress={() => load()}
          >
            <Text style={styles.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[T.accent]}
              tintColor={T.accent}
            />
          }
        >
          {/* Total Points Summary */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: T.card, borderColor: T.border },
            ]}
          >
            <Text style={styles.summaryIcon}>{"\u{1F3C6}"}</Text>
            <Text style={[styles.summaryLabel, { color: T.textMuted }]}>
              Total Reward Points
            </Text>
            <Text style={[styles.summaryValue, { color: T.accent }]}>
              {totalPoints}
            </Text>
          </View>

          {/* Filter Chips */}
          {activityTypes.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedFilter === null ? T.accent : T.card,
                    borderColor: T.accent,
                  },
                ]}
                onPress={() => setSelectedFilter(null)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: selectedFilter === null ? "#fff" : T.text },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {activityTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedFilter === type ? T.accent : T.card,
                      borderColor: T.accent,
                    },
                  ]}
                  onPress={() => setSelectedFilter(type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedFilter === type ? "#fff" : T.text },
                    ]}
                  >
                    {getActivityIcon(type)} {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Filtered total */}
          {selectedFilter && (
            <Text style={[styles.filteredTotal, { color: T.textMuted }]}>
              {filteredData.length} entries · {filteredTotal} pts
            </Text>
          )}

          {/* History List */}
          {sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <View
                key={`reward-${item.Id}-${index}`}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: T.card,
                    borderColor: T.border,
                    borderLeftColor: T.accent,
                  },
                ]}
              >
                <View style={styles.itemRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: T.accent + "22" },
                    ]}
                  >
                    <Text style={styles.activityIcon}>
                      {getActivityIcon(item.ActivityType)}
                    </Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemNotes, { color: T.text }]}>
                      {item.Notes}
                    </Text>
                    <Text style={[styles.itemType, { color: T.textMuted }]}>
                      {item.ActivityType}
                    </Text>
                    <Text style={[styles.itemDate, { color: T.textMuted }]}>
                      {formatDate(item.ActivityDate)} {formatTime(item.ActivityDate)}
                    </Text>
                  </View>
                  <View style={styles.pointsBadge}>
                    <Text style={[styles.pointsText, { color: T.accent }]}>
                      +{item.Points}
                    </Text>
                    <Text style={[styles.pointsLabel, { color: T.textMuted }]}>
                      pts
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: T.card, borderColor: T.border },
              ]}
            >
              <Text style={styles.emptyIcon}>{"\u{1F4AD}"}</Text>
              <Text style={[styles.emptyText, { color: T.textMuted }]}>
                No reward points yet.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
  },
  countBadge: {
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  summaryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: "900",
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemNotes: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  itemType: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
  },
  pointsBadge: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "900",
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  retryBtn: {
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filteredTotal: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 12,
  },
});
