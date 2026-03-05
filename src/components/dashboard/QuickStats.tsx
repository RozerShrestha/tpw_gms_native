import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";

interface QuickStatsProps {
  checkInsCount: number;
  branch?: string;
  dueAmount?: number;
  theme: DashboardTheme;
}

export default function QuickStats({
  checkInsCount,
  branch,
  dueAmount,
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
        <Text style={styles.statLabel}>Check-ins</Text>
      </View>
      <View
        style={[
          styles.statCard,
          { backgroundColor: T.card, borderColor: T.border },
        ]}
      >
        <Text style={styles.statIcon}>&#x1F3E2;</Text>
        <Text style={styles.statValue}>{branch ?? "—"}</Text>
        <Text style={styles.statLabel}>Branch</Text>
      </View>
      <View
        style={[
          styles.statCard,
          { backgroundColor: T.card, borderColor: T.border },
          hasDue ? styles.statCardAlert : null,
        ]}
      >
        <Text style={styles.statIcon}>&#x1F4B0;</Text>
        <Text style={styles.statValue}>Rs.{dueAmount ?? 0}</Text>
        <Text style={styles.statLabel}>Due</Text>
      </View>
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
    backgroundColor: "#1e1529",
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textTransform: "capitalize",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
