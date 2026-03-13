import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useMemberInfo } from "../context/MemberInfoContext";
import { fetchMemberLoginInfo } from "../api/member";
import { THEME_MALE, THEME_FEMALE } from "../components/dashboard/theme";
import { API_BASE_URL } from "../api/config";
import InfoRow from "../components/dashboard/InfoRow";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { accessToken, memberId } = useAuth();
  const { memberInfo, setMemberInfo, theme: T, setTheme } = useMemberInfo();
  const [loading, setLoading] = useState(!memberInfo);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!accessToken || !memberId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await fetchMemberLoginInfo(accessToken, memberId);
        setMemberInfo(data);
        const isFemale =
          data?.gender?.toLowerCase() === "female" ||
          data?.gender?.toLowerCase() === "f";
        setTheme(isFemale ? THEME_FEMALE : THEME_MALE);
      } catch {
        // ignore – will show empty state
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, memberId, setMemberInfo, setTheme]
  );

  useEffect(() => {
    if (!memberInfo) {
      loadData();
    }
  }, [memberInfo, loadData]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  if (!memberInfo) {
    return (
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        <Text style={{ color: T.textSecondary, textAlign: "center", marginTop: 40 }}>
          No member information available.
        </Text>
      </View>
    );
  }

  const hasImage =
    !!memberInfo.imageLoc &&
    memberInfo.imageLoc.trim().replace(/\/+$/, "") !== "Image/Members" &&
    memberInfo.imageLoc.trim().length > "Image/Members/".length;
  const imageUri = hasImage
    ? `${API_BASE_URL}/${memberInfo.imageLoc}`
    : null;

  // "sanjeev singh maharjan" → "Sanjeev Maharjan"
  const formatName = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    if (parts.length === 1) return cap(parts[0]);
    return `${cap(parts[0])} ${cap(parts[parts.length - 1])}`;
  };
  const displayName = formatName(memberInfo.fullname ?? "");

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={[styles.menuBtn, { borderColor: T.border }]}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Text style={[styles.menuIcon, { color: T.text }]}>{"\u2630"}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: T.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Image Section – fixed, not scrollable */}
      <View style={[styles.avatarSection, { backgroundColor: T.bg }]}>
        <View style={[styles.avatarRing, { borderColor: T.accent }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {memberInfo.fullname?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.fullName, { color: T.text }]}>
          {displayName}
        </Text>
        <Text style={[styles.memberId, { color: T.accent }]}>
          {memberInfo.memberId}
        </Text>
        {memberInfo.status && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  memberInfo.status.toLowerCase() === "active"
                    ? "#27ae60"
                    : "#e74c3c",
              },
            ]}
          >
            <Text style={styles.statusText}>
              {memberInfo.status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={T.accent} />
        }
      >
        {/* Personal Information Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: T.card, borderColor: T.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: T.accent }]}>
            Personal Information
          </Text>
          <View style={styles.divider} />
          <InfoRow label="Gender" value={memberInfo.gender} accent={T.accent} />
          <InfoRow
            label="DOB"
            value={memberInfo.dateOfBirth}
            accent={T.accent}
          />
          <InfoRow
            label="Contact"
            value={memberInfo.contactNo}
            accent={T.accent}
          />
          <InfoRow label="Email" value={memberInfo.email} accent={T.accent} />
          <InfoRow
            label="Address"
            value={memberInfo.address}
            accent={T.accent}
          />
          <InfoRow
            label="Emergency Contact"
            value={memberInfo.EmergencyContactPerson}
            accent={T.accent}
          />
          <InfoRow
            label="Emergency No."
            value={memberInfo.EmergencyContactPersonNumber}
            accent={T.accent}
          />
        </View>

        {/* Membership Information Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: T.card, borderColor: T.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: T.accent }]}>
            Membership Information
          </Text>
          <View style={styles.divider} />
          <InfoRow
            label="Type"
            value={memberInfo.memberOption}
            accent={T.accent}
          />
          <InfoRow
            label="Category"
            value={memberInfo.memberCatagory}
            accent={T.accent}
          />
          <InfoRow
            label="Sub-Category"
            value={memberInfo.memberSubCatagory}
            accent={T.accent}
          />
          <InfoRow label="Branch" value={memberInfo.branch} accent={T.accent} />
          <InfoRow label="Shift" value={memberInfo.shift} accent={T.accent} />
          <InfoRow
            label="Begin Date"
            value={memberInfo.memberBeginDate}
            accent={T.accent}
          />
          <InfoRow
            label="Expire Date"
            value={memberInfo.memberExpireDate}
            accent={T.accent}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarRing: {
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    backgroundColor: "#aaa",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "700",
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  memberId: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  card: {
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
