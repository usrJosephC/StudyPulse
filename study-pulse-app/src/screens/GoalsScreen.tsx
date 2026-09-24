import { useState } from 'react';
import {
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
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { colors, fonts, radius, spacing } from '../theme';
import { activeGoals as initialGoals, consistencyWeeks, currentUser, Goal } from '../data/mockData';

export function GoalsScreen() {
  const [goals, setGoals] = useState(initialGoals);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [titleError, setTitleError] = useState(false);

  function openModal() {
    setCategory('');
    setTitle('');
    setDue('');
    setTitleError(false);
    setModalVisible(true);
  }

  function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError(true);
      return;
    }
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      category: category.trim() || 'General',
      title: trimmedTitle,
      due: due.trim() || 'No due date',
      progress: 0,
      icon: 'school-outline',
      cta: 'Start Goal',
      ctaVariant: 'primary',
      ctaIcon: 'arrow-forward',
    };
    setGoals((current) => [newGoal, ...current]);
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader userInitial={currentUser.initial} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Consistency</Text>
        <Card>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakValue}>{currentUser.streak} Days</Text>
            <View style={styles.legend}>
              <Text style={styles.legendLabel}>Less</Text>
              {[0, 1, 2, 3, 4].map((_, i) => (
                <View key={i} style={[styles.legendDot, getIntensityStyle(i)]} />
              ))}
              <Text style={styles.legendLabel}>More</Text>
            </View>
          </View>
          <View style={styles.heatmap}>
            {consistencyWeeks.map((week, wi) => (
              <View key={wi} style={styles.heatmapRow}>
                {week.map((level, di) => (
                  <View key={di} style={[styles.heatmapCell, getIntensityStyle(level)]} />
                ))}
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Active Goals</Text>
        <View style={styles.goalsList}>
          {goals.map((goal) => (
            <Card key={goal.id}>
              <View style={styles.goalHeader}>
                <Pill label={goal.category} variant="secondary" />
                <View style={styles.goalIcon}>
                  <Ionicons name={goal.icon} size={20} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <View style={styles.dueRow}>
                <Ionicons name="time-outline" size={14} color={colors.inkMuted} />
                <Text style={styles.dueLabel}>{goal.due}</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>{Math.round(goal.progress * 100)}%</Text>
              </View>
              <ProgressBar progress={goal.progress} />
              <View style={styles.goalAction}>
                <Button label={goal.cta} variant={goal.ctaVariant} icon={goal.ctaIcon} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <Pressable
        style={styles.fab}
        onPress={openModal}
        accessibilityRole="button"
        accessibilityLabel="Add new goal"
      >
        <Ionicons name="add" size={26} color={colors.ink} />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} accessibilityLabel="Close modal">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalWrap}
          >
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
              <Text style={styles.modalTitle} accessibilityRole="header">New Goal</Text>

              <Text style={styles.fieldLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Science"
                placeholderTextColor={colors.inkFaint}
                accessibilityLabel="Goal category"
                returnKeyType="next"
              />

              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={[styles.input, titleError && styles.inputError]}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (titleError && text.trim()) setTitleError(false);
                }}
                placeholder="e.g. Finish React Native course"
                placeholderTextColor={colors.inkFaint}
                accessibilityLabel="Goal title"
                accessibilityHint="Required"
                returnKeyType="next"
              />
              {titleError && <Text style={styles.errorLabel}>Title is required</Text>}

              <Text style={styles.fieldLabel}>Due</Text>
              <TextInput
                style={styles.input}
                value={due}
                onChangeText={setDue}
                placeholder="e.g. Due in 5 days"
                placeholderTextColor={colors.inkFaint}
                accessibilityLabel="Goal due date"
                returnKeyType="done"
              />

              <View style={styles.modalActions}>
                <View style={styles.modalAction}>
                  <Button label="Cancel" variant="muted" onPress={() => setModalVisible(false)} />
                </View>
                <View style={styles.modalAction}>
                  <Button label="Save" variant="primary" onPress={handleSave} />
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
  intensity0: { backgroundColor: colors.surface },
  intensity1: { backgroundColor: '#FCE9A8' },
  intensity2: { backgroundColor: '#F9DA55' },
  intensity3: { backgroundColor: '#F5CC00' },
  intensity4: { backgroundColor: '#C9A400' },
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalAction: {
    flex: 1,
  },
  goalAction: {
    marginTop: spacing.lg,
  },
});

function getIntensityStyle(level: number) {
  return [styles.intensity0, styles.intensity1, styles.intensity2, styles.intensity3, styles.intensity4][level];
}
