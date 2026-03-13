import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MemberAttendance, GuestAttendance } from "../types/api";
import { DashboardTheme } from "./dashboard/theme";

type AttendanceRecord = MemberAttendance | GuestAttendance;

interface Props {
  item: AttendanceRecord;
  index: number;
  accentColor?: string;
  isGuest?: boolean;
  theme?: DashboardTheme;
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
  accentColor = "#C62828",
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
  accentColor = "#C62828",
  isGuest = false,
  theme,
}: {
  children: React.ReactNode;
  accentColor?: string;
  isGuest?: boolean;
  theme?: DashboardTheme;
}) {
  const isDark = theme?.isDark ?? true;
  return (
    <View style={[styles.tableOuter, { backgroundColor: theme ? theme.card : "#16213e", borderColor: theme ? theme.border : "#2a2a4a" }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header */}
          <View
            style={[styles.headerRow, { borderBottomColor: accentColor, backgroundColor: isDark ? "#0d1b2a" : "rgba(0,0,0,0.04)" }]}
          >
            <Text style={[styles.headerCell, styles.colNo, { color: theme ? theme.textSecondary : "#aaa" }]}>#</Text>
            {/* {!isGuest &&
            <Text style={[styles.headerCell, styles.colId]}>
              MemberId 
            </Text>
            } */}
            <Text style={[styles.headerCell, styles.colName, { color: theme ? theme.textSecondary : "#aaa" }]}>Name</Text>
            <Text style={[styles.headerCell, styles.colDate, { color: theme ? theme.textSecondary : "#aaa" }]}>Check-in</Text>
            <Text style={[styles.headerCell, styles.colBranch, { color: theme ? theme.textSecondary : "#aaa" }]}>Check-in Branch</Text>
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
  accentColor = "#C62828",
  isGuest = false,
  theme,
}: Props) {
  const isEven = index % 2 === 0;
  const isDark = theme?.isDark ?? true;
  const idValue = isGuest
    ? (item as GuestAttendance).email
    : (item as MemberAttendance).memberId;

  return (
    <View style={[styles.row, isEven ? { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" } : styles.rowOdd, theme && { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
      <Text style={[styles.cell, styles.colNo, { color: accentColor }]}>
        {index + 1}
      </Text>
      {/* {!isGuest && (
        <Text style={[styles.cell, styles.colId]} numberOfLines={1}>
          {idValue}
        </Text>
      )} */}
      <Text
        style={[styles.cell, styles.colName, { textTransform: "capitalize", color: theme ? theme.text : "#ddd" }]}
        numberOfLines={1}
      >
        {item.fullName}
      </Text>
      <Text style={[styles.cell, styles.colDate, { color: theme ? theme.text : "#ddd" }]} numberOfLines={1}>
        {shortDate(item.checkin)}
      </Text>
      <Text
        style={[styles.cell, styles.colBranch, { textTransform: "capitalize", color: theme ? theme.text : "#ddd" }]}
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
    borderRadius: 14,
    borderWidth: 1,
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
  },
  headerCell: {
    fontSize: 11,
    fontWeight: "800",
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
    fontWeight: "500",
  },
});
