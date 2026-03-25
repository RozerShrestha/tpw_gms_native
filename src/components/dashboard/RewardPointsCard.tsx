import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { DashboardTheme } from "./theme";
import { fetchRewardPoints } from "../../api/member";

interface RewardPointsCardProps {
  accessToken: string;
  memberId: string;
  theme: DashboardTheme;
  onPress: () => void;
}

export default function RewardPointsCard({
  accessToken,
  memberId,
  theme: T,
  onPress,
}: RewardPointsCardProps) {
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRewardPoints(accessToken, memberId);
      const sum = data.reduce((acc, item) => acc + item.Points, 0);
      setTotalPoints(sum);
    } catch {
      setTotalPoints(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, memberId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
        <ActivityIndicator size="small" color={T.accent} />
      </View>
    );
  }

  if (totalPoints === null) return null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: T.accent + "22" }]}>
          <Text style={styles.icon}>{"\u{1F3C6}"}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: T.textMuted }]}>Reward Points</Text>
          <Text style={[styles.points, { color: T.accent }]}>{totalPoints}</Text>
        </View>
        <Text style={[styles.arrow, { color: T.accent }]}>{"\u276F"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  points: {
    fontSize: 28,
    fontWeight: "900",
  },
  arrow: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
});
