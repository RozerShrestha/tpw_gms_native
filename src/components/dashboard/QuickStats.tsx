import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DashboardTheme } from "./theme";

interface QuickStatsProps {
  checkInsCount: number;
  branch?: string;
  dueAmount?: number;
  rewardPoints?: number | null;
  onRewardPress?: () => void;
  theme: DashboardTheme;
}

export default function QuickStats({
  checkInsCount,
  branch,
  dueAmount,
  rewardPoints,
  onRewardPress,
  theme: T,
}: QuickStatsProps) {
  const hasDue = dueAmount !== undefined && dueAmount > 0;

  return (
    <View style={styles.statsRow}>
      <View
        style={[
          styles.statCard,
          { backgroundColor: T.card, borderColor: T.border },
        ]}
      >
        <Text style={styles.statIcon}>&#x2705;</Text>
        <Text style={[styles.statValue, { color: T.accent }]}>
          {checkInsCount}
        </Text>
        <Text style={[styles.statLabel, { color: T.textSecondary }]}>Check-ins</Text>
      </View>
      <View
        style={[
          styles.statCard,
          { backgroundColor: T.card, borderColor: T.border },
        ]}
      >
        <Text style={styles.statIcon}>&#x1F3E2;</Text>
        <Text style={[styles.statValue, { color: T.text }]}>{branch ?? "—"}</Text>
        <Text style={[styles.statLabel, { color: T.textSecondary }]}>Branch</Text>
      </View>
      <View
        style={[
          styles.statCard,
          { backgroundColor: T.card, borderColor: T.border },
          hasDue ? [styles.statCardAlert, { backgroundColor: T.isDark ? "#1e1529" : "#fef2f2" }] : null,
        ]}
      >
        <Text style={styles.statIcon}>&#x1F4B0;</Text>
        <Text style={[styles.statValue, { color: T.text }]}>Rs.{dueAmount ?? 0}</Text>
        <Text style={[styles.statLabel, { color: T.textSecondary }]}>Due</Text>
      </View>
      {rewardPoints !== undefined && rewardPoints !== null && (
        <TouchableOpacity
          style={[
            styles.statCard,
            { backgroundColor: T.card, borderColor: T.border },
          ]}
          onPress={onRewardPress}
          activeOpacity={0.7}
        >
          <Text style={styles.statIcon}>{"\u{1F3C6}"}</Text>
          <Text style={[styles.statValue, { color: T.accent }]}>
            {rewardPoints}
          </Text>
          <Text style={[styles.statLabel, { color: T.textSecondary }]}>Rewards</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statCardAlert: {
    borderColor: "#ef4444",
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "capitalize",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
