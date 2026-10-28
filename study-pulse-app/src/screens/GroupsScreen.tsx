import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { colors, fonts, radius, spacing } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useRanking } from '../hooks/useRanking';
import { useSquad } from '../hooks/useSquad';
import { useSquadActivity } from '../hooks/useSquadActivity';
import { useSquadCreation } from '../hooks/useSquadCreation';
import type { RankingEntry, SquadActivity } from '../types/domain';

export function GroupsScreen() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const { squad, loading: squadLoading, error: squadError, refresh: refreshSquad, joinSquad } = useSquad();
  const { ranking, loading: rankingLoading, error: rankingError, refresh: refreshRanking } = useRanking(squad?.id ?? null);
  const { activities, loading: activityLoading, error: activityError, refresh: refreshActivity } = useSquadActivity(squad?.id ?? null);
  const { createSquad, loading: creating, error: createError } = useSquadCreation();
  const podium = [ranking[1], ranking[0], ranking[2]].filter((member): member is RankingEntry => Boolean(member));
  const rest = ranking.slice(3);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const displayName = profile?.name?.trim()
    || (typeof session?.user.user_metadata?.name === 'string' ? session.user.user_metadata.name.trim() : '')
    || t('groups.defaultStudent');
  const loading = squadLoading || (Boolean(squad) && (rankingLoading || activityLoading));
  const error = squadError || rankingError || activityError;

  function refreshAll() {
    void Promise.all([refreshSquad(), refreshRanking(), refreshActivity()]);
  }

  async function handleJoin() {
    if (!inviteCode.trim() || joining) return;
    setJoining(true);
    setJoinError(null);
    const result = await joinSquad(inviteCode);
    if (!result.ok) setJoinError(result.error.message);
    else setInviteCode('');
    setJoining(false);
  }

  async function handleCreate() {
    if (!groupName.trim() || creating) return;
    const result = await createSquad(groupName.trim());
    if (result.ok) { setCreateVisible(false); setGroupName(''); refreshAll(); }
  }

  useFocusEffect(useCallback(() => {
    void Promise.all([refreshSquad(), refreshRanking(), refreshActivity()]);
  }, [refreshActivity, refreshRanking, refreshSquad]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={displayName.charAt(0).toUpperCase() || '?'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={colors.primary} accessibilityLabel={t('groups.loadingSquad')} />}
        {error && (
          <Pressable onPress={refreshAll} accessibilityRole="button" accessibilityLabel={t('groups.retryLoading')} style={styles.stateAction}>
            <Text style={styles.errorText}>{error.message} · {t('groups.tapToRetry')}</Text>
          </Pressable>
        )}
        {!squadLoading && !squad && !squadError && (
          <Card style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color={colors.secondary} />
            <Text style={styles.sectionTitle}>{t('groups.notInGroup')}</Text>
            <Text style={styles.stateText}>{t('groups.inviteInstructions')}</Text>
            <TextInput
              value={inviteCode}
              onChangeText={(value) => { setInviteCode(value.toUpperCase()); setJoinError(null); }}
              placeholder={t('groups.inviteCodePlaceholder')}
              placeholderTextColor={colors.inkMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!joining}
              maxLength={12}
              style={styles.inviteInput}
              accessibilityLabel={t('groups.inviteCodeAccessibility')}
            />
            {joinError && <Text style={styles.errorText}>{joinError}</Text>}
            <Pressable
              style={[styles.joinButton, (!inviteCode.trim() || joining) && styles.disabledButton]}
              onPress={() => void handleJoin()}
              disabled={!inviteCode.trim() || joining}
              accessibilityRole="button"
              accessibilityState={{ disabled: !inviteCode.trim() || joining, busy: joining }}
            >
              {joining ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinButtonText}>{t('groups.joinButton')}</Text>}
            </Pressable>
            <Pressable style={styles.createLink} onPress={() => setCreateVisible(true)} accessibilityRole="button" accessibilityLabel={t('groups.createGroup', { defaultValue: 'Criar grupo' })}>
              <Ionicons name="add-circle-outline" size={18} color={colors.secondary} />
              <Text style={styles.createLinkText}>{t('groups.createGroup', { defaultValue: 'Criar grupo' })}</Text>
            </Pressable>
          </Card>
        )}
        {squad && <>
          <View style={styles.centered}>
            <Pill label={t('groups.studySquad')} variant="secondary" icon={<Ionicons name="people" size={12} color="#fff" />} />
            <Text style={styles.squadName}>{squad.name}</Text>
            <Text style={styles.squadSubtitle}>{squad.subtitle || t('groups.defaultSubtitle')}</Text>
          </View>
          <Card>
            <View style={styles.rankingHeader}>
              <View style={styles.rankingHeaderLeft}>
                <Ionicons name="bar-chart" size={18} color={colors.primary} />
                <Text style={styles.rankingTitle}>{t('groups.weeklyRanking')}</Text>
              </View>
              <Pill label={formatSeasonEnd(squad.season_ends_at, t)} variant="muted" />
            </View>
            {ranking.length >= 3 ? <View style={styles.podiumRow}>
              {podium.map((member) => {
                const rank = member.rank;
                return (
                  <View key={member.user_id} style={styles.podiumMember}>
                    {rank === 1 && <Ionicons name="star" size={16} color={colors.primary} style={styles.podiumStar} />}
                    <Avatar label={getInitial(member.name)} size={rank === 1 ? 64 : 52} ringColor={rank === 1 ? colors.primary : undefined} />
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={10} color={colors.primary} />
                      <Text style={styles.streakBadgeText}>{member.streak}</Text>
                    </View>
                    <Text style={styles.podiumName}>{member.name}</Text>
                    <View
                      style={[
                        styles.podiumBar,
                        rank === 1 ? styles.podiumBar1 : rank === 2 ? styles.podiumBar2 : styles.podiumBar3,
                      ]}
                    >
                      <Text style={styles.podiumRank}>{rank}</Text>
                      <Text style={styles.podiumPoints}>{formatPoints(member.weekly_points, t)}</Text>
                    </View>
                  </View>
                );
              })}
            </View> : !rankingLoading && ranking.length > 0 ? (
              <View style={styles.restList}>
                {ranking.map((member) => (
                  <View key={member.user_id} style={[styles.restRow, member.user_id === session?.user.id && styles.restRowActive]}>
                    <Text style={styles.restRank}>{member.rank}</Text>
                    <Avatar label={getInitial(member.name)} size={36} />
                    <View style={styles.flexFill}>
                      <Text style={styles.restName}>{member.name}</Text>
                      <Text style={styles.restStreakText}>{t('groups.streakDays', { count: member.streak })}</Text>
                    </View>
                    <Text style={styles.restPoints}>{formatPoints(member.weekly_points, t)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.restList}>
              {rest.map((member) => (
                <View key={member.user_id} style={[styles.restRow, member.user_id === session?.user.id && styles.restRowActive]}>
                  <Text style={styles.restRank}>{member.rank}</Text>
                  <Avatar label={getInitial(member.name)} size={36} />
                  <View style={styles.flexFill}>
                    <Text style={styles.restName}>{member.name}</Text>
                    <View style={styles.restStreak}>
                      <Ionicons name="flame" size={11} color={colors.primary} />
                      <Text style={styles.restStreakText}>{t('groups.streakDays', { count: member.streak })}</Text>
                    </View>
                  </View>
                  <Text style={styles.restPoints}>{formatPoints(member.weekly_points, t)}</Text>
                </View>
              ))}
            </View>
            {ranking.length > 0 ? <View style={styles.viewAllWrap}>
              <Pressable
                style={styles.viewAllButton}
                onPress={() => setLeaderboardVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={t('groups.viewLeaderboardAccessibility')}
              >
                <Text style={styles.viewAllLabel}>{t('groups.viewFullLeaderboard')}</Text>
              </Pressable>
            </View> : !rankingLoading && !rankingError ? <Text style={styles.stateText}>{t('groups.emptyRanking')}</Text> : null}
          </Card>
          <Text style={styles.sectionTitle}>{t('groups.squadActivity')}</Text>
          <View style={styles.activityList}>
            {activities.map((item) => (
              <Card key={item.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name={getActivityIcon(item.action)} size={18} color={colors.secondary} />
                </View>
                <View style={styles.flexFill}>
                  <Text style={styles.activityMessage}>{formatActivity(item, ranking, t)}</Text>
                  <Text style={styles.activityTime}>{formatRelativeTime(item.created_at, t)}</Text>
                </View>
              </Card>
            ))}
            {!activityLoading && activities.length === 0 && !activityError && <Text style={styles.stateText}>{t('groups.noActivity')}</Text>}
          </View>
        </>}
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
              <Text style={styles.modalTitle}>{t('groups.fullLeaderboard')}</Text>
              <Pressable
                onPress={() => setLeaderboardVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('groups.closeLeaderboard')}
                hitSlop={8}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalList}>
                {ranking.map((member) => (
                  <View key={member.user_id} style={[styles.restRow, member.user_id === session?.user.id && styles.restRowActive]}>
                    <Text style={styles.restRank}>{member.rank}</Text>
                    <Avatar label={getInitial(member.name)} size={36} />
                    <View style={styles.flexFill}>
                      <Text style={styles.restName}>{member.user_id === session?.user.id ? t('groups.you') : member.name}</Text>
                      <View style={styles.restStreak}>
                        <Ionicons name="flame" size={11} color={colors.primary} />
                        <Text style={styles.restStreakText}>{t('groups.streakDays', { count: member.streak })}</Text>
                      </View>
                    </View>
                    <Text style={styles.restPoints}>{formatPoints(member.weekly_points, t)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCreateVisible(false)} accessibilityLabel={t('common.close')}>
          <Pressable style={styles.createModal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('groups.createGroup', { defaultValue: 'Criar grupo' })}</Text>
              <Pressable onPress={() => setCreateVisible(false)} accessibilityRole="button" accessibilityLabel={t('common.close')}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>
            <Text style={styles.stateText}>{t('groups.createGroupHint', { defaultValue: 'Defina um nome para organizar seus estudos com outras pessoas.' })}</Text>
            <TextInput value={groupName} onChangeText={setGroupName} placeholder={t('groups.groupNamePlaceholder', { defaultValue: 'Nome do grupo' })} placeholderTextColor={colors.inkMuted} style={styles.inviteInput} accessibilityLabel={t('groups.groupNamePlaceholder', { defaultValue: 'Nome do grupo' })} />
            {createError && <Text style={styles.errorText}>{createError.message}</Text>}
            <Pressable style={[styles.joinButton, (!groupName.trim() || creating) && styles.disabledButton]} onPress={() => void handleCreate()} disabled={!groupName.trim() || creating} accessibilityRole="button" accessibilityState={{ disabled: !groupName.trim() || creating, busy: creating }}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinButtonText}>{t('groups.createGroup', { defaultValue: 'Criar grupo' })}</Text>}
            </Pressable>
          </Pressable>
        </Pressable>
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
  stateAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
  stateText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  inviteInput: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 1,
  },
  joinButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.55,
  },
  createLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  createLinkText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.secondary },
  createModal: { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
});

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function formatPoints(points: number, t: TFunction) {
  return t('groups.points', { count: points, formattedCount: points.toLocaleString() });
}

function formatSeasonEnd(value: string | null, t: TFunction) {
  if (!value) return t('groups.thisWeek');
  const days = Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));
  return t('groups.endsInDays', { count: days });
}

function getActivityIcon(action: string): keyof typeof Ionicons.glyphMap {
  if (action === 'check_in') return 'flame';
  if (action === 'goal_done') return 'trophy';
  return 'book';
}

function formatActivity(item: SquadActivity, ranking: RankingEntry[], t: TFunction) {
  const name = item.user_name || ranking.find((member) => member.user_id === item.user_id)?.name || t('groups.squadMember');
  if (item.action === 'check_in') return t('groups.activityCheckIn', { name });
  if (item.action === 'goal_done') return t('groups.activityGoalDone', { name });
  if (item.action === 'task_done') return t('groups.activityTaskDone', { name });
  return t('groups.activityShared', { name });
}

function formatRelativeTime(value: string, t: TFunction) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (elapsedMinutes < 1) return t('groups.justNow');
  if (elapsedMinutes < 60) return t('groups.minutesAgo', { count: elapsedMinutes });
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return t('groups.hoursAgo', { count: hours });
  return t('groups.daysAgo', { count: Math.floor(hours / 24) });
}
