import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";
import InfoRow from "./InfoRow";

interface MembershipDatesProps {
  isClient: boolean;
  isGuest: boolean;
  isExpired: boolean;
  memberDate?: string;
  memberBeginDate?: string;
  memberExpireDate?: string;
  daysLabel: string;
  daysColor: string;
  theme: DashboardTheme;
}

export default function MembershipDates({
  isExpired,
  isClient,
  isGuest,
  memberDate,
  memberBeginDate,
  memberExpireDate,
  daysLabel,
  daysColor,
  theme: T,
}: MembershipDatesProps) {
  return (
    <View
      style={[
        styles.membershipCard,
        {
          backgroundColor: isClient && isExpired ? "#2a1015" : T.card,
        },
      ]}
    >
      <View style={styles.membershipHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isClient && isExpired ? "#ef4444" : T.accent },
          ]}
        >
          {isClient && isExpired ? "Membership (Expired)" : "Membership"}
        </Text>
        {isClient && daysLabel ? (
          <View
            style={[
              styles.daysBadge,
              { backgroundColor: daysColor + "22", borderColor: daysColor },
            ]}
          >
            <Text style={[styles.daysBadgeText, { color: daysColor }]}>
              {daysLabel}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.divider} />
      <InfoRow
        label="Membership Date"
        value={memberDate}
        highlight
        accent={T.accent}
      />
      <InfoRow
        label="Renewal Date"
        value={memberBeginDate}
        highlight
        accent={T.accent}
      />
      {(isGuest || isClient) && (
        <InfoRow
          label="Expired Date"
          value={memberExpireDate}
          highlight
          accent={isExpired ? "#ef4444" : T.accent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  membershipCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  membershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a4a",
    marginVertical: 12,
  },
  daysBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
