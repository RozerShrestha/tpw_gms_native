import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface InfoRowProps {
  label: string;
  value?: string | null;
  highlight?: boolean;
  accent?: string;
}

export default function InfoRow({
  label,
  value,
  highlight,
  accent = "#FF6B35",
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          highlight && { color: accent, fontWeight: "700" },
        ]}
      >
        {value ?? "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    paddingVertical: 7,
  },
  infoLabel: {
    width: 110,
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: "#ddd",
    fontWeight: "500",
  },
});
