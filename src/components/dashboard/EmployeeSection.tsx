import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";
import AttendanceItem from "../AttendanceItem";
import { StaffAttendance } from "../../types/api";

interface EmployeeSectionProps {
  staffAttendance: StaffAttendance[];
  theme: DashboardTheme;
}

export default function EmployeeSection({
  staffAttendance,
  theme: T,
}: EmployeeSectionProps) {
  return (
    <>
      <Text style={[styles.attendanceTitle, { color: T.accent }]}>
        &#x1F4CB;  Staff Attendance
      </Text>
      {staffAttendance.length > 0 ? (
        staffAttendance.map((item, index) => (
          <AttendanceItem
            key={`staff-${item.checkin}-${index}`}
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
          <Text style={styles.emptyText}>
            No staff attendance records found.
          </Text>
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
