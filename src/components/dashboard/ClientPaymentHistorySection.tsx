import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";
import PaymentHistoryItem from "../PaymentHistoryItem";
import { MemberPaymentHistory } from "../../types/api";

interface ClientPaymentHistorySectionProps {
  paymentHistory: MemberPaymentHistory[];
  theme: DashboardTheme;
}

export default function ClientPaymentHistorySection({
  paymentHistory,
  theme: T,
}: ClientPaymentHistorySectionProps) {
  return (
    <>
      <Text style={[styles.attendanceTitle, { color: T.accent }]}>
        &#x1F4B3;  Payment History (Latest 5)
      </Text>
      {paymentHistory.length > 0 ? (
        paymentHistory.map((item, index) => (
          <PaymentHistoryItem
            key={`pay-${item.receiptNo}-${index}`}
            item={item}
            accentColor={T.accent}
          />
        ))
      ) : (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: T.card, borderColor: T.border },
          ]}
        >
          <Text style={styles.emptyIcon}>&#x1F4AD;</Text>
          <Text style={[styles.emptyText, { color: T.textMuted }]}>No payment records found.</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  attendanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
