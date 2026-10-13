import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationEn from "./locales/en-US/translations.json";
import translationPt from "./locales/pt-BR/translations.json";

const resources = {
    "en-US": { translation: translationEn },
    en: { translation: translationEn },
    "pt-BR": { translation: translationPt },
    pt: { translation: translationPt },
};

const LANGUAGE_KEY = "@app_Language";

const initI18n = async () => {
    try {
        // tenta carregar a linguagem salva
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

        // determina a linguagem a ser usada
        let selectedLanguage = savedLanguage;

        if (!selectedLanguage) {
            // se não houver linguagem salva, usa a do dispositivo
            const deviceLocales = Localization.getLocales();
            const deviceLocale = deviceLocales[0]?.languageTag || "pt-BR";
            const languageCode = deviceLocale.split('-')[0];

            if (deviceLocale in resources) { // verifica se o locale completo está disponível
                selectedLanguage = deviceLocale;
            } else if (languageCode in resources) { // verifica se o código da linguagem está disponível
                selectedLanguage = languageCode;
            } else {
                selectedLanguage = "pt-BR"; // padrão
            }
        }

        // eslint-disable-next-line import/no-named-as-default-member
        await i18n.use(initReactI18next).init({
            resources,
            lng: selectedLanguage,
            fallbackLng: {
                "en-*": ["en-US", "en"],
                "pt-*": ["pt-BR", "pt"],
                default: ["pt-BR"],
            },
            interpolation: {
                escapeValue: false
            },
            react: {
                useSuspense: false
            }
        });

        if (!savedLanguage) {
            await AsyncStorage.setItem(LANGUAGE_KEY, selectedLanguage);
        }
    } catch (error) {
        console.error("Erro ao inicializar i18n:", error);

        // eslint-disable-next-line import/no-named-as-default-member
        await i18n.use(initReactI18next).init({ // inicializa com valores padrão em caso de erro
            resources,
            lng: "pt-BR",
            fallbackLng: "pt-BR",
            interpolation: {
                escapeValue: false
            },
            react: {
                useSuspense: false
            },
        });
    }
};

initI18n();

export default i18n;
