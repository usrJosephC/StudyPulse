import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { colors, fonts, radius, spacing } from '../theme';
import { currentUser, squad, squadActivity } from '../data/mockData';

const podiumHeights: Record<number, number> = { 1: 110, 2: 84, 3: 70 };
const podiumOrder = [2, 1, 3];

export function GroupsScreen() {
  const podiumById = Object.fromEntries(squad.podium.map((p) => [p.rank, p]));

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
                  {rank === 1 && <Ionicons name="star" size={16} color={colors.primary} style={{ marginBottom: 4 }} />}
                  <Avatar label={member.initial} size={rank === 1 ? 64 : 52} ringColor={rank === 1 ? colors.primary : undefined} />
                  <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={10} color={colors.primary} />
                    <Text style={styles.streakBadgeText}>{member.streakDays}</Text>
                  </View>
                  <Text style={styles.podiumName}>{member.name}</Text>
                  <View
                    style={[
                      styles.podiumBar,
                      { height: podiumHeights[rank], backgroundColor: rank === 1 ? colors.primarySoft : colors.surface },
                    ]}
                  >
                    <Text style={styles.podiumRank}>{rank}</Text>
                    <Text style={styles.podiumPoints}>{member.points}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
            {squad.rest.map((member) => (
              <View key={member.id} style={[styles.restRow, member.isYou && styles.restRowActive]}>
                <Text style={styles.restRank}>{member.rank}</Text>
                <Avatar label={member.initial} size={36} />
                <View style={{ flex: 1 }}>
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

          <View style={{ marginTop: spacing.lg }}>
            <Pressable style={styles.viewAllButton}>
              <Text style={styles.viewAllLabel}>View Full Leaderboard</Text>
            </Pressable>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Squad Activity</Text>
        <View style={{ gap: spacing.sm }}>
          {squadActivity.map((activity) => (
            <Card key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon} size={18} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.timeAgo}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
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
});
