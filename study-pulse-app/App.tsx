
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
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
import {
  ThemeProvider,
  useTheme,
} from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { logSafeError } from './src/lib/logger';

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
      .catch(() => {
        logSafeError('translations.initialization_failed');

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
          backgroundColor: '#FAFAFA',
        }}
      >
        <ActivityIndicator color="#F5CC00" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp() {
  const { tema, temaAtual, carregandoTema } = useTheme();

  if (carregandoTema) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: temaAtual.background,
        }}
      >
        <ActivityIndicator color={temaAtual.primary} size="large" />
      </View>
    );
  }

  const baseTheme = tema === 'dark' ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: temaAtual.background,
      primary: temaAtual.primary,
      card: temaAtual.card,
      text: temaAtual.ink,
      border: temaAtual.border,
    },
  };

  return (
    <>
      <NavigationContainer theme={navigationTheme}>
        <RootStack />
      </NavigationContainer>

      <StatusBar style={tema === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
