import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { colors, fonts, radius, spacing } from '../theme';
import { currentUser, profileSettings, profileStats } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const metadataName = session?.user.user_metadata?.name;
  const displayName = profile?.name?.trim()
    || (typeof metadataName === 'string' ? metadataName.trim() : '')
    || 'Estudante';
  const email = session?.user.email ?? '';
  const userInitial = displayName.charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);
    const result = await signOut();
    if (!result.ok) setSignOutError(result.error.message);
    setIsSigningOut(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={userInitial} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.centered}>
          <View>
            <Avatar label={userInitial} size={96} ringColor={colors.secondarySoft} />
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={colors.primary} />
              <Text style={styles.streakBadgeText}>{currentUser.streak}</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">{email}</Text>
          <Text style={styles.since}>Studying since {currentUser.since}</Text>
          <Pill label={currentUser.badge} variant="secondary" icon={<Ionicons name="ribbon" size={12} color="#fff" />} />
        </View>

        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          {profileStats.map((stat) => (
            <Card key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.tint }]}>
                <Ionicons name={stat.icon} size={18} color={colors.secondary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={{ gap: spacing.sm }}>
          {profileSettings.map((item) => (
            <Pressable key={item.id} style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name={item.icon} size={18} color={colors.secondary} />
              </View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </Pressable>
          ))}
          <Pressable
            style={styles.settingRow}
            onPress={handleSignOut}
            disabled={isSigningOut}
            accessibilityRole="button"
            accessibilityLabel="Sair"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            </View>
            <Text style={styles.signOutLabel}>{isSigningOut ? 'Saindo...' : 'Sair'}</Text>
            {isSigningOut && <Text style={styles.loadingText}>Aguarde</Text>}
          </Pressable>
          {signOutError && <Text style={styles.errorText}>{signOutError}</Text>}
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
});
