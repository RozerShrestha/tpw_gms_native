import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";

interface ExpiredBannerLockerProps {
  remainingDays: number;
  theme: DashboardTheme;
}

export default function ExpiredBannerLocker({ remainingDays, theme: T }: ExpiredBannerLockerProps) {
  const absDays = Math.abs(remainingDays);
  return (
    <View style={[styles.ExpiredBannerLocker, { backgroundColor: T.isDark ? "#2a1015" : "#fef2f2" }]}>
      <Text style={styles.ExpiredBannerLockerIcon}>&#x26D4;</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.ExpiredBannerLockerTitle}>Locker Expired</Text>
        <Text style={[styles.ExpiredBannerLockerSub, { color: T.textSecondary }]}>
          Your locker expired {absDays} day
          {absDays !== 1 ? "s" : ""} ago. Please renew to continue.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ExpiredBannerLocker: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#ef4444",
    gap: 12,
  },
  ExpiredBannerLockerIcon: {
    fontSize: 28,
  },
  ExpiredBannerLockerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ef4444",
    letterSpacing: 0.5,
  },
  ExpiredBannerLockerSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
});
