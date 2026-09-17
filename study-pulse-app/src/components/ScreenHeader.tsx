import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { colors, fonts, spacing } from '../theme';

type Props = {
  userInitial: string;
};

export function ScreenHeader({ userInitial }: Props) {
  return (
    <View style={styles.row}>
      <Avatar label={userInitial} size={40} ringColor={colors.primary} />
      <Text style={styles.title}>StudyPulse</Text>
      <Pressable style={styles.bell}>
        <Ionicons name="notifications-outline" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.headlineExtraBold,
    fontSize: 20,
    color: colors.secondary,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
});
