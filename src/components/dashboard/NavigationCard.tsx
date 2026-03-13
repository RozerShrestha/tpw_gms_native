import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";

interface NavigationCardProps {
  icon: string;
  title: string;
  subtitle: string;
  count?: number;
  theme: DashboardTheme;
  onPress: () => void;
}

export default function NavigationCard({
  icon,
  title,
  subtitle,
  count,
  theme: T,
  onPress,
}: NavigationCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: T.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: T.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        {count !== undefined && (
          <View style={[styles.countBadge, { backgroundColor: T.accent }]}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
        <Text style={[styles.arrow, { color: T.accent }]}>&#x276F;</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  arrow: {
    fontSize: 18,
    fontWeight: "700",
  },
});
