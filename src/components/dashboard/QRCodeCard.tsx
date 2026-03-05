import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { DashboardTheme } from "./theme";

interface QRCodeCardProps {
  memberId: string;
  theme: DashboardTheme;
}

export default function QRCodeCard({ memberId, theme: T }: QRCodeCardProps) {
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
          color={T.bg}
        />
      </View>
      <Text style={[styles.qrHint, { color: T.accent }]}>
        Always ask gym admin to scan your QR.
      </Text>
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
});
