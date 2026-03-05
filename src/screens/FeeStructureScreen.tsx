import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useMemberInfo } from "../context/MemberInfoContext";
import { fetchFeeStructure } from "../api/member";
import { FeeStructureItem } from "../types/api";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { THEME_MALE } from "../components/dashboard/theme";
import type { DashboardTheme } from "../components/dashboard/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Group fee items by membershipOption ─────────────────────
function groupByOption(
  items: FeeStructureItem[]
): Record<string, FeeStructureItem[]> {
  const groups: Record<string, FeeStructureItem[]> = {};
  for (const item of items) {
    const key = item.membershipOption;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

// ─── Determine if a group uses monthly columns or oneTenDays ─
function isPerDayGroup(items: FeeStructureItem[]): boolean {
  return items.every(
    (i) =>
      (!i.oneMonth || i.oneMonth === "" || i.oneMonth === "-") &&
      (!i.threeMonth || i.threeMonth === "" || i.threeMonth === "-") &&
      (!i.sixMonth || i.sixMonth === "" || i.sixMonth === "-") &&
      (!i.twelveMonth || i.twelveMonth === "" || i.twelveMonth === "-") &&
      i.oneTenDays !== "" &&
      i.oneTenDays !== "-"
  );
}

// ─── Format price ────────────────────────────────────────────
function formatPrice(val: string): string {
  if (!val || val === "" || val === "-") return "-";
  const num = Number(val);
  if (isNaN(num)) return val;
  return "₹" + num.toLocaleString("en-IN");
}

// ─── Option icon ─────────────────────────────────────────────
function getOptionIcon(option: string): string {
  const lower = option.toLowerCase();
  if (lower.includes("regular")) return "🏋️";
  if (lower.includes("offhour") || lower.includes("off hour")) return "🌙";
  if (lower.includes("universal")) return "🌐";
  if (lower.includes("perday") || lower.includes("per day")) return "📅";
  if (lower.includes("tenday") || lower.includes("ten day")) return "🔟";
  if (lower.includes("personal")) return "🎯";
  if (lower.includes("locker")) return "🔒";
  return "💰";
}

// ─── Monthly columns for a group ─────────────────────────────
function MonthlyTable({
  items,
  theme: T,
}: {
  items: FeeStructureItem[];
  theme: DashboardTheme;
}) {
  const columns = [
    { key: "oneMonth" as const, label: "1 Mo" },
    { key: "threeMonth" as const, label: "3 Mo" },
    { key: "sixMonth" as const, label: "6 Mo" },
    { key: "twelveMonth" as const, label: "12 Mo" },
  ];

  return (
    <View>
      {/* Header row */}
      <View style={[tableStyles.row, { backgroundColor: T.accent + "22" }]}>
        <View style={tableStyles.typeCell}>
          <Text style={[tableStyles.headerText, { color: T.accent }]}>
            Type
          </Text>
        </View>
        {columns.map((col) => (
          <View key={col.key} style={tableStyles.priceCell}>
            <Text style={[tableStyles.headerText, { color: T.accent }]}>
              {col.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Data rows */}
      {items.map((item, idx) => (
        <View
          key={item.feeId}
          style={[
            tableStyles.row,
            idx % 2 === 1 && { backgroundColor: "rgba(255,255,255,0.03)" },
          ]}
        >
          <View style={tableStyles.typeCell}>
            <Text style={tableStyles.typeText}>{item.membershipType}</Text>
          </View>
          {columns.map((col) => (
            <View key={col.key} style={tableStyles.priceCell}>
              <Text
                style={[
                  tableStyles.priceText,
                  item[col.key] && item[col.key] !== "" && item[col.key] !== "-"
                    ? { color: "#fff" }
                    : { color: "rgba(255,255,255,0.3)" },
                ]}
              >
                {formatPrice(item[col.key])}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Per-day / 10-day table ──────────────────────────────────
function PerDayTable({
  items,
  theme: T,
}: {
  items: FeeStructureItem[];
  theme: DashboardTheme;
}) {
  return (
    <View>
      {/* Header */}
      <View style={[tableStyles.row, { backgroundColor: T.accent + "22" }]}>
        <View style={[tableStyles.typeCell, { flex: 1 }]}>
          <Text style={[tableStyles.headerText, { color: T.accent }]}>
            Type
          </Text>
        </View>
        <View style={[tableStyles.priceCell, { flex: 1 }]}>
          <Text style={[tableStyles.headerText, { color: T.accent }]}>
            Price
          </Text>
        </View>
      </View>

      {items.map((item, idx) => (
        <View
          key={item.feeId}
          style={[
            tableStyles.row,
            idx % 2 === 1 && { backgroundColor: "rgba(255,255,255,0.03)" },
          ]}
        >
          <View style={[tableStyles.typeCell, { flex: 1 }]}>
            <Text style={tableStyles.typeText}>{item.membershipType}</Text>
          </View>
          <View style={[tableStyles.priceCell, { flex: 1 }]}>
            <Text style={[tableStyles.priceText, { color: "#fff" }]}>
              {formatPrice(item.oneTenDays)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ═════════════════════════════════════════════════════════════
export default function FeeStructureScreen() {
  const { accessToken } = useAuth();
  const { theme } = useMemberInfo();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const T = theme ?? THEME_MALE;

  const [data, setData] = useState<FeeStructureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!accessToken) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const result = await fetchFeeStructure(accessToken);
        setData(result);
      } catch (e: any) {
        setError(e.message ?? "Failed to load fee structure");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const grouped = groupByOption(data);
  const optionKeys = Object.keys(grouped);

  // ─── Render ──────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity
          style={[styles.menuBtn, { borderColor: T.border }]}
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>{"\u2630"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fee Structure</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={T.accent} />
          <Text style={styles.loadingText}>Loading fee structure…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: T.accent }]}
            onPress={() => load()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={T.accent}
              colors={[T.accent]}
            />
          }
        >
          {optionKeys.map((option) => {
            const items = grouped[option];
            const perDay = isPerDayGroup(items);
            const icon = getOptionIcon(option);

            return (
              <View
                key={option}
                style={[
                  styles.card,
                  { backgroundColor: T.card, borderColor: T.border },
                ]}
              >
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{icon}</Text>
                  <Text style={[styles.cardTitle, { color: T.accent }]}>
                    {option}
                  </Text>
                </View>

                {/* Table */}
                {perDay ? (
                  <PerDayTable items={items} theme={T} />
                ) : (
                  <MonthlyTable items={items} theme={T} />
                )}
              </View>
            );
          })}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Table styles ────────────────────────────────────────────
const tableStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  typeCell: {
    flex: 0.9,
    paddingRight: 4,
  },
  priceCell: {
    flex: 0.7,
    alignItems: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  priceText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

// ─── Screen styles ───────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
  },
  menuIcon: {
    fontSize: 20,
    color: "#fff",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginTop: 12,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
