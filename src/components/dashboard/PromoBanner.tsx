import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";

interface PromoBannerProps {
  theme: DashboardTheme;
}

export default function PromoBanner({ theme: T }: PromoBannerProps) {
  return (
    <View
      style={[
        styles.promoBanner,
        { backgroundColor: T.card, borderColor: T.accent },
      ]}
    >
      <Text style={styles.promoIcon}>&#x1F381;</Text>
      <Text style={[styles.promoHeading, { color: T.accent }]}>
        Checkin daily to win exciting prizes! Claim your reward at reception.
      </Text>
      <View style={styles.rewardRow}>
        <Text style={styles.rewardIcon}>&#x2B50;</Text>
        <Text style={[styles.rewardText, { color: T.accent }]}>
          25 checkins monthly: Free 5 days gym extension
        </Text>
      </View>
      <View style={styles.rewardRow}>
        <Text style={styles.rewardIcon}>&#x2B50;</Text>
        <Text style={[styles.rewardText, { color: T.accent }]}>
          20 checkins monthly: Free 3 days gym extension
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  promoBanner: {
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  promoIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  promoHeading: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 6,
  },
  rewardIcon: {
    fontSize: 14,
  },
  rewardText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
});
