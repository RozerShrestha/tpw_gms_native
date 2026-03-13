import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PaymentHistoryItem from "../components/PaymentHistoryItem";
import { useMemberInfo } from "../context/MemberInfoContext";

/** Sort payment history by memberBeginDate desc */
function sortPaymentsDesc<T extends { memberBeginDate: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const da = Date.parse(a.memberBeginDate) || 0;
    const db = Date.parse(b.memberBeginDate) || 0;
    return db - da;
  });
}

export default function PaymentHistoryScreen() {
  const navigation = useNavigation<any>();
  const { memberInfo, theme: T } = useMemberInfo();
  const paymentHistory = useMemo(
    () => sortPaymentsDesc(memberInfo?.memberPaymentHistorys ?? []),
    [memberInfo?.memberPaymentHistorys]
  );

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity
          style={[styles.menuBtn, { borderColor: T.border }]}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={[styles.menuIcon, { color: T.text }]}>{"\u2630"}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: T.text }]}>Payment History</Text>
        <View style={[styles.countBadge, { backgroundColor: T.accent }]}>
          <Text style={styles.countText}>{paymentHistory.length}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
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
            <Text style={[styles.emptyText, { color: T.textMuted }]}>
              No payment records found.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
  },
  countBadge: {
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
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
