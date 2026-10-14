import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';

import { colors, fonts, radius, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import { useHeatmap } from '../hooks/useHeatmap';
import { useStreak } from '../hooks/useStreak';
import { logSafeError } from '../lib/logger';

export function GoalsScreen() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();

  const {
    goals,
    loading: goalsLoading,
    error: goalsError,
    refresh: refreshGoals,
    createGoal,
    updateProgress,
    completeGoal,
  } = useGoals();

  const {
    heatmap,
    loading: heatmapLoading,
    error: heatmapError,
    refresh: refreshHeatmap,
  } = useHeatmap(4);

  const {
    streak,
    loading: streakLoading,
    error: streakError,
    refresh: refreshStreak,
  } = useStreak();

  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const displayName =
    profile?.name?.trim() ||
    (typeof session?.user.user_metadata?.name === 'string'
      ? session.user.user_metadata.name.trim()
      : '') ||
    t('goals.defaultStudent');

  function openModal() {
    setCategory('');
    setTitle('');
    setDurationDays('');
    setTitleError(false);
    setActionError(null);
    setModalVisible(true);
  }

  async function handleSave() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError(true);
      return;
    }

    const trimmedDuration = durationDays.trim();
    const duration = trimmedDuration ? Number(trimmedDuration) : null;

    if (
      duration !== null &&
      (!Number.isInteger(duration) || duration < 1 || duration > 3650)
    ) {
      setActionError(t('goals.invalidDuration'));
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      const result = await createGoal({
        category: category.trim() || 'General',
        title: trimmedTitle,
        due_date:
          duration === null ? null : dueDateFromDays(duration, t),
        icon: 'school-outline',
      });

      if (result.ok) {
        setModalVisible(false);
      } else {
        setActionError(result.error.message);
      }
    } catch {
      logSafeError('goal.create_failed');
      setActionError(t('goals.createError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleGoalAction(id: number, progress: number) {
    setActionError(null);

    const result =
      progress >= 0.75
        ? await completeGoal(id)
        : await updateProgress(id, Math.min(progress + 0.25, 0.75));

    if (!result.ok) {
      setActionError(result.error.message);
    }
  }

  function refreshAll() {
    setActionError(null);
    void Promise.all([
      refreshGoals(),
      refreshHeatmap(),
      refreshStreak(),
    ]);
  }

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        refreshGoals(),
        refreshHeatmap(),
        refreshStreak(),
      ]);
    }, [refreshGoals, refreshHeatmap, refreshStreak])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        userInitial={displayName.charAt(0).toUpperCase() || '?'}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          {t('goals.consistency')}
        </Text>

        <Card>
          <Text style={styles.streakLabel}>
            {t('goals.currentStreak')}
          </Text>

          <View style={styles.streakRow}>
            <Text style={styles.streakValue}>
              {streakLoading
                ? '...'
                : t('goals.dayCount', { count: streak })}
            </Text>

            <View style={styles.legend}>
              <Text style={styles.legendLabel}>
                {t('goals.less')}
              </Text>

              {[0, 1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.legendDot,
                    getIntensityStyle(level),
                  ]}
                />
              ))}

              <Text style={styles.legendLabel}>
                {t('goals.more')}
              </Text>
            </View>
          </View>

          <View style={styles.heatmap}>
            {heatmap.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.heatmapRow}>
                {week.map((level, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.heatmapCell,
                      getIntensityStyle(level),
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          {!heatmapLoading &&
            heatmap.length === 0 &&
            !heatmapError && (
              <Text style={styles.stateText}>
                {t('goals.noStudyActivity')}
              </Text>
            )}
        </Card>

        <Text style={styles.sectionTitle}>
          {t('goals.activeGoals')}
        </Text>

        {(goalsLoading || heatmapLoading) && (
          <ActivityIndicator
            color={colors.primary}
            accessibilityLabel={t('goals.loadingGoals')}
          />
        )}

        {(goalsError ||
          heatmapError ||
          streakError ||
          actionError) && (
          <Pressable
            onPress={refreshAll}
            accessibilityRole="button"
            accessibilityLabel={t('goals.retryLoading')}
            style={styles.stateAction}
          >
            <Text style={styles.errorLabel}>
              {actionError ||
                goalsError?.message ||
                heatmapError?.message ||
                streakError?.message}{' '}
              · {t('goals.tapToRetry')}
            </Text>
          </Pressable>
        )}

        {!goalsLoading &&
          goals.length === 0 &&
          !goalsError && (
            <Text style={styles.stateText}>
              {t('goals.noActiveGoals')}
            </Text>
          )}

        <View style={styles.goalsList}>
          {goals.map((goal) => (
            <Card key={goal.id}>
              <View style={styles.goalHeader}>
                <Pill
                  label={
                    goal.category === 'General'
                      ? t('goals.general')
                      : goal.category
                  }
                  variant="secondary"
                />

                <View style={styles.goalIcon}>
                  <Ionicons
                    name={toIconName(goal.icon)}
                    size={20}
                    color={colors.primary}
                  />
                </View>
              </View>

              <Text style={styles.goalTitle}>
                {goal.title}
              </Text>

              <View style={styles.dueRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.inkMuted}
                />

                <Text style={styles.dueLabel}>
                  {formatDueDate(goal.due_date, t)}
                </Text>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  {t('goals.progress')}
                </Text>

                <Text style={styles.progressValue}>
                  {Math.round(goal.progress * 100)}%
                </Text>
              </View>

              <ProgressBar progress={goal.progress} />

              <View style={styles.goalAction}>
                <Button
                  label={
                    goal.progress >= 0.75
                      ? t('goals.completeGoal')
                      : goal.progress > 0
                        ? t('goals.continueStudy')
                        : t('goals.startGoal')
                  }
                  variant={
                    goal.progress > 0 ? 'primary' : 'muted'
                  }
                  icon={
                    goal.progress >= 0.75
                      ? 'checkmark'
                      : 'arrow-forward'
                  }
                  onPress={() => {
                    void handleGoalAction(goal.id, goal.progress);
                  }}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => {
          setActionError(null);
          openModal();
        }}
        accessibilityRole="button"
        accessibilityLabel={t('goals.addNewGoal')}
      >
        <Ionicons
          name="add"
          size={26}
          color={colors.ink}
        />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setModalVisible(false)}
          accessibilityLabel={t('goals.closeModal')}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalWrap}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(event) => event.stopPropagation()}
            >
              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={styles.modalTitle}
                  accessibilityRole="header"
                >
                  {t('goals.newGoal')}
                </Text>

                <Text style={styles.fieldLabel}>
                  {t('goals.category')}
                </Text>

                <TextInput
                  style={styles.input}
                  value={category}
                  onChangeText={setCategory}
                  placeholder={t('goals.categoryPlaceholder')}
                  placeholderTextColor={colors.inkFaint}
                  accessibilityLabel={t('goals.category')}
                  returnKeyType="next"
                />

                <Text style={styles.fieldLabel}>
                  {t('goals.title')}
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    titleError && styles.inputError,
                  ]}
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);

                    if (titleError && text.trim()) {
                      setTitleError(false);
                    }
                  }}
                  placeholder={t('goals.titlePlaceholder')}
                  placeholderTextColor={colors.inkFaint}
                  accessibilityLabel={t('goals.title')}
                  accessibilityHint={t('goals.titleRequired')}
                  returnKeyType="next"
                />

                {titleError && (
                  <Text
                    style={styles.errorLabel}
                    accessibilityRole="alert"
                  >
                    {t('goals.titleRequired')}
                  </Text>
                )}

                <Text style={styles.fieldLabel}>
                  {t('goals.durationDays')}
                </Text>

                <TextInput
                  style={styles.input}
                  value={durationDays}
                  onChangeText={(value) => {
                    setDurationDays(value.replace(/\D/g, ''));
                    setActionError(null);
                  }}
                  placeholder={t('goals.durationPlaceholder')}
                  placeholderTextColor={colors.inkFaint}
                  accessibilityLabel={t('goals.durationAccessibility')}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={4}
                  returnKeyType="done"
                />

                {actionError && (
                  <Text
                    style={styles.errorLabel}
                    accessibilityRole="alert"
                  >
                    {actionError}
                  </Text>
                )}

                <View style={styles.modalActions}>
                  <View style={styles.modalAction}>
                    <Button
                      label={t('common.cancel')}
                      variant="muted"
                      onPress={() => setModalVisible(false)}
                      disabled={saving}
                    />
                  </View>

                  <View style={styles.modalAction}>
                    <Button
                      label={
                        saving
                          ? t('goals.saving')
                          : t('common.save')
                      }
                      variant="primary"
                      onPress={() => {
                        void handleSave();
                      }}
                      disabled={saving}
                    />
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
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
  goalsList: {
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 18,
    color: colors.ink,
  },
  streakLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  streakValue: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 22,
    color: colors.primary,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.inkMuted,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  heatmap: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heatmapCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 20,
    color: colors.ink,
    marginTop: spacing.md,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  dueLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkMuted,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
  },
  progressValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
  goalAction: {
    marginTop: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(33,33,33,0.5)',
    justifyContent: 'flex-end',
  },
  modalWrap: {
    width: '100%',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '90%',
  },
  intensity0: {
    backgroundColor: colors.surface,
  },
  intensity1: {
    backgroundColor: '#FCE9A8',
  },
  intensity2: {
    backgroundColor: '#F9DA55',
  },
  intensity3: {
    backgroundColor: '#F5CC00',
  },
  intensity4: {
    backgroundColor: '#C9A400',
  },
  modalContent: {
    gap: spacing.xs,
  },
  modalTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  input: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  stateText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  stateAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalAction: {
    flex: 1,
  },
});

function getIntensityStyle(level: number) {
  const intensityStyles = [
    styles.intensity0,
    styles.intensity1,
    styles.intensity2,
    styles.intensity3,
    styles.intensity4,
  ];

  return intensityStyles[Math.max(0, Math.min(4, level))];
}

function formatDueDate(
  value: string | null,
  t: TFunction
) {
  if (!value) {
    return t('goals.noDueDate');
  }

  const due = parseIsoDate(value);
  const today = parseIsoDate(todayInSaoPaulo());

  if (!due || !today) {
    return value;
  }

  const days = Math.ceil(
    (due.getTime() - today.getTime()) / 86_400_000
  );

  if (days < 0) {
    return t('goals.overdue', {
      count: Math.abs(days),
    });
  }

  if (days === 0) {
    return t('goals.dueToday');
  }

  return t('goals.remainingDays', { count: days });
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

function todayInSaoPaulo() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

function dueDateFromDays(days: number, t: TFunction) {
  const today = parseIsoDate(todayInSaoPaulo());

  if (!today) {
    throw new Error(t('goals.dateCalculationError'));
  }

  today.setUTCDate(today.getUTCDate() + days);

  return today.toISOString().slice(0, 10);
}

function toIconName(
  icon: string | null
): keyof typeof Ionicons.glyphMap {
  return icon && icon in Ionicons.glyphMap
    ? (icon as keyof typeof Ionicons.glyphMap)
    : 'school-outline';
}
