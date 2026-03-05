import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";
import InfoRow from "./InfoRow";
import { LockerInfo } from "../../types/api";

interface LockerInfoCardProps {
  locker: LockerInfo;
  isLockerExpired: boolean;
  theme: DashboardTheme;
  daysLabel: string;
  daysColor: string;
}

export default function LockerInfoCard({
  locker,
  isLockerExpired,
  daysLabel,
  daysColor,
  theme: T,
}: LockerInfoCardProps) {
  return (
    <View
      style={[
        styles.membershipCard,
        {
          backgroundColor: isLockerExpired ? "#2a1015" : T.card,
          borderColor: isLockerExpired ? "#ef4444" : T.accent,
          borderLeftColor: isLockerExpired ? "#ef4444" : T.accent,
        },
      ]}
    >
      <View style={styles.membershipHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isLockerExpired ? "#ef4444" : T.accent },
          ]}
        >
          {isLockerExpired? "Locker (Expired)" : "Locker"}
          </Text>
          <Text style={[styles.daysBadge, { borderColor: daysColor }]}>
            <Text style={[styles.daysBadgeText, { color: daysColor }]}>
              {daysLabel}
            </Text>
          </Text>
        
      </View>
      <View style={styles.divider} />
      <InfoRow
        label="Locker No."
        value={String(locker.lockerNumber)}
        accent={T.accent}
      />
      <InfoRow 
        label="Duration" 
        value={locker.duration}
        highlight 
        accent={T.accent} />
      <InfoRow 
        label="Renew Date" 
        value={locker.renewDate}
        highlight
        accent={T.accent} />
      <InfoRow
        label="Expire Date"
        value={locker.expireDate}
        highlight
        accent={isLockerExpired ? "#ef4444" : T.accent}
      />
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
