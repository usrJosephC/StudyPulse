import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Login } from '../components/Login';
import { RootStackParamList } from '../navigation/RootStack';
import { colors, fonts, spacing } from '../theme';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

export function LoginPage({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              Welcome back!
            </Text>

            <Text style={styles.subtitle}>
              Log in to continue your study journey.
            </Text>
          </View>

          <Login
            onLoginSuccess={() =>
              navigation.replace('Main')
            }
            onCreateAccount={() =>
              navigation.navigate('Register')
            }
          />
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
    width: 180,
    height: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});