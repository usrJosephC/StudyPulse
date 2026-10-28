
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { colors, fonts, radius, spacing } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../hooks/usePoints';
import { useStreak } from '../hooks/useStreak';
import { useTasks } from '../hooks/useTasks';
import { useProgression } from '../hooks/useProgression';

const profileSettings = [
  { id: 'account', icon: 'person-outline' as const, labelKey: 'profile.settings.account' },
  { id: 'notifications', icon: 'notifications-outline' as const, labelKey: 'profile.settings.notifications' },
  { id: 'squad', icon: 'people-outline' as const, labelKey: 'profile.settings.studySquad' },
];

export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { session, profile, loading: authLoading, error: authError, signOut } = useAuth();
  const streak = useStreak();
  const points = usePoints();
  const tasks = useTasks();
  const progression = useProgression();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const metadataName = session?.user.user_metadata?.name;
  const displayName = profile?.name?.trim()
    || (typeof metadataName === 'string' ? metadataName.trim() : '')
    || t('profile.defaultName');
  const email = session?.user.email ?? '';
  const userInitial = displayName.charAt(0).toUpperCase() || '?';
  const profileLoading = authLoading || streak.loading || points.loading || tasks.loading || progression.loading;
  const loadError = authError || streak.error || points.error || tasks.error || progression.error;
  const [dataError, setDataError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settingsView, setSettingsView] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  useEffect(() => {
    void AsyncStorage.getItem('studypulse.notifications.enabled').then((value) => {
      if (value !== null) setNotificationsEnabled(value === 'true');
    });
  }, []);
  const profileStats = [
    { id: 'streak', icon: 'flame' as const, value: String(streak.streak), labelKey: 'profile.stats.dayStreak', tint: '#FCE4E4' },
    { id: 'goals', icon: 'checkmark-circle' as const, value: String(tasks.tasks.filter((task) => task.done).length), labelKey: 'profile.stats.tasksDone', tint: '#EAEAEA' },
    { id: 'points', icon: 'star' as const, value: points.total.toLocaleString(), labelKey: 'profile.stats.totalPoints', tint: '#FDF6D3' },
  ];
  const dateLocale = i18n.language.startsWith('pt') ? 'pt-BR' : 'en-US';
  const since = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })
    : '—';

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);
    const result = await signOut();
    if (!result.ok) setSignOutError(result.error.message);
    setIsSigningOut(false);
  }

  async function refreshProfileData() {
    setIsRefreshing(true);
    setDataError(null);
    const results = await Promise.all([streak.refresh(), points.refresh(), tasks.refresh(), progression.refresh()]);
    const failed = results.find((result) => !result.ok);
    if (failed && !failed.ok) setDataError(failed.error.message);
    setIsRefreshing(false);
  }

  useFocusEffect(useCallback(() => {
    void Promise.all([streak.refresh(), points.refresh(), tasks.refresh(), progression.refresh()]);
  }, [points.refresh, progression.refresh, streak.refresh, tasks.refresh]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={userInitial} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.centered}>
          <View>
            <Avatar label={userInitial} size={96} ringColor={colors.secondarySoft} />
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={colors.primary} />
              <Text style={styles.streakBadgeText}>
                {streak.loading ? '…' : streak.streak}
              </Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {displayName}
          </Text>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
            {email}
          </Text>
          <Text style={styles.since}>
            {t('profile.studyingSince', { date: since })}
          </Text>
          {profile?.badge ? (
            <Pill
              label={profile.badge}
              variant="secondary"
              icon={<Ionicons name="ribbon" size={12} color="#fff" />}
            />
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>{t('profile.yourStats')}</Text>
        {profileLoading && (
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
        )}
        {loadError && !dataError && (
          <Pressable
            onPress={() => { void refreshProfileData(); }}
            accessibilityRole="button"
            disabled={isRefreshing}
          >
            <Text style={styles.errorText}>
              {loadError.message} · {t('profile.tapToRetry')}
            </Text>
          </Pressable>
        )}
        {dataError && (
          <Pressable
            onPress={() => { void refreshProfileData(); }}
            accessibilityRole="button"
            disabled={isRefreshing}
          >
            <Text style={styles.errorText}>
              {dataError} · {t('profile.tapToRetry')}
            </Text>
          </Pressable>
        )}
        {!profileLoading && !dataError && !loadError && tasks.tasks.length === 0 && (
          <Text style={styles.loadingText}>
            {t('profile.noTasks')}
          </Text>
        )}
        <View style={styles.statsRow}>
          {profileStats.map((stat) => (
            <Card key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.tint }]}>
                <Ionicons name={stat.icon} size={18} color={colors.secondary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy" size={22} color={colors.primary} />
          </View>
          <View style={styles.achievementCopy}>
            <Text style={styles.achievementTitle}>{t('profile.achievements.title', { defaultValue: 'Conquistas' })}</Text>
            <Text style={styles.achievementText}>
              {progression.badges[0]?.badge?.name || profile?.badge || t('profile.achievements.empty', { defaultValue: 'Continue estudando para desbloquear sua primeira conquista.' })}
            </Text>
          </View>
          <Pill label={t('profile.achievements.badge', { defaultValue: 'Em progresso' })} variant="secondary" />
        </Card>

        <Text style={styles.sectionTitle}>{t('profile.settings.title')}</Text>
        <View style={{ gap: spacing.sm }}>
          {profileSettings.map((item) => (
            <Pressable key={item.id} style={styles.settingRow} onPress={() => setSettingsView(item.id)} accessibilityRole="button">
              <View style={styles.settingIcon}>
                <Ionicons name={item.icon} size={18} color={colors.secondary} />
              </View>
              <Text style={styles.settingLabel}>{t(item.labelKey)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </Pressable>
          ))}
          <Pressable
            style={styles.settingRow}
            onPress={handleSignOut}
            disabled={isSigningOut}
            accessibilityRole="button"
            accessibilityLabel={t('profile.signOut')}
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            </View>
            <Text style={styles.signOutLabel}>
              {isSigningOut ? t('profile.signingOut') : t('profile.signOut')}
            </Text>
            {isSigningOut && (
              <Text style={styles.loadingText}>{t('profile.pleaseWait')}</Text>
            )}
          </Pressable>
          {signOutError && (
            <Text style={styles.errorText}>{signOutError}</Text>
          )}
        </View>
      </ScrollView>
      <Modal visible={settingsView !== null} transparent animationType="fade" onRequestClose={() => setSettingsView(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsView(null)} accessibilityLabel={t('common.close')}>
          <Pressable style={styles.settingsModal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} accessibilityRole="header">
                {settingsView === 'notifications' ? t('profile.settings.notifications') : settingsView === 'squad' ? t('profile.settings.studySquad') : t('profile.settings.account')}
              </Text>
              <Pressable onPress={() => setSettingsView(null)} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>
            {settingsView === 'notifications' ? (
              <View style={styles.preferenceRow}>
                <View style={styles.achievementCopy}>
                  <Text style={styles.settingLabel}>{t('profile.notifications.studyReminders', { defaultValue: 'Lembretes de estudo' })}</Text>
                  <Text style={styles.preferenceHint}>{t('profile.notifications.hint', { defaultValue: 'Receba um lembrete para manter sua sequência.' })}</Text>
                </View>
                <Switch value={notificationsEnabled} onValueChange={(value) => { setNotificationsEnabled(value); void AsyncStorage.setItem('studypulse.notifications.enabled', String(value)); }} accessibilityLabel={t('profile.notifications.studyReminders', { defaultValue: 'Lembretes de estudo' })} />
              </View>
            ) : (
              <Text style={styles.preferenceHint}>{t('profile.settings.comingSoon', { defaultValue: 'Esta seção estará disponível em breve.' })}</Text>
            )}
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
  streakBadge: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
  },
  name: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 22,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  email: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkMuted,
  },
  since: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 18,
    color: colors.ink,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 18,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  signOutLabel: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.danger,
  },
  loadingText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.inkMuted,
  },
  errorText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.danger,
    paddingHorizontal: spacing.sm,
  },
  achievementCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  achievementIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  achievementCopy: { flex: 1, gap: 3 },
  achievementTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  achievementText: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.inkMuted },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(33,33,33,0.5)', justifyContent: 'flex-end' },
  settingsModal: { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: fonts.headlineBold, fontSize: 18, color: colors.ink },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  preferenceHint: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkMuted, lineHeight: 19 },
});
