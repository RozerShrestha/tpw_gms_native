import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { DashboardTheme } from "./theme";

interface QRCodeCardProps {
  memberId: string;
  theme: DashboardTheme;
  isEmployee?: boolean;
  refreshingQR?: boolean;
  onRefreshQR?: () => void;
}

export default function QRCodeCard({ memberId, theme: T, isEmployee, refreshingQR, onRefreshQR }: QRCodeCardProps) {
  return (
    <View
      style={[
        styles.qrCard,
        { backgroundColor: T.card, borderColor: T.border },
      ]}
    >
      <View style={styles.qrInner}>
        <QRCode
          value={memberId}
          size={160}
          backgroundColor="#fff"
          color="#000"
        />
      </View>
      {isEmployee && onRefreshQR ? (
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: T.accent }]}
          onPress={onRefreshQR}
          disabled={refreshingQR}
          activeOpacity={0.7}
        >
          {refreshingQR ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.refreshBtnText}>Refresh QR</Text>
          )}
        </TouchableOpacity>
      ) : (
        <Text style={[styles.qrHint, { color: T.accent }]}>
          Always ask gym admin to scan your QR.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  qrCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  qrInner: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  qrHint: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
    lineHeight: 18,
  },
  refreshBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  refreshBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
