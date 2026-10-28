import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Avatar } from './Avatar';

import { fonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  userInitial: string;
};

export function ScreenHeader({ userInitial }: Props) {
  const { temaAtual } = useTheme();

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
      color: temaAtual.secondary,
    },

    bell: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: temaAtual.card,
    },
  });

  return (
    <View style={styles.row}>
      <Avatar
        label={userInitial}
        size={40}
        ringColor={temaAtual.primary}
      />

      <Text style={styles.title}>StudyPulse</Text>

      <Pressable
        style={styles.bell}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Ionicons
          name="notifications-outline"
          size={20}
          color={temaAtual.ink}
        />
      </Pressable>
    </View>
  );
}
