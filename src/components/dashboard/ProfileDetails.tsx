import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DashboardTheme } from "./theme";
import InfoRow from "./InfoRow";
import { MemberLoginInfo } from "../../types/api";

interface ProfileDetailsProps {
  memberInfo: MemberLoginInfo;
  theme: DashboardTheme;
}

export default function ProfileDetails({
  memberInfo,
  theme: T,
}: ProfileDetailsProps) {
  return (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: T.card, borderColor: T.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: T.accent }]}>
        &#x1F464;  Profile Details
      </Text>
      <View style={styles.divider} />
      <InfoRow label="Member ID" value={memberInfo.memberId} accent={T.accent} />
      <InfoRow label="Type" value={memberInfo.memberOption} accent={T.accent} />
      <InfoRow label="Category" value={memberInfo.memberCatagory} accent={T.accent} />
      <InfoRow label="Sub-Category" value={memberInfo.memberSubCatagory} accent={T.accent} />
      <InfoRow label="Gender" value={memberInfo.gender} accent={T.accent} />
      <InfoRow label="DOB" value={memberInfo.dateOfBirth} accent={T.accent} />
      <InfoRow label="Contact" value={memberInfo.contactNo} accent={T.accent} />
      <InfoRow label="Email" value={memberInfo.email} accent={T.accent} />
      <InfoRow label="Address" value={memberInfo.address} accent={T.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
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
});
