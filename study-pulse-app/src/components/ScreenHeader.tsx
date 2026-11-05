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
import { useTranslation } from 'react-i18next';
import { useOpenNotifications } from './NotificationsHost';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/RootTabs';

type Props = {
  userInitial: string;
};

export function ScreenHeader({ userInitial }: Props) {
  const { temaAtual } = useTheme();
  const { t } = useTranslation();
  const openNotifications = useOpenNotifications();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

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
      <Pressable onPress={() => navigation.navigate('Profile')} accessibilityRole="button" accessibilityLabel={t('navigation.tabs.profile')} hitSlop={8}>
        <Avatar label={userInitial} size={40} ringColor={temaAtual.primary} />
      </Pressable>

      <Text style={styles.title}>StudyPulse</Text>

      <Pressable
        style={styles.bell}
        onPress={openNotifications}
        accessibilityRole="button"
        accessibilityLabel={t('profile.settings.notifications')}
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
