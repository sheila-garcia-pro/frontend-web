import { useState, useEffect, useMemo } from 'react';
import { PaletteMode } from '@mui/material';
import { getTheme } from '@themes/index';

type ThemeMode = 'light' | 'dark';
const THEME_MODE_KEY = 'theme-mode';

export const useThemeMode = () => {
  // Inicializa com o tema salvo no localStorage ou o padrão do sistema
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null;

    if (savedMode) {
      return savedMode;
    }

    // Verifica preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  // Atualiza o tema quando o modo mudar
  useEffect(() => {
    localStorage.setItem(THEME_MODE_KEY, mode);
  }, [mode]);

  // Função para alternar entre os temas
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Memoriza o tema atual para evitar recriação desnecessária
  const theme = useMemo(() => getTheme(mode as PaletteMode), [mode]);

  return {
    theme,
    mode,
    toggleTheme,
    isLight: mode === 'light',
    isDark: mode === 'dark',
  };
};

export default useThemeMode;
