import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";

interface HeaderBarProps {
  fullname?: string;
  isEmployee: boolean;
  isClient: boolean;
  memberStatus: string | null;
  statusColor: string;
  theme: DashboardTheme;
  onMenuPress?: () => void;
}

export default function HeaderBar({
  fullname,
  isEmployee,
  isClient,
  memberStatus,
  statusColor,
  theme: T,
  onMenuPress,
}: HeaderBarProps) {
  return (
    <View style={styles.headerBar}>
      {onMenuPress && (
        <TouchableOpacity
          style={[styles.menuBtn, { borderColor: T.border }]}
          onPress={onMenuPress}
        >
          <Text style={styles.menuIcon}>{"\u2630"}</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.headerName}>{fullname}</Text>
          {isClient && memberStatus && (
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: statusColor },
              ]}
            >
              <Text style={styles.roleBadgeText}>
                {memberStatus.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  menuIcon: {
    fontSize: 20,
    color: "#fff",
  },
  greeting: {
    fontSize: 14,
    color: "#888",
  },
  headerName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textTransform: "capitalize",
  },
  roleBadge: {
    alignSelf: "flex-start",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  logoutBtn: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    marginTop: 4,
  },
  logoutBtnText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 13,
  },
});
