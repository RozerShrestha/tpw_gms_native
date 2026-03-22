import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MemberRankInfo } from '../api/checkinService';

interface MemberRankCardProps {
  memberRank: MemberRankInfo | null;
}

const MemberRankCard: React.FC<MemberRankCardProps> = ({ memberRank }) => {
  if (!memberRank) {
    return (
      <View style={styles.card}>
        <Text style={styles.notFoundText}>Your rank not in top 10</Text>
      </View>
    );
  }

  const medalEmoji = 
    memberRank.MemberRank === 1 ? '🥇' :
    memberRank.MemberRank === 2 ? '🥈' :
    memberRank.MemberRank === 3 ? '🥉' : '⭐';

  return (
    <View style={[styles.card, styles.rankCard]}>
      <View style={styles.medalContainer}>
        <Text style={styles.medal}>{medalEmoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.rankLabel}>YOUR RANK</Text>
        <Text style={styles.rankNumber}>#{memberRank.MemberRank}</Text>
        <Text style={styles.checkinCount}>
          {memberRank.TotalCheckins} Check-ins
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  medalContainer: {
    marginRight: 16,
  },
  medal: {
    fontSize: 48,
  },
  content: {
    flex: 1,
  },
  rankLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  rankNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6366f1',
    marginVertical: 4,
  },
  checkinCount: {
    fontSize: 14,
    color: '#666',
  },
  notFoundText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default MemberRankCard;
