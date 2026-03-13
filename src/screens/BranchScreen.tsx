import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useMemberInfo } from "../context/MemberInfoContext";
import { fetchBranchInformation } from "../api/member";
import { BranchInfo } from "../types/api";

export default function BranchScreen() {
  const navigation = useNavigation();
  const { accessToken } = useAuth();
  const { theme: T } = useMemberInfo();
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const data = await fetchBranchInformation(accessToken);
        setBranches(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openMap = (lat: string, lng: string, name: string) => {
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${lat},${lng}(${encodeURIComponent(name)})`
        : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

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
        <Text style={[styles.headerTitle, { color: T.text }]}>Our Branches</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Branch Count */}
      <View style={styles.countRow}>
        <View style={[styles.countBadge, { backgroundColor: T.accentLight }]}>
          <Text style={[styles.countText, { color: T.accent }]}>
            {branches.length} {branches.length === 1 ? "Location" : "Locations"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={T.accent}
          />
        }
      >
        {branches.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={[styles.emptyText, { color: T.textSecondary }]}>No branch information available.</Text>
          </View>
        ) : (
          branches.map((branch, index) => (
              <View
                key={index}
                style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}
              >
                {/* Accent strip */}
                <View style={[styles.accentStrip, { backgroundColor: T.accent }]} />

                {/* Branch Header */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.branchBadge, { backgroundColor: T.accent + "20" }]}>
                      <Text style={[styles.branchBadgeText, { color: T.accent }]}>
                        {capitalize(branch.firstname).charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.branchName, { color: T.text }]}>
                        {capitalize(branch.firstname)}
                      </Text>
                      <Text style={[styles.branchSub, { color: T.accent }]}>
                        Branch {index + 1}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    {/* Call Button */}
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#27ae60" + "18", borderColor: "#27ae60" + "44" }]}
                      onPress={() => callPhone(branch.PhoneNumber)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnIcon}>📞</Text>
                      <View>
                        <Text style={styles.actionBtnLabel}>Call Now</Text>
                        <Text style={[styles.actionBtnValue, { color: "#27ae60" }]}>
                          {branch.PhoneNumber}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Map Button */}
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: T.accent + "18", borderColor: T.accent + "44" }]}
                      onPress={() => openMap(branch.latitude, branch.longitude, branch.firstname)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnIcon}>🗺️</Text>
                      <View>
                        <Text style={styles.actionBtnLabel}>Directions</Text>
                        <Text style={[styles.actionBtnValue, { color: T.accent }]}>
                          View on Map
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
          ))
        )}

        <View style={{ height: 32 }} />
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
  countRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  countBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  accentStrip: {
    height: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  branchBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  branchBadgeText: {
    fontSize: 20,
    fontWeight: "800",
  },
  branchName: {
    fontSize: 17,
    fontWeight: "700",
  },
  branchSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnIcon: {
    fontSize: 20,
  },
  actionBtnLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionBtnValue: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
});
