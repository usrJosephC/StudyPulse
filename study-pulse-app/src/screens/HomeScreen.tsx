import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { ProgressRing } from '../components/ProgressRing';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { colors, fonts, radius, spacing } from '../theme';
import { currentUser, todaysTasks, homeSquadPreview } from '../data/mockData';

export function HomeScreen() {
  const [tasks, setTasks] = useState(todaysTasks);

  const nextTaskId = useMemo(() => tasks.find((task) => !task.done)?.id, [tasks]);
  const tasksDone = tasks.filter((task) => task.done).length;
  const tasksTotal = tasks.length;
  const tasksProgress = tasksTotal > 0 ? tasksDone / tasksTotal : 0;

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={currentUser.initial} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primary, colors.primarySoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.streakBanner}
        >
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.streakLabel}>ON FIRE!</Text>
            <Text style={styles.streakValue}>{currentUser.streak} Day Streak</Text>
          </View>
        </LinearGradient>

        <Card style={styles.tasksCard}>
          <ProgressRing progress={tasksProgress} size={150} strokeWidth={14}>
            <Text style={styles.ringValue}>
              {tasksDone}/{tasksTotal}
            </Text>
            <Text style={styles.ringLabel}>Tasks</Text>
          </ProgressRing>
          <Text style={styles.encourageTitle}>Almost there, {currentUser.name}!</Text>
          <Text style={styles.encourageBody}>
            You're over halfway through today's goals. Keep that momentum going!
          </Text>
          <View style={styles.ctaWrap}>
            <Button label="Continue Studying" />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => toggleTask(task.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.done }}
              accessibilityLabel={`${task.title}, ${task.category}`}
              hitSlop={4}
              style={({ pressed }) => [
                styles.taskRow,
                !task.done && task.id === nextTaskId && styles.taskRowActive,
                pressed && styles.taskRowPressed,
              ]}
            >
              <Ionicons
                name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={task.done ? colors.primary : colors.inkFaint}
              />
              <View style={styles.flexFill}>
                <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
                <Pill label={task.category} variant="muted" />
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.squadSectionTitle]}>Study Squad</Text>
        <Card>
          <View style={styles.squadHeaderRow}>
            <View style={styles.squadHeaderLeft}>
              <Ionicons name="trophy" size={18} color={colors.primary} />
              <Text style={styles.squadTitle}>Weekly Ranking</Text>
            </View>
            <Pill label={homeSquadPreview.rankLabel} variant="secondary" />
          </View>
          <View style={styles.squadMembers}>
            {homeSquadPreview.members.map((member) => (
              <View key={member.id} style={styles.squadMember}>
                <Avatar
                  label={member.initial}
                  size={member.isYou ? 56 : 48}
                  ringColor={member.isYou ? colors.primary : undefined}
                />
                <Text style={styles.squadMemberName}>{member.isYou ? 'You' : member.initial}</Text>
              </View>
            ))}
          </View>
        </Card>
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
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  streakIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 1,
  },
  streakValue: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 20,
    color: colors.ink,
  },
  tasksCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  ringValue: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 26,
    color: colors.ink,
  },
  ringLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  encourageTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 18,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  encourageBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  ctaWrap: {
    width: '100%',
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 18,
    color: colors.ink,
  },
  seeAll: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.secondary,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  taskRowActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  taskRowPressed: {
    opacity: 0.8,
  },
  taskList: {
    gap: spacing.sm,
  },
  flexFill: {
    flex: 1,
  },
  squadSectionTitle: {
    marginTop: spacing.xl,
  },
  taskTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 4,
  },
  taskTitleDone: {
    color: colors.inkFaint,
    textDecorationLine: 'line-through',
  },
  squadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  squadHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  squadTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 15,
    color: colors.ink,
  },
  squadMembers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
  },
  squadMember: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  squadMemberName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
