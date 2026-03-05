import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";
import MemberAttendanceItem, {
  MemberAttendanceTable,
} from "../MemberAttendanceItem";
import { MemberAttendance } from "../../types/api";

/** Normalise dates like "Jun 16 2025 9:02AM" → "Jun 16, 2025 9:02 AM" */
function normaliseDate(raw: string): number {
  const s = raw
    .replace(/(\d{1,2})\s+(\d{4})/, "$1, $2")   // add comma: "Jun 16 2025" → "Jun 16, 2025"
    .replace(/(\d)(AM|PM)/i, "$1 $2");            // add space before AM/PM
  const ms = Date.parse(s);
  return isNaN(ms) ? 0 : ms;
}

/** Sort array by checkin date descending (latest first) */
function sortByCheckinDesc<T extends { checkin: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => normaliseDate(b.checkin) - normaliseDate(a.checkin));
}

interface ClientAttendanceSectionProps {
  memberAttendances: MemberAttendance[];
  theme: DashboardTheme;
}

export default function ClientAttendanceSection({
  memberAttendances,
  theme: T,
}: ClientAttendanceSectionProps) {
  const sorted = useMemo(
    () => sortByCheckinDesc(memberAttendances),
    [memberAttendances]
  );
  return (
    <>
      <Text
        style={[styles.attendanceTitle, { color: T.accent, marginTop: 8 }]}
      >
        &#x1F4CB;  My Attendance
      </Text>
      {sorted.length > 0 ? (
        <MemberAttendanceTable accentColor={T.accent}>
          {sorted.map((item, index) => (
            <MemberAttendanceItem
              key={`att-${item.checkin}-${index}`}
              item={item}
              index={index}
              accentColor={T.accent}
            />
          ))}
        </MemberAttendanceTable>
      ) : (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: T.card, borderColor: T.border },
          ]}
        >
          <Text style={styles.emptyIcon}>&#x1F4AD;</Text>
          <Text style={styles.emptyText}>No attendance records found.</Text>
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
    color: "#666",
  },
});
