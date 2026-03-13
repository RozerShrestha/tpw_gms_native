import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useMemberInfo } from "../../context/MemberInfoContext";

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
  accent = "#C62828",
}: InfoRowProps) {
  const { theme: T } = useMemberInfo();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: T.textSecondary }]}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          { color: T.text },
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
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
});
