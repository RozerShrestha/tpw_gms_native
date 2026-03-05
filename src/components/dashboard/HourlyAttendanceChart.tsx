import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Svg, { Rect, Text as SvgText, Line } from "react-native-svg";
import { DashboardTheme } from "./theme";
import { HourlyAttendance } from "../../types/api";
import { fetchHourlyAttendance } from "../../api/member";

interface HourlyAttendanceChartProps {
  accessToken: string;
  branch: string;
  theme: DashboardTheme;
}

/** Build array of last N days as { label, shortLabel, dateStr, isToday } */
function buildDateOptions(count = 7): {
  label: string;
  shortLabel: string;
  dateStr: string;
  isToday: boolean;
}[] {
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const days: { label: string; shortLabel: string; dateStr: string; isToday: boolean }[] = [];
  const now = new Date();
  let collected = 0;
  let offset = 0;
  while (collected < count) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    offset++;
    // Skip Saturdays (day 6)
    if (d.getDay() === 6) continue;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.push({
      label: collected === 0 ? "Today" : `${DAY_NAMES[d.getDay()]}`,
      shortLabel: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
      dateStr: `${yyyy}-${mm}-${dd}`,
      isToday: collected === 0,
    });
    collected++;
  }
  // Reverse so oldest is on the left, today on the right
  return days.reverse();
}

/** Format hour (0-23) to readable label like "6AM", "1PM" */
function formatHour(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return "12PM";
  return `${hour - 12}PM`;
}

// ─── Branch color palette ────────────────────────────────
const BRANCH_COLORS = [
  "#FF6B35", // orange
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#34d399", // emerald
  "#f472b6", // pink
  "#facc15", // yellow
  "#fb923c", // amber
  "#60a5fa", // blue
];

// ─── Fixed chart sizing ──────────────────────────────────
const SUB_BAR_WIDTH = 14;
const SUB_BAR_GAP = 2;
const GROUP_GAP = 14;
const CHART_HEIGHT = 180;
const PADDING_LEFT = 30;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 28;
const DRAWABLE_HEIGHT = CHART_HEIGHT - PADDING_BOTTOM - PADDING_TOP;

export default function HourlyAttendanceChart({
  accessToken,
  branch,
  theme: T,
}: HourlyAttendanceChartProps) {
  const dateOptions = useMemo(() => buildDateOptions(7), []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[dateOptions.length - 1].dateStr);
  const [data, setData] = useState<HourlyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchHourlyAttendance(accessToken, branch, selectedDate);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load attendance data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, branch, selectedDate]);

  const selectedOption = dateOptions.find((d) => d.dateStr === selectedDate);

  // ─── Derive branches, hours, grouped data ──────────────
  const branches = useMemo(() => {
    const set = new Set<string>();
    for (const e of data) set.add(e.branch);
    return Array.from(set).sort();
  }, [data]);

  const branchColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b, i) => {
      map[b] = BRANCH_COLORS[i % BRANCH_COLORS.length];
    });
    return map;
  }, [branches]);

  const hours = useMemo(() => {
    const set = new Set<number>();
    for (const e of data) set.add(e.HourOfDay);
    return Array.from(set).sort((a, b) => a - b);
  }, [data]);

  // Map: hour -> branch -> count
  const grouped = useMemo(() => {
    const map = new Map<number, Map<string, number>>();
    for (const e of data) {
      if (!map.has(e.HourOfDay)) map.set(e.HourOfDay, new Map());
      map.get(e.HourOfDay)!.set(e.branch, e.NumberOfCheckins);
    }
    return map;
  }, [data]);

  const branchCount = branches.length;
  const groupWidth =
    branchCount * SUB_BAR_WIDTH + (branchCount - 1) * SUB_BAR_GAP;
  const svgWidth =
    hours.length > 0
      ? PADDING_LEFT + hours.length * (groupWidth + GROUP_GAP) + 8
      : 200;

  const maxCheckins = useMemo(
    () =>
      data.length > 0
        ? Math.max(...data.map((d) => d.NumberOfCheckins))
        : 0,
    [data]
  );
  const yMax = maxCheckins <= 5 ? 5 : Math.ceil(maxCheckins / 5) * 5;

  const totalCheckins = data.reduce((sum, d) => sum + d.NumberOfCheckins, 0);

  // Peak entry (single record)
  const peakEntry =
    data.length > 0
      ? data.reduce((a, b) =>
          b.NumberOfCheckins > a.NumberOfCheckins ? b : a
        )
      : null;

  const yTicks = [0, 1, 2, 3, 4, 5].map((i) => Math.round((yMax / 5) * i));

  return (
    <View
      style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>📊</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: "#fff" }]}>
            {selectedOption?.isToday
              ? "Today's Gym Traffic"
              : `Gym Traffic · ${selectedOption?.shortLabel}`}
          </Text>
          <Text style={styles.subtitle}>Hourly check-ins · swipe to scroll</Text>
        </View>
        {!loading && !error && (
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: T.accentLight }]}>
              <Text style={[styles.badgeText, { color: T.accent }]}>
                {totalCheckins} total
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Date selector bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateBarContainer}
        style={styles.dateBarScroll}
      >
        {dateOptions.map((opt) => {
          const isActive = opt.dateStr === selectedDate;
          return (
            <TouchableOpacity
              key={opt.dateStr}
              onPress={() => setSelectedDate(opt.dateStr)}
              activeOpacity={0.7}
              style={[
                styles.dateChip,
                isActive && {
                  backgroundColor: T.accent,
                  borderColor: T.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.dateChipLabel,
                  isActive && styles.dateChipLabelActive,
                ]}
              >
                {opt.label}
              </Text>
              <Text
                style={[
                  styles.dateChipDate,
                  isActive && styles.dateChipDateActive,
                ]}
              >
                {opt.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Loading / Error / Chart */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={T.accent} />
          <Text style={styles.loadingText}>Loading traffic data...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>
          No check-ins recorded{selectedOption?.isToday ? " today" : ` on ${selectedOption?.shortLabel}`}
        </Text>
      ) : (
        <>
          {/* Branch legend */}
          {branches.length > 1 && (
            <View style={styles.legendRow}>
              {branches.map((b) => (
                <View key={b} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: branchColorMap[b] },
                    ]}
                  />
                  <Text style={styles.legendText}>{b}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Horizontally scrollable chart */}
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={styles.scrollContent}
          >
            <Svg width={svgWidth} height={CHART_HEIGHT}>
              {/* Y-axis grid lines */}
              {yTicks.map((tick, i) => {
                const y =
                  PADDING_TOP +
                  DRAWABLE_HEIGHT -
                  (tick / yMax) * DRAWABLE_HEIGHT;
                return (
                  <React.Fragment key={`grid-${i}`}>
                    <Line
                      x1={PADDING_LEFT}
                      y1={y}
                      x2={svgWidth - 4}
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={1}
                    />
                    <SvgText
                      x={PADDING_LEFT - 6}
                      y={y + 4}
                      fontSize={9}
                      fill="rgba(255,255,255,0.35)"
                      textAnchor="end"
                    >
                      {tick}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Grouped bars per hour */}
              {hours.map((hour, hi) => {
                const groupX =
                  PADDING_LEFT + hi * (groupWidth + GROUP_GAP);
                const branchMap = grouped.get(hour)!;

                return (
                  <React.Fragment key={hour}>
                    {branches.map((b, bi) => {
                      const count = branchMap.get(b) ?? 0;
                      const barHeight =
                        yMax > 0
                          ? (count / yMax) * DRAWABLE_HEIGHT
                          : 0;
                      const x =
                        groupX + bi * (SUB_BAR_WIDTH + SUB_BAR_GAP);
                      const y = PADDING_TOP + DRAWABLE_HEIGHT - barHeight;

                      return (
                        <React.Fragment key={`${hour}-${b}`}>
                          <Rect
                            x={x}
                            y={y}
                            width={SUB_BAR_WIDTH}
                            height={Math.max(barHeight, count > 0 ? 2 : 0)}
                            rx={3}
                            fill={branchColorMap[b]}
                            opacity={
                              peakEntry &&
                              peakEntry.HourOfDay === hour &&
                              peakEntry.branch === b
                                ? 1
                                : 0.75
                            }
                          />
                          {count > 0 && (
                            <SvgText
                              x={x + SUB_BAR_WIDTH / 2}
                              y={y - 4}
                              fontSize={7}
                              fill="rgba(255,255,255,0.7)"
                              textAnchor="middle"
                              fontWeight="600"
                            >
                              {count}
                            </SvgText>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {/* X-axis hour label */}
                    <SvgText
                      x={groupX + groupWidth / 2}
                      y={CHART_HEIGHT - 6}
                      fontSize={9}
                      fill="rgba(255,255,255,0.45)"
                      textAnchor="middle"
                    >
                      {formatHour(hour)}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </ScrollView>

          {/* Scroll hint fade (visual cue) */}
          <View
            style={[
              styles.scrollFade,
              { backgroundColor: T.card },
            ]}
            pointerEvents="none"
          />

          {/* Peak hour info */}
          {peakEntry && (
            <View style={styles.peakRow}>
              <Text style={styles.peakIcon}>🔥</Text>
              <Text style={styles.peakText}>
                Peak:{" "}
                <Text style={{ color: branchColorMap[peakEntry.branch] ?? T.accent, fontWeight: "700" }}>
                  {peakEntry.branch}
                </Text>{" "}
                at{" "}
                <Text style={{ color: T.accent, fontWeight: "700" }}>
                  {formatHour(peakEntry.HourOfDay)}
                </Text>{" "}
                —{" "}
                <Text style={{ color: T.accent, fontWeight: "700" }}>
                  {peakEntry.NumberOfCheckins}
                </Text>{" "}
                check-ins
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateBarScroll: {
    marginBottom: 12,
  },
  dateBarContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  dateChip: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    minWidth: 54,
  },
  dateChipLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dateChipLabelActive: {
    color: "#fff",
  },
  dateChipDate: {
    fontSize: 9,
    color: "rgba(255,255,255,0.35)",
    marginTop: 1,
  },
  dateChipDateActive: {
    color: "rgba(255,255,255,0.85)",
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: "row",
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    textTransform: "capitalize",
  },
  scrollContent: {
    paddingRight: 16,
  },
  scrollFade: {
    position: "absolute",
    right: 0,
    top: 50,
    bottom: 50,
    width: 24,
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    textAlign: "center",
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    paddingVertical: 20,
  },
  peakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  peakIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  peakText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },
});
