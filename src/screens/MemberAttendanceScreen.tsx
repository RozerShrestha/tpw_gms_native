import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MemberAttendanceItem, {MemberAttendanceTable,} from "../components/MemberAttendanceItem";
import { useMemberInfo } from "../context/MemberInfoContext";
import { useAuth } from "../context/AuthContext";

/** Normalise dates like "Jun 16 2025 9:02AM" → "Jun 16, 2025 9:02 AM" */
function normaliseDate(raw: string): number {
  const s = raw
    .replace(/(\d{1,2})\s+(\d{4})/, "$1, $2")
    .replace(/(\d)(AM|PM)/i, "$1 $2");
  const ms = Date.parse(s);
  return isNaN(ms) ? 0 : ms;
}

/** Sort array by checkin date descending (latest first) */
function sortByCheckinDesc<T extends { checkin: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => normaliseDate(b.checkin) - normaliseDate(a.checkin));
}

export default function MemberAttendanceScreen() {
  const navigation = useNavigation<any>();
  const { memberInfo, theme: T } = useMemberInfo();
  const { role } = useAuth();
  const isGuest = role === "guest";

  const attendanceRecords = useMemo(
    () =>
      isGuest
        ? sortByCheckinDesc(memberInfo?.guestAttendance ?? [])
        : sortByCheckinDesc(memberInfo?.memberAttendances ?? []),
    [memberInfo?.memberAttendances, memberInfo?.guestAttendance, isGuest]
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
        <Text style={[styles.headerTitle, { color: T.text }]}>My Attendance</Text>
        <View style={[styles.countBadge, { backgroundColor: T.accent }]}>
          <Text style={styles.countText}>{attendanceRecords.length}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {attendanceRecords.length > 0 ? (
          <MemberAttendanceTable accentColor={T.accent} isGuest={isGuest} theme={T}>
            {attendanceRecords.map((item, index) => (
              <MemberAttendanceItem
                key={`att-${item.checkin}-${index}`}
                item={item}
                index={index}
                accentColor={T.accent}
                isGuest={isGuest}
                theme={T}
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
            <Text style={[styles.emptyText, { color: T.textMuted }]}>
              No attendance records found.
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
