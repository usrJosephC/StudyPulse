import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { Register } from '../components/Register';
import { RootStackParamList } from '../navigation/RootStack';
import { colors, fonts, spacing } from '../theme';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Register'
>;

export function RegisterPage({
  navigation,
}: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Image
            source={require('../../assets/studypulse-logo-v1.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="StudyPulse"
          />

          <View style={styles.header}>
            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Create your account and start your study journey.
            </Text>
          </View>

          <View style={styles.form}>
            <Register />
          </View>

          <Text style={styles.footer}>
            Already have an account?{' '}

            <Text
              style={styles.footerLink}
              onPress={() => navigation.goBack()}
            >
              Log in
            </Text>
          </Text>
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

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },

  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  logo: {
    width: 180,
    height: 66,
    marginBottom: spacing.lg,
  },

  title: {
    fontFamily: fonts.headlineBold,
    fontSize: 26,
    color: colors.ink,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },

  form: {
    width: '100%',
    maxWidth: 500,
  },

  footer: {
    marginTop: spacing.xl,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },

  footerLink: {
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
  },
});
