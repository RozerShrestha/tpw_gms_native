import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface FreezeInfoBannerProps {
  freezeInfo: string;
  freezeDate: string | null;
}

export default function FreezeInfoBanner({
  freezeInfo,
  freezeDate,
}: FreezeInfoBannerProps) {
  return (
    <View style={styles.freezeBanner}>
      <Text style={styles.freezeBannerIcon}>&#x2744;</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.freezeBannerTitle}>{freezeInfo}</Text>
        {freezeDate && (
          <Text style={styles.freezeBannerSub}>
            Frozen since: {freezeDate}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  freezeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0c2d48",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    gap: 12,
  },
  freezeBannerIcon: {
    fontSize: 28,
  },
  freezeBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: 0.5,
  },
  freezeBannerSub: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 3,
    lineHeight: 17,
  },
});
