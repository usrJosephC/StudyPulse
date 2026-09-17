import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { colors, fonts, radius, spacing } from '../theme';
import { activeGoals, consistencyWeeks, currentUser } from '../data/mockData';

const intensityColors = [colors.surface, '#FCE9A8', '#F9DA55', '#F5CC00', '#C9A400'];

export function GoalsScreen() {
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
              {intensityColors.map((c, i) => (
                <View key={i} style={[styles.legendDot, { backgroundColor: c }]} />
              ))}
              <Text style={styles.legendLabel}>More</Text>
            </View>
          </View>
          <View style={styles.heatmap}>
            {consistencyWeeks.map((week, wi) => (
              <View key={wi} style={styles.heatmapRow}>
                {week.map((level, di) => (
                  <View key={di} style={[styles.heatmapCell, { backgroundColor: intensityColors[level] }]} />
                ))}
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Active Goals</Text>
        <View style={{ gap: spacing.lg }}>
          {activeGoals.map((goal) => (
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
              <View style={{ marginTop: spacing.lg }}>
                <Button label={goal.cta} variant={goal.ctaVariant} icon={goal.ctaIcon} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <Pressable style={styles.fab}>
        <Ionicons name="add" size={26} color={colors.ink} />
      </Pressable>
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
});
