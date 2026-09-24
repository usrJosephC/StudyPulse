import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { colors, fonts, radius, spacing } from '../theme';
import { currentUser, squad, squadActivity } from '../data/mockData';

const podiumOrder = [2, 1, 3];

const fullLeaderboard = [...squad.podium, ...squad.rest].sort((a, b) => a.rank - b.rank);

export function GroupsScreen() {
  const podiumById = Object.fromEntries(squad.podium.map((p) => [p.rank, p]));
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={currentUser.initial} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.centered}>
          <Pill label="STUDY SQUAD" variant="secondary" icon={<Ionicons name="people" size={12} color="#fff" />} />
          <Text style={styles.squadName}>{squad.name}</Text>
          <Text style={styles.squadSubtitle}>{squad.subtitle}</Text>
        </View>

        <Card>
          <View style={styles.rankingHeader}>
            <View style={styles.rankingHeaderLeft}>
              <Ionicons name="bar-chart" size={18} color={colors.primary} />
              <Text style={styles.rankingTitle}>Weekly Ranking</Text>
            </View>
            <Pill label={`Ends in ${squad.endsIn}`} variant="muted" />
          </View>

          <View style={styles.podiumRow}>
            {podiumOrder.map((rank) => {
              const member = podiumById[rank];
              return (
                <View key={member.id} style={styles.podiumMember}>
                  {rank === 1 && <Ionicons name="star" size={16} color={colors.primary} style={styles.podiumStar} />}
                  <Avatar label={member.initial} size={rank === 1 ? 64 : 52} ringColor={rank === 1 ? colors.primary : undefined} />
                  <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={10} color={colors.primary} />
                    <Text style={styles.streakBadgeText}>{member.streakDays}</Text>
                  </View>
                  <Text style={styles.podiumName}>{member.name}</Text>
                  <View
                    style={[
                      styles.podiumBar,
                      rank === 1 ? styles.podiumBar1 : rank === 2 ? styles.podiumBar2 : styles.podiumBar3,
                    ]}
                  >
                    <Text style={styles.podiumRank}>{rank}</Text>
                    <Text style={styles.podiumPoints}>{member.points}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.restList}>
            {squad.rest.map((member) => (
              <View key={member.id} style={[styles.restRow, member.isYou && styles.restRowActive]}>
                <Text style={styles.restRank}>{member.rank}</Text>
                <Avatar label={member.initial} size={36} />
                <View style={styles.flexFill}>
                  <Text style={styles.restName}>{member.name}</Text>
                  <View style={styles.restStreak}>
                    <Ionicons name="flame" size={11} color={colors.primary} />
                    <Text style={styles.restStreakText}>{member.streakDays} days</Text>
                  </View>
                </View>
                <Text style={styles.restPoints}>{member.points}</Text>
              </View>
            ))}
          </View>

          <View style={styles.viewAllWrap}>
            <Pressable
              style={styles.viewAllButton}
              onPress={() => setLeaderboardVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="View full leaderboard"
            >
              <Text style={styles.viewAllLabel}>View Full Leaderboard</Text>
            </Pressable>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Squad Activity</Text>
        <View style={styles.activityList}>
          {squadActivity.map((activity) => (
            <Card key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon} size={18} color={colors.secondary} />
              </View>
              <View style={styles.flexFill}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.timeAgo}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={leaderboardVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLeaderboardVisible(false)}
      >
        <View style={styles.backdrop}>
          <SafeAreaView style={styles.leaderboardModal} edges={['bottom']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Full Leaderboard</Text>
              <Pressable
                onPress={() => setLeaderboardVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close leaderboard"
                hitSlop={8}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalList}>
                {fullLeaderboard.map((member) => (
                  <View key={member.id} style={[styles.restRow, member.id === 'you' && styles.restRowActive]}>
                    <Text style={styles.restRank}>{member.rank}</Text>
                    <Avatar label={member.initial} size={36} />
                    <View style={styles.flexFill}>
                      <Text style={styles.restName}>{member.id === 'you' ? 'You' : member.name}</Text>
                      <View style={styles.restStreak}>
                        <Ionicons name="flame" size={11} color={colors.primary} />
                        <Text style={styles.restStreakText}>{member.streakDays} days</Text>
                      </View>
                    </View>
                    <Text style={styles.restPoints}>{member.points}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  squadName: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 24,
    color: colors.ink,
  },
  squadSubtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkMuted,
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankingTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 15,
    color: colors.ink,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
  },
  podiumMember: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  podiumStar: {
    marginBottom: spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: -10,
  },
  streakBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.ink,
  },
  podiumName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  podiumBar: {
    width: '90%',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  podiumBar1: {
    height: 110,
    backgroundColor: colors.primarySoft,
  },
  podiumBar2: {
    height: 84,
    backgroundColor: colors.surface,
  },
  podiumBar3: {
    height: 70,
    backgroundColor: colors.surface,
  },
  podiumRank: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 18,
    color: colors.ink,
  },
  podiumPoints: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.inkMuted,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  restList: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  restRowActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  restRank: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.inkMuted,
    width: 16,
  },
  restName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  restStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  restStreakText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.inkMuted,
  },
  restPoints: {
    fontFamily: fonts.headlineBold,
    fontSize: 14,
    color: colors.ink,
  },
  viewAllButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewAllWrap: {
    marginTop: spacing.lg,
  },
  viewAllLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 18,
    color: colors.ink,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  activityList: {
    gap: spacing.sm,
  },
  flexFill: {
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityMessage: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  activityTime: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(33,33,33,0.5)',
    justifyContent: 'flex-end',
  },
  leaderboardModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 18,
    color: colors.ink,
  },
  modalClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    gap: spacing.sm,
  },
});
