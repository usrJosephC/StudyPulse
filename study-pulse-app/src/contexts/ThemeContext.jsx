import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import {
  themes,
  type Colors,
  type ThemeName,
} from '../theme/colors';

type ThemeContextData = {
  tema: ThemeName;
  temaAtual: Colors;
  alternarTema: () => void;
  definirTema: (novoTema: ThemeName) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeContext = createContext<ThemeContextData | undefined>(
  undefined,
);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [tema, setTema] = useState<ThemeName>('light');

  const alternarTema = () => {
    setTema((prev) => (prev === 'light' ? 'dark' : 'light'));
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
