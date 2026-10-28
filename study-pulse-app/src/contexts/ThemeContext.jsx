import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  themes,
  type Colors,
  type ThemeName,
} from '../theme/colors';

const THEME_STORAGE_KEY = '@StudyPulse:theme';

type ThemeContextData = {
  tema: ThemeName;
  temaAtual: Colors;
  carregandoTema: boolean;
  alternarTema: () => void;
  definirTema: (novoTema: ThemeName) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeContext = createContext<
  ThemeContextData | undefined
>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [tema, setTema] = useState<ThemeName>('light');
  const [carregandoTema, setCarregandoTema] = useState(true);

  useEffect(() => {
    async function carregarPreferencia() {
      try {
        const temaSalvo = await AsyncStorage.getItem(
          THEME_STORAGE_KEY,
        );

        if (temaSalvo === 'light' || temaSalvo === 'dark') {
          setTema(temaSalvo);
        }
      } catch (error) {
        console.error('Erro ao carregar o tema:', error);
      } finally {
        setCarregandoTema(false);
      }
    }

    carregarPreferencia();
  }, []);

  useEffect(() => {
    if (carregandoTema) {
      return;
    }

    async function salvarPreferencia() {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, tema);
      } catch (error) {
        console.error('Erro ao salvar o tema:', error);
      }
    }

    salvarPreferencia();
  }, [tema, carregandoTema]);

  const alternarTema = () => {
    setTema((atual) => (atual === 'light' ? 'dark' : 'light'));
  };

  const definirTema = (novoTema: ThemeName) => {
    setTema(novoTema);
  };

  const temaAtual = themes[tema];

  return (
    <ThemeContext.Provider
      value={{
        tema,
        temaAtual,
        carregandoTema,
        alternarTema,
        definirTema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextData {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme deve ser utilizado dentro de um ThemeProvider.',
    );
  }

  return context;
}
