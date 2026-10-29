import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { fonts, radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
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
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { temaAtual } = useTheme();
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
    { id: 'streak', icon: 'flame' as const, value: String(streak.streak), labelKey: 'profile.stats.dayStreak', tint: temaAtual.danger },
    { id: 'goals', icon: 'checkmark-circle' as const, value: String(tasks.tasks.filter((task) => task.done).length), labelKey: 'profile.stats.tasksDone', tint: temaAtual.surface },
    { id: 'points', icon: 'star' as const, value: points.total.toLocaleString(), labelKey: 'profile.stats.totalPoints', tint: temaAtual.primaryMuted },
  ];
  const dateLocale = i18n.language.startsWith('pt') ? 'pt-BR' : i18n.language.startsWith('es') ? 'es-ES' : 'en-US';
  const since = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })
    : '—';

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: temaAtual.background },
    content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
    centered: { alignItems: 'center', gap: spacing.xs },
    streakBadge: { position: 'absolute', right: -4, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: temaAtual.card, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
    streakBadgeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: temaAtual.ink },
    name: { fontFamily: fonts.headlineExtraBold, fontSize: 22, color: temaAtual.ink, marginTop: spacing.sm },
    email: { fontFamily: fonts.bodyRegular, fontSize: 13, color: temaAtual.inkMuted },
    since: { fontFamily: fonts.bodyRegular, fontSize: 13, color: temaAtual.inkMuted, marginBottom: spacing.xs },
    sectionTitle: { fontFamily: fonts.headlineBold, fontSize: 18, color: temaAtual.ink },
    statsRow: { flexDirection: 'row', gap: spacing.sm },
    statCard: { flex: 1, alignItems: 'center', gap: 4 },
    statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    statValue: { fontFamily: fonts.headlineExtraBold, fontSize: 18, color: temaAtual.ink },
    statLabel: { fontFamily: fonts.bodyRegular, fontSize: 11, color: temaAtual.inkMuted, textAlign: 'center' },
    settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: temaAtual.card, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    settingIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: temaAtual.secondarySoft, alignItems: 'center', justifyContent: 'center' },
    settingLabel: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: temaAtual.ink },
    signOutLabel: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: temaAtual.danger },
    loadingText: { fontFamily: fonts.bodyRegular, fontSize: 12, color: temaAtual.inkMuted },
    errorText: { fontFamily: fonts.bodyRegular, fontSize: 12, color: temaAtual.danger, paddingHorizontal: spacing.sm },
    achievementCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    achievementIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: temaAtual.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    achievementCopy: { flex: 1, gap: 3 },
    achievementTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: temaAtual.ink },
    achievementText: { fontFamily: fonts.bodyRegular, fontSize: 12, color: temaAtual.inkMuted },
    achievementButton: { borderRadius: radius.md },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(33,33,33,0.5)', justifyContent: 'flex-end' },
    settingsModal: { backgroundColor: temaAtual.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontFamily: fonts.headlineBold, fontSize: 18, color: temaAtual.ink },
    preferenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    preferenceHint: { fontFamily: fonts.bodyRegular, fontSize: 13, color: temaAtual.inkMuted, lineHeight: 19 },
    modalScroll: { maxHeight: 430 },
    modalScrollContent: { gap: spacing.md, paddingBottom: spacing.xs },
    detailRow: { gap: 3, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: temaAtual.border },
    detailLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: temaAtual.inkMuted },
    detailValue: { fontFamily: fonts.bodyBold, fontSize: 14, color: temaAtual.ink },
    badgeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: temaAtual.background, borderRadius: radius.md, padding: spacing.md },
    badgeCopy: { flex: 1, gap: 3 },
    badgeDate: { fontFamily: fonts.bodyRegular, fontSize: 11, color: temaAtual.inkMuted },
    historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
    historyText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 13, color: temaAtual.ink },
  });

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

  const refreshStreak = streak.refresh;
  const refreshPoints = points.refresh;
  const refreshTasks = tasks.refresh;
  const refreshProgression = progression.refresh;

  useFocusEffect(useCallback(() => {
    void Promise.all([refreshStreak(), refreshPoints(), refreshTasks(), refreshProgression()]);
  }, [refreshPoints, refreshProgression, refreshStreak, refreshTasks]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={userInitial} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.centered}>
          <View>
            <Avatar label={userInitial} size={96} ringColor={temaAtual.secondarySoft} />
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={temaAtual.primary} />
              <Text style={styles.streakBadgeText}>{streak.loading ? '…' : streak.streak}</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">{email}</Text>
          <Text style={styles.since}>{t('profile.studyingSince', { date: since })}</Text>
          {profile?.badge ? <Pill label={profile.badge} variant="secondary" icon={<Ionicons name="ribbon" size={12} color="#fff" />} /> : null}
        </View>

        <Text style={styles.sectionTitle}>{t('profile.yourStats')}</Text>
        {profileLoading && <Text style={styles.loadingText}>{t('profile.loading')}</Text>}
        {loadError && !dataError && (
          <Pressable onPress={() => { void refreshProfileData(); }} accessibilityRole="button" disabled={isRefreshing}>
            <Text style={styles.errorText}>{loadError.message} · {t('profile.tapToRetry')}</Text>
          </Pressable>
        )}
        {dataError && (
          <Pressable onPress={() => { void refreshProfileData(); }} accessibilityRole="button" disabled={isRefreshing}>
            <Text style={styles.errorText}>{dataError} · {t('profile.tapToRetry')}</Text>
          </Pressable>
        )}
        {!profileLoading && !dataError && !loadError && tasks.tasks.length === 0 && <Text style={styles.loadingText}>{t('profile.noTasks')}</Text>}
        <View style={styles.statsRow}>
          {profileStats.map((stat) => (
            <Card key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.tint }]}>
                <Ionicons name={stat.icon} size={18} color={temaAtual.secondary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
            </Card>
          ))}
        </View>

        <Pressable
          style={styles.achievementButton}
          onPress={() => setSettingsView('achievements')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.achievements.open')}
        >
          <Card style={styles.achievementCard}>
            <View style={styles.achievementIcon}><Ionicons name="trophy" size={22} color={temaAtual.primary} /></View>
            <View style={styles.achievementCopy}>
              <Text style={styles.achievementTitle}>{t('profile.achievements.title')}</Text>
              <Text style={styles.achievementText}>{progression.badges[0]?.badge?.name || profile?.badge || t('profile.achievements.empty')}</Text>
            </View>
            <Pill label={t('profile.achievements.count', { count: progression.badges.length })} variant="secondary" />
          </Card>
        </Pressable>

        <Text style={styles.sectionTitle}>{t('profile.settings.title')}</Text>
        <View style={{ gap: spacing.sm }}>
          {profileSettings.map((item) => (
            <Pressable key={item.id} style={styles.settingRow} onPress={() => setSettingsView(item.id)} accessibilityRole="button">
              <View style={styles.settingIcon}><Ionicons name={item.icon} size={18} color={temaAtual.secondary} /></View>
              <Text style={styles.settingLabel}>{t(item.labelKey)}</Text>
              <Ionicons name="chevron-forward" size={18} color={temaAtual.inkFaint} />
            </Pressable>
          ))}
          <Pressable style={styles.settingRow} onPress={handleSignOut} disabled={isSigningOut} accessibilityRole="button" accessibilityLabel={t('profile.signOut')} accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}>
            <View style={styles.settingIcon}><Ionicons name="log-out-outline" size={18} color={temaAtual.danger} /></View>
            <Text style={styles.signOutLabel}>{isSigningOut ? t('profile.signingOut') : t('profile.signOut')}</Text>
            {isSigningOut && <Text style={styles.loadingText}>{t('profile.pleaseWait')}</Text>}
          </Pressable>
          {signOutError && <Text style={styles.errorText}>{signOutError}</Text>}
        </View>
      </ScrollView>
      <Modal visible={settingsView !== null} transparent animationType="fade" onRequestClose={() => setSettingsView(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsView(null)} accessibilityLabel={t('common.close')}>
          <Pressable
            style={[styles.settingsModal, { paddingBottom: spacing.lg + insets.bottom }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} accessibilityRole="header">
                {settingsView === 'achievements'
                  ? t('profile.achievements.title')
                  : settingsView === 'notifications'
                    ? t('profile.settings.notifications')
                    : settingsView === 'squad'
                      ? t('profile.settings.studySquad')
                      : t('profile.settings.account')}
              </Text>
              <Pressable onPress={() => setSettingsView(null)} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={8}>
                <Ionicons name="close" size={22} color={temaAtual.ink} />
              </Pressable>
            </View>
            {settingsView === 'achievements' ? (
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                {progression.loading && <ActivityIndicator color={temaAtual.primary} accessibilityLabel={t('profile.achievements.loading')} />}
                {progression.error && (
                  <Pressable onPress={() => void progression.refresh()} accessibilityRole="button">
                    <Text style={styles.errorText}>{progression.error.message} · {t('profile.tapToRetry')}</Text>
                  </Pressable>
                )}
                {!progression.loading && !progression.error && progression.badges.length === 0 && (
                  <Text style={styles.preferenceHint}>{t('profile.achievements.empty')}</Text>
                )}
                {progression.badges.map((earned) => (
                  <View key={earned.badge_code} style={styles.badgeCard}>
                    <View style={styles.achievementIcon}><Ionicons name="ribbon" size={21} color={temaAtual.primary} /></View>
                    <View style={styles.badgeCopy}>
                      <Text style={styles.achievementTitle}>{earned.badge?.name || earned.badge_code}</Text>
                      {earned.badge?.description ? <Text style={styles.achievementText}>{earned.badge.description}</Text> : null}
                      <Text style={styles.badgeDate}>{t('profile.achievements.earnedAt', { date: new Date(earned.awarded_at).toLocaleDateString(dateLocale) })}</Text>
                    </View>
                  </View>
                ))}
                {progression.history.length > 0 && <Text style={styles.achievementTitle}>{t('profile.achievements.streakHistory')}</Text>}
                {progression.history.slice(0, 7).map((record) => (
                  <View key={record.streak_date} style={styles.historyRow}>
                    <Ionicons name={record.was_broken ? 'remove-circle-outline' : record.is_record ? 'trophy-outline' : 'flame-outline'} size={18} color={record.was_broken ? temaAtual.danger : temaAtual.primary} />
                    <Text style={styles.historyText}>{t('profile.achievements.streakEntry', { date: new Date(`${record.streak_date}T00:00:00`).toLocaleDateString(dateLocale), count: record.streak })}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : settingsView === 'notifications' ? (
              <View style={styles.preferenceRow}>
                <View style={styles.achievementCopy}>
                  <Text style={styles.settingLabel}>{t('profile.notifications.studyReminders')}</Text>
                  <Text style={styles.preferenceHint}>{t('profile.notifications.hint')}</Text>
                  <Text style={styles.badgeDate}>{notificationsEnabled ? t('profile.notifications.enabled') : t('profile.notifications.disabled')}</Text>
                </View>
                <Switch value={notificationsEnabled} onValueChange={(value) => { setNotificationsEnabled(value); void AsyncStorage.setItem('studypulse.notifications.enabled', String(value)); }} accessibilityLabel={t('profile.notifications.studyReminders', { defaultValue: 'Lembretes de estudo' })} trackColor={{ false: temaAtual.border, true: temaAtual.primarySoft }} thumbColor={notificationsEnabled ? temaAtual.primary : temaAtual.surface} />
              </View>
            ) : settingsView === 'account' ? (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('profile.account.name')}</Text>
                  <Text style={styles.detailValue} selectable>{displayName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('profile.account.email')}</Text>
                  <Text style={styles.detailValue} selectable>{email || t('profile.account.unavailable')}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('profile.account.memberSince')}</Text>
                  <Text style={styles.detailValue}>{since}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.preferenceHint}>{t('profile.settings.comingSoon')}</Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
