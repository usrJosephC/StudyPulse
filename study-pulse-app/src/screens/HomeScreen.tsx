import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { ProgressRing } from '../components/ProgressRing';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { fonts, radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../hooks/usePoints';
import { useStreak } from '../hooks/useStreak';
import { useTasks } from '../hooks/useTasks';
import { useCheckIn } from '../hooks/useCheckIn';

export function HomeScreen() {
  const { t } = useTranslation();
  const { temaAtual } = useTheme();
  const { session, profile } = useAuth();
  const streak = useStreak();
  const points = usePoints();
  const dailyCheckIn = useCheckIn();
  const { tasks, loading: tasksLoading, error: tasksError, refresh: refreshTasks, createTask, toggleTask } = useTasks();
  const [taskError, setTaskError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  const displayName = profile?.name?.trim()
    || (typeof session?.user.user_metadata?.name === 'string' ? session.user.user_metadata.name.trim() : '')
    || t('home.defaultStudent');

  const userInitial = displayName.charAt(0).toUpperCase() || '?';
  const nextTaskId = useMemo(() => tasks.find((task) => !task.done)?.id, [tasks]);
  const tasksDone = tasks.filter((task) => task.done).length;
  const tasksTotal = tasks.length;
  const tasksProgress = tasksTotal > 0 ? tasksDone / tasksTotal : 0;

  async function handleCheckIn() {
    if (dailyCheckIn.loading || dailyCheckIn.result) return;

    const result = await dailyCheckIn.checkIn();
    if (result.ok) {
      await Promise.all([points.refresh(), streak.refresh()]);
    }
  }

  async function handleCreateTask() {
    const title = taskTitle.trim();
    if (!title || creatingTask) return;

    setCreatingTask(true);
    setTaskError(null);
    const result = await createTask({
      title,
      category: taskCategory.trim() || t('home.generalCategory'),
    });

    if (result.ok) {
      setTaskTitle('');
      setTaskCategory('');
      setTaskFormVisible(false);
    } else {
      setTaskError(result.error.message);
    }
    setCreatingTask(false);
  }

  async function handleToggleTask(id: number) {
    if (updatingTaskId !== null) return;

    setUpdatingTaskId(id);
    setTaskError(null);

    const result = await toggleTask(id);

    if (!result.ok) {
      setTaskError(result.error.message);
    } else {
      const refreshed = await Promise.all([refreshTasks(), points.refresh(), streak.refresh()]);
      const failedRefresh = refreshed.find((item) => !item.ok);

      if (failedRefresh && !failedRefresh.ok) setTaskError(failedRefresh.error.message);
    }

    setUpdatingTaskId(null);
  }

  async function refreshHomeData() {
    setTaskError(null);

    const refreshed = await Promise.all([refreshTasks(), points.refresh(), streak.refresh()]);
    const failed = refreshed.find((item) => !item.ok);

    if (failed && !failed.ok) setTaskError(failed.error.message);
  }

  useFocusEffect(useCallback(() => {
    void Promise.all([refreshTasks(), points.refresh(), streak.refresh()]);
  }, [points.refresh, refreshTasks, streak.refresh]));

  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: temaAtual.background,
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
    streakContent: {
      flex: 1,
    },
    checkInFeedback: {
      marginTop: -spacing.sm,
      fontFamily: fonts.bodyMedium,
      fontSize: 12,
      color: temaAtual.inkMuted,
      textAlign: 'center',
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
      color: temaAtual.ink,
      letterSpacing: 1,
    },
    streakValue: {
      fontFamily: fonts.headlineExtraBold,
      fontSize: 20,
      color: temaAtual.ink,
    },
    tasksCard: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    ringValue: {
      fontFamily: fonts.headlineExtraBold,
      fontSize: 26,
      color: temaAtual.ink,
    },
    ringLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: 13,
      color: temaAtual.inkMuted,
    },
    encourageTitle: {
      fontFamily: fonts.headlineBold,
      fontSize: 18,
      color: temaAtual.ink,
      marginTop: spacing.sm,
    },
    encourageBody: {
      fontFamily: fonts.bodyRegular,
      fontSize: 14,
      color: temaAtual.inkMuted,
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
      color: temaAtual.ink,
    },
    seeAll: {
      fontFamily: fonts.bodyBold,
      fontSize: 13,
      color: temaAtual.secondary,
    },
    addTaskButton: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    taskForm: {
      gap: spacing.sm,
    },
    taskInput: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: temaAtual.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      fontFamily: fonts.bodyRegular,
      fontSize: 14,
      color: temaAtual.ink,
      backgroundColor: temaAtual.background,
    },
    taskFormActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    taskFormAction: {
      flex: 1,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: temaAtual.card,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    taskRowActive: {
      borderWidth: 1.5,
      borderColor: temaAtual.primary,
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
      color: temaAtual.ink,
      marginBottom: 4,
    },
    taskTitleDone: {
      color: temaAtual.inkFaint,
      textDecorationLine: 'line-through',
    },
    loadingText: {
      fontFamily: fonts.bodyRegular,
      fontSize: 12,
      color: temaAtual.inkMuted,
    },
    errorText: {
      fontFamily: fonts.bodyRegular,
      fontSize: 12,
      color: temaAtual.danger,
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
      color: temaAtual.ink,
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={userInitial} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[temaAtual.primary, temaAtual.primarySoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.streakBanner}
        >
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={22} color={temaAtual.primary} />
          </View>

          <View style={styles.streakContent}>
            <Text style={styles.streakLabel}>{t('home.onFire')}</Text>
            <Text style={styles.streakValue}>
              {streak.loading ? t('home.loading') : t('home.dayStreak', { count: streak.streak })}
            </Text>
          </View>

        </LinearGradient>

        {dailyCheckIn.result && (
          <Text style={styles.checkInFeedback} accessibilityRole="alert">
            {t('home.checkInSuccess', { count: dailyCheckIn.result.pointsAwarded })}
          </Text>
        )}

        {dailyCheckIn.error && (
          <Text style={[styles.checkInFeedback, styles.errorText]} accessibilityRole="alert">
            {dailyCheckIn.error.message}
          </Text>
        )}

        <Card style={styles.tasksCard}>
          <ProgressRing progress={tasksProgress} size={150} strokeWidth={14}>
            <Text style={styles.ringValue}>
              {tasksDone}/{tasksTotal}
            </Text>
            <Text style={styles.ringLabel}>{t('home.tasks')}</Text>
          </ProgressRing>

          <Text style={styles.encourageTitle}>
            {t('home.almostThere', { name: displayName })}
          </Text>

          <Text style={styles.encourageBody}>
            {t('home.goalsEncouragement')}
          </Text>

          <View style={styles.ctaWrap}>
            <Button
              label={dailyCheckIn.loading
                ? t('home.checkingIn')
                : dailyCheckIn.result
                  ? t('home.checkedIn')
                  : t('home.checkIn')}
              onPress={() => { void handleCheckIn(); }}
              disabled={dailyCheckIn.loading || Boolean(dailyCheckIn.result)}
            />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.todaysTasks')}</Text>
          <Pressable
            onPress={() => setTaskFormVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={t('home.addTask')}
            accessibilityState={{ expanded: taskFormVisible }}
            style={styles.addTaskButton}
          >
            <Ionicons name={taskFormVisible ? 'close' : 'add'} size={18} color={temaAtual.secondary} />
            <Text style={styles.seeAll}>{taskFormVisible ? t('common.cancel') : t('home.addTask')}</Text>
          </Pressable>
        </View>

        {taskFormVisible && (
          <Card style={styles.taskForm}>
            <TextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder={t('home.taskTitlePlaceholder')}
              placeholderTextColor={temaAtual.inkFaint}
              maxLength={160}
              editable={!creatingTask}
              returnKeyType="next"
              accessibilityLabel={t('home.taskTitle')}
              style={styles.taskInput}
            />
            <TextInput
              value={taskCategory}
              onChangeText={setTaskCategory}
              placeholder={t('home.taskCategoryPlaceholder')}
              placeholderTextColor={temaAtual.inkFaint}
              maxLength={80}
              editable={!creatingTask}
              returnKeyType="done"
              onSubmitEditing={() => { void handleCreateTask(); }}
              accessibilityLabel={t('home.taskCategory')}
              style={styles.taskInput}
            />
            <View style={styles.taskFormActions}>
              <View style={styles.taskFormAction}>
                <Button
                  label={t('common.cancel')}
                  variant="muted"
                  disabled={creatingTask}
                  onPress={() => {
                    setTaskFormVisible(false);
                    setTaskTitle('');
                    setTaskCategory('');
                  }}
                />
              </View>
              <View style={styles.taskFormAction}>
                <Button
                  label={creatingTask ? t('home.creatingTask') : t('home.saveTask')}
                  icon="checkmark"
                  disabled={!taskTitle.trim() || creatingTask}
                  onPress={() => { void handleCreateTask(); }}
                />
              </View>
            </View>
          </Card>
        )}

        {points.loading && (
          <Text style={styles.loadingText}>{t('home.loadingPoints')}</Text>
        )}

        {tasksLoading && (
          <Text style={styles.loadingText}>{t('home.loadingTasks')}</Text>
        )}

        {(taskError || tasksError || points.error || streak.error) && (
          <Pressable
            onPress={() => { void refreshHomeData(); }}
            accessibilityRole="button"
          >
            <Text style={styles.errorText}>
              {taskError || tasksError?.message || points.error?.message || streak.error?.message}
              {' · '}
              {t('home.tapToRetry')}
            </Text>
          </Pressable>
        )}

        {!tasksLoading && tasks.length === 0 && (
          <Text style={styles.loadingText}>{t('home.noTasksToday')}</Text>
        )}

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => { void handleToggleTask(task.id); }}
              disabled={updatingTaskId !== null}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.done }}
              accessibilityLabel={t('home.taskAccessibility', {
                title: task.title,
                category: task.category,
              })}
              hitSlop={4}
              style={({ pressed }) => [
                styles.taskRow,
                !task.done && task.id === nextTaskId && styles.taskRowActive,
                pressed && styles.taskRowPressed,
                updatingTaskId === task.id && styles.taskRowPressed,
              ]}
            >
              <Ionicons
                name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={task.done ? temaAtual.primary : temaAtual.inkFaint}
              />

              <View style={styles.flexFill}>
                <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
                  {task.title}
                </Text>
                <Pill label={task.category} variant="muted" />
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.squadSectionTitle]}>
          {t('home.weeklyPoints')}
        </Text>

        <Card>
          <View style={styles.squadHeaderRow}>
            <View style={styles.squadHeaderLeft}>
              <Ionicons name="trophy" size={18} color={temaAtual.primary} />
              <Text style={styles.squadTitle}>{t('home.yourWeeklyTotal')}</Text>
            </View>

            <Pill
              label={
                points.loading
                  ? '…'
                  : t('home.pointsShort', {
                      count: points.weekly,
                      formattedCount: points.weekly.toLocaleString(),
                    })
              }
              variant="secondary"
            />
          </View>

          <Text style={styles.encourageBody}>
            {t('home.totalPoints', {
              count: points.total,
              formattedCount: points.loading ? '…' : points.total.toLocaleString(),
            })}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
