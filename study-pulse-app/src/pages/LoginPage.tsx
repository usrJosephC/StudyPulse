import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { Login } from '../components/Login';
import { RootStackParamList } from '../navigation/RootStack';
import { useTheme } from '../contexts/ThemeContext';
import { ProfilePreferences } from '../screens/ProfileFlows';
import { fonts, spacing } from '../theme';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

export function LoginPage({ navigation }: Props) {
  const { t } = useTranslation();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const { temaAtual } = useTheme();

  const styles = StyleSheet.create({
    preferencesButton: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: spacing.xs, borderRadius: 22 },
    safe: {
      flex: 1,
      backgroundColor: temaAtual.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    container: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      justifyContent: 'center',
      flexGrow: 1,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    logo: {
      width: 240,
      height: 90,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    title: {
      fontFamily: fonts.headlineExtraBold,
      fontSize: 28,
      color: temaAtual.ink,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: fonts.bodyRegular,
      fontSize: 14,
      color: temaAtual.inkMuted,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.preferencesButton} onPress={() => setPreferencesOpen(true)} accessibilityRole="button" accessibilityLabel={t('profile.settings.preferences')} hitSlop={4}><Ionicons name="options-outline" size={21} color={temaAtual.secondary} /></Pressable>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/studypulse-logo-v1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              {t('loginPage.title')}
            </Text>

            <Text style={styles.subtitle}>
              {t('loginPage.subtitle')}
            </Text>
          </View>

          <Login
            onCreateAccount={() =>
              navigation.navigate('Register')
            }
          />
        </View>
      </ScrollView>
      <Modal visible={preferencesOpen} animationType="slide" onRequestClose={() => setPreferencesOpen(false)}><SafeAreaView style={{ flex: 1, backgroundColor: temaAtual.background }} edges={['top', 'bottom']}><ProfilePreferences close={() => setPreferencesOpen(false)} /></SafeAreaView></Modal>
    </SafeAreaView>
  );
}
