import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  useFonts,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';

import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';

import { i18nReady } from './src/i18n';
import { RootStack } from './src/navigation/RootStack';
import { AuthProvider } from './src/context/AuthContext';
import { colors } from './src/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.card,
    text: colors.ink,
    border: colors.border,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const [i18nLoaded, setI18nLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    i18nReady
      .then(() => {
        if (mounted) {
          setI18nLoaded(true);
        }
      })
      .catch((error) => {
        console.error(
          'Failed to initialize translations:',
          error
        );

        if (mounted) {
          setI18nLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!fontsLoaded || !i18nLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootStack />
        </NavigationContainer>
      </AuthProvider>

      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
