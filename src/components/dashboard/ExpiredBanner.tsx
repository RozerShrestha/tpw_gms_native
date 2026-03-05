import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ExpiredBannerProps {
  remainingDays: number;
}

export default function ExpiredBanner({ remainingDays }: ExpiredBannerProps) {
  const absDays = Math.abs(remainingDays);
  return (
    <View style={styles.expiredBanner}>
      <Text style={styles.expiredBannerIcon}>&#x26D4;</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.expiredBannerTitle}>Membership Expired</Text>
        <Text style={styles.expiredBannerSub}>
          Your membership expired {absDays} day
          {absDays !== 1 ? "s" : ""} ago. Please renew to continue.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a1015",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#ef4444",
    gap: 12,
  },
  expiredBannerIcon: {
    fontSize: 28,
  },
  expiredBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ef4444",
    letterSpacing: 0.5,
  },
  expiredBannerSub: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 3,
    lineHeight: 17,
  },
});
