import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MemberPaymentHistory } from "../types/api";

interface Props {
  item: MemberPaymentHistory;
  accentColor?: string;
}

export default function PaymentHistoryItem({ item, accentColor = "#FF6B35" }: Props) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.topRow}>
        <Text style={styles.receiptNo}>{item.receiptNo}</Text>
        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>Rs. {item.finalAmount}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>&#x1F4C6;</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{item.memberPaymentType}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>&#x2705;</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Start</Text>
            <Text style={styles.detailValue}>{item.memberBeginDate}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>&#x23F0;</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Expiry</Text>
            <Text style={styles.detailValue}>{item.memberExpireDate}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>&#x1F3CB;</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Plan</Text>
            <Text style={styles.detailValue}>
              {item.memberOption} — {item.memberCatagory}
            </Text>
          </View>
        </View>
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
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  receiptNo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "monospace",
  },
  amountBadge: {
    backgroundColor: "#10b981",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  amountText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
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
  detailContent: {
    flex: 1,
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
});
