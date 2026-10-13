import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import translationEn from './locales/en-US/translations.json';
import translationPt from './locales/pt-BR/translations.json';

const resources = {
  'en-US': { translation: translationEn },
  en: { translation: translationEn },
  'pt-BR': { translation: translationPt },
  pt: { translation: translationPt },
};

const LANGUAGE_KEY = '@app_Language';

export type AppLanguage = 'en-US' | 'pt-BR';

function normalizeLanguage(language: string): AppLanguage {
  return language.toLowerCase().startsWith('en')
    ? 'en-US'
    : 'pt-BR';
}

async function getInitialLanguage(): Promise<AppLanguage> {
  try {
    const savedLanguage = await AsyncStorage.getItem(
      LANGUAGE_KEY
    );

    if (
      savedLanguage === 'en-US' ||
      savedLanguage === 'en' ||
      savedLanguage === 'pt-BR' ||
      savedLanguage === 'pt'
    ) {
      return normalizeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error(
      'Error loading saved language:',
      error
    );
  }

  const deviceLocale =
    Localization.getLocales()[0]?.languageTag ?? 'pt-BR';

  return normalizeLanguage(deviceLocale);
}

async function initI18n(): Promise<void> {
  const initialLanguage = await getInitialLanguage();

  try {
    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLanguage,
      fallbackLng: {
        'en-*': ['en-US', 'en'],
        'pt-*': ['pt-BR', 'pt'],
        default: ['pt-BR'],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      compatibilityJSON: 'v4',
    });
  } catch (error) {
    console.error(
      'Error initializing i18n:',
      error
    );

    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        resources,
        lng: 'pt-BR',
        fallbackLng: 'pt-BR',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
    }
  }
}

export const i18nReady = initI18n();

export async function changeAppLanguage(
  language: AppLanguage
): Promise<void> {
  await i18nReady;

  await i18n.changeLanguage(language);

  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

export default i18n;
