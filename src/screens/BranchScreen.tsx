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
          <Text style={styles.menuIcon}>{"\u2630"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Branches</Text>
        <View style={{ width: 40 }} />
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
            <Text style={styles.emptyText}>No branch information available.</Text>
          </View>
        ) : (
          branches.map((branch, index) => (
            <View
              key={index}
              style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}
            >
              {/* Branch Name */}
              <View style={styles.cardHeader}>
                <Text style={styles.branchIcon}>📍</Text>
                <Text style={[styles.branchName, { color: T.accent }]}>
                  {capitalize(branch.firstname)}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Phone */}
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => callPhone(branch.PhoneNumber)}
                activeOpacity={0.7}
              >
                <Text style={styles.infoIcon}>📞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={[styles.infoValue, { color: T.accent }]}>
                    {branch.PhoneNumber}
                  </Text>
                </View>
                <Text style={styles.actionIcon}>→</Text>
              </TouchableOpacity>

              {/* Map */}
              <TouchableOpacity
                style={[styles.mapBtn, { backgroundColor: T.accent }]}
                onPress={() => openMap(branch.latitude, branch.longitude, branch.firstname)}
                activeOpacity={0.7}
              >
                <Text style={styles.mapBtnText}>🗺️  View on Map</Text>
              </TouchableOpacity>
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
    color: "#fff",
    fontSize: 22,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  branchIcon: {
    fontSize: 20,
  },
  branchName: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a4a",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  actionIcon: {
    fontSize: 16,
    color: "#888",
  },
  mapBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  mapBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
