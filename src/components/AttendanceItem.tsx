import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StaffAttendance } from "../types/api";

interface Props {
  item: StaffAttendance;
  accentColor?: string;
}

export default function AttendanceItem({ item, accentColor = "#FF6B35" }: Props) {
  const isLate = item.lateFlag === true;

  return (
    <View style={[styles.card, { borderLeftColor: isLate ? "#ef4444" : accentColor }, isLate && styles.lateCard]}>
      <View style={styles.topRow}>
        <Text style={styles.name}>{item.fullName}</Text>
        {isLate ? (
          <View style={styles.lateBadge}>
            <Text style={styles.lateBadgeText}>LATE</Text>
          </View>
        ) : (
          <View style={styles.onTimeBadge}>
            <Text style={styles.onTimeBadgeText}>ON TIME</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>&#x1F3E2;</Text>
          <View>
            <Text style={styles.detailLabel}>Branch</Text>
            <Text style={styles.detailValue}>{item.branch}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>&#x2705;</Text>
          <View>
            <Text style={styles.detailLabel}>Check-in</Text>
            <Text style={styles.detailValue}>{item.checkin}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>&#x1F6AA;</Text>
          <View>
            <Text style={styles.detailLabel}>Check-out</Text>
            <Text style={styles.detailValue}>{item.checkout}</Text>
          </View>
        </View>
      </View>

      <View style={styles.remarkRow}>
        <Text style={styles.remarkLabel}>Remark:</Text>
        <Text style={[styles.remarkValue, isLate && styles.lateRemarkText]}>
          {item.remark}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16213e",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#2a2a4a",
  },
  lateCard: {
    borderLeftColor: "#ef4444",
    backgroundColor: "#1e1529",
    borderColor: "#3a1a2a",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textTransform: "capitalize",
  },
  lateBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lateBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  onTimeBadge: {
    backgroundColor: "#10b981",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  onTimeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  detailsGrid: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailIcon: {
    fontSize: 14,
    width: 22,
    textAlign: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    color: "#ddd",
    fontWeight: "500",
  },
  remarkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2a2a4a",
  },
  remarkLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    marginRight: 8,
  },
  remarkValue: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  lateRemarkText: {
    color: "#ef4444",
  },
});
