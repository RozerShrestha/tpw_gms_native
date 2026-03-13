import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";

interface RemainingDaysCardProps {
  remainingDays: number;
  daysColor: string;
  expireDate?: string;
  theme: DashboardTheme;
}

export default function RemainingDaysCard({
  remainingDays,
  daysColor,
  expireDate,
  theme: T,
}: RemainingDaysCardProps) {
  return (
    <View
      style={[
        styles.daysCard,
        { backgroundColor: T.card, borderColor: daysColor },
      ]}
    >
      <Text style={[styles.daysNumber, { color: daysColor }]}>
        {remainingDays}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.daysTitle, { color: daysColor }]}>
          {remainingDays === 0
            ? "Expires Today!"
            : `Day${remainingDays !== 1 ? "s" : ""} Remaining`}
        </Text>
        <Text style={[styles.daysSub, { color: T.textSecondary }]}>Expires on {expireDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  daysCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  daysNumber: {
    fontSize: 36,
    fontWeight: "900",
    width: 70,
    textAlign: "center",
  },
  daysTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  daysSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
