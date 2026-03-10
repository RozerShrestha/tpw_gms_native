import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MemberAttendance, GuestAttendance } from "../types/api";

type AttendanceRecord = MemberAttendance | GuestAttendance;

interface Props {
  item: AttendanceRecord;
  index: number;
  accentColor?: string;
  isGuest?: boolean;
}

/** Shorten "Mon, 19 January 2026" → "19 Jan 2026" */
function shortDate(raw: string): string {
  if (!raw) return "-";
  // Remove day name prefix like "Mon, "
  const cleaned = raw.replace(/^[A-Za-z]+,\s*/, "");
  const parts = cleaned.split(" ");
  if (parts.length === 3) {
    return `${parts[0]} ${parts[1].substring(0, 3)} ${parts[2]}`;
  }
  return cleaned;
}

/** Table header row – render once above the list */
export function MemberAttendanceTableHeader({
  accentColor = "#FF6B35",
  isGuest = false,
}: {
  accentColor?: string;
  isGuest?: boolean;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.headerRow, { borderBottomColor: accentColor }]}>
        <Text style={[styles.headerCell, styles.colNo]}>#</Text>
        {/* <Text style={[styles.headerCell, styles.colId]}>
          {isGuest ? "Email" : "Member ID"}
        </Text> */}
        <Text style={[styles.headerCell, styles.colName]}>Name</Text>
        <Text style={[styles.headerCell, styles.colDate]}>Check-in</Text>
        <Text style={[styles.headerCell, styles.colBranch]}>Check-in Branch</Text>
      </View>
    </ScrollView>
  );
}

/** Scrollable wrapper for the whole table (header + rows) */
export function MemberAttendanceTable({
  children,
  accentColor = "#FF6B35",
  isGuest = false,
}: {
  children: React.ReactNode;
  accentColor?: string;
  isGuest?: boolean;
}) {
  return (
    <View style={styles.tableOuter}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header */}
          <View
            style={[styles.headerRow, { borderBottomColor: accentColor }]}
          >
            <Text style={[styles.headerCell, styles.colNo]}>#</Text>
            {/* {!isGuest &&
            <Text style={[styles.headerCell, styles.colId]}>
              MemberId 
            </Text>
            } */}
            <Text style={[styles.headerCell, styles.colName]}>Name</Text>
            <Text style={[styles.headerCell, styles.colDate]}>Check-in</Text>
            <Text style={[styles.headerCell, styles.colBranch]}>Check-in Branch</Text>
          </View>
          {/* Rows */}
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export default function MemberAttendanceItem({
  item,
  index,
  accentColor = "#FF6B35",
  isGuest = false,
}: Props) {
  const isEven = index % 2 === 0;
  const idValue = isGuest
    ? (item as GuestAttendance).email
    : (item as MemberAttendance).memberId;

  return (
    <View style={[styles.row, isEven ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.cell, styles.colNo, { color: accentColor }]}>
        {index + 1}
      </Text>
      {/* {!isGuest && (
        <Text style={[styles.cell, styles.colId]} numberOfLines={1}>
          {idValue}
        </Text>
      )} */}
      <Text
        style={[styles.cell, styles.colName, { textTransform: "capitalize" }]}
        numberOfLines={1}
      >
        {item.fullName}
      </Text>
      <Text style={[styles.cell, styles.colDate]} numberOfLines={1}>
        {shortDate(item.checkin)}
      </Text>
      <Text
        style={[styles.cell, styles.colBranch, { textTransform: "capitalize" }]}
        numberOfLines={1}
      >
        {item.checkinBranch || "-"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ---- table wrapper ---- */
  tableOuter: {
    backgroundColor: "#16213e",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    overflow: "hidden",
  },

  /* ---- column widths ---- */
  colNo: { width: 40, textAlign: "center" },
  colId: { width: 140 },
  colName: { width: 150 },
  colDate: { width: 170 },
  colBranch: { width: 140 },

  /* ---- header ---- */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    backgroundColor: "#0d1b2a",
  },
  headerCell: {
    fontSize: 11,
    fontWeight: "800",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* ---- data row ---- */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  rowEven: { backgroundColor: "rgba(255,255,255,0.03)" },
  rowOdd: { backgroundColor: "transparent" },
  cell: {
    fontSize: 13,
    color: "#ddd",
    fontWeight: "500",
  },
});
