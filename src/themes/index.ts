import { createTheme, Theme, type ThemeOptions, PaletteMode } from '@mui/material';
import {
  LIGHT_THEME_COLORS,
  DARK_THEME_COLORS,
  FUNCTIONAL_COLORS,
  TEXT_COLORS,
  withOpacity,
} from './colors';

// Tema personalizado baseado na nova identidade visual
const getDesignTokens = (mode: PaletteMode): ThemeOptions => {
  const isLight = mode === 'light';
  const themeColors = isLight ? LIGHT_THEME_COLORS : DARK_THEME_COLORS;
  const textColors = isLight ? TEXT_COLORS.light : TEXT_COLORS.dark;

  return {
    palette: {
      mode,
      ...(isLight
        ? {
            // ==================== TEMA LIGHT ====================
            primary: {
              main: themeColors.primary.main,
              light: themeColors.primary.light,
              dark: themeColors.primary.dark,
              contrastText: themeColors.primary.contrastText,
            },
            secondary: {
              main: themeColors.secondary.main,
              light: themeColors.secondary.light,
              dark: themeColors.secondary.dark,
              contrastText: themeColors.secondary.contrastText,
            },
            background: {
              default: themeColors.background.default,
              paper: themeColors.background.paper,
            },
            text: {
              primary: textColors.primary,
              secondary: textColors.secondary,
              disabled: withOpacity(textColors.muted, 0.6),
            },
            success: {
              main: FUNCTIONAL_COLORS.success.main,
              light: FUNCTIONAL_COLORS.success.light,
              dark: FUNCTIONAL_COLORS.success.dark,
              contrastText: '#FFFFFF',
            },
            error: {
              main: FUNCTIONAL_COLORS.error.main,
              light: FUNCTIONAL_COLORS.error.light,
              dark: FUNCTIONAL_COLORS.error.dark,
              contrastText: '#FFFFFF',
            },
            warning: {
              main: FUNCTIONAL_COLORS.warning.main,
              light: FUNCTIONAL_COLORS.warning.light,
              dark: FUNCTIONAL_COLORS.warning.dark,
              contrastText: textColors.primary,
            },
            info: {
              main: FUNCTIONAL_COLORS.info.main,
              light: FUNCTIONAL_COLORS.info.light,
              dark: FUNCTIONAL_COLORS.info.dark,
              contrastText: '#FFFFFF',
            },
            divider: withOpacity(textColors.primary, 0.12),
          }
        : {
            // ==================== TEMA DARK ====================
            primary: {
              main: themeColors.primary.main,
              light: themeColors.primary.light,
              dark: themeColors.primary.dark,
              contrastText: themeColors.primary.contrastText,
            },
            secondary: {
              main: themeColors.secondary.main,
              light: themeColors.secondary.light,
              dark: themeColors.secondary.dark,
              contrastText: themeColors.secondary.contrastText,
            },
            background: {
              default: themeColors.background.default,
              paper: themeColors.background.paper,
            },
            text: {
              primary: textColors.primary,
              secondary: textColors.secondary,
              disabled: withOpacity(textColors.secondary, 0.6),
            },
            success: {
              main: FUNCTIONAL_COLORS.success.light,
              light: FUNCTIONAL_COLORS.success.main,
              dark: FUNCTIONAL_COLORS.success.dark,
              contrastText: '#FFFFFF',
            },
            error: {
              main: FUNCTIONAL_COLORS.error.light,
              light: FUNCTIONAL_COLORS.error.main,
              dark: FUNCTIONAL_COLORS.error.dark,
              contrastText: '#FFFFFF',
            },
            warning: {
              main: FUNCTIONAL_COLORS.warning.light,
              light: FUNCTIONAL_COLORS.warning.main,
              dark: FUNCTIONAL_COLORS.warning.dark,
              contrastText: themeColors.background.default,
            },
            info: {
              main: FUNCTIONAL_COLORS.info.light,
              light: FUNCTIONAL_COLORS.info.main,
              dark: FUNCTIONAL_COLORS.info.dark,
              contrastText: '#FFFFFF',
            },
            divider: withOpacity(textColors.primary, 0.12),
          }),
    },
    typography: {
      fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
      fontSize: 14,
      fontWeightLight: 300, // Gotham Light
      fontWeightRegular: 400, // Gotham Book
      fontWeightMedium: 500, // Gotham Medium
      fontWeightBold: 700, // Gotham Bold

      // ==================== HIERARQUIA TIPOGRÁFICA ====================
      h1: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '2.75rem',
        fontWeight: 900, // Gotham Black - Para títulos principais
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        '@media (max-width:600px)': {
          fontSize: '2.25rem',
        },
      },
      h2: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '2.25rem',
        fontWeight: 700, // Gotham Bold - Para subtítulos importantes
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        '@media (max-width:600px)': {
          fontSize: '1.875rem',
        },
      },
      h3: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '1.875rem',
        fontWeight: 500, // Gotham Medium - Para seções
        lineHeight: 1.4,
        letterSpacing: '0em',
      },
      h4: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '1.5rem',
        fontWeight: 500, // Gotham Medium - Para subseções
        lineHeight: 1.4,
        letterSpacing: '0.01em',
      },
      h5: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '1.25rem',
        fontWeight: 500, // Gotham Medium - Para pequenos títulos
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },
      h6: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '1.125rem',
        fontWeight: 500, // Gotham Medium - Para cabeçalhos menores
        lineHeight: 1.5,
        letterSpacing: '0.02em',
      },

      // ==================== TEXTOS CORPORAIS ====================
      body1: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '1rem',
        fontWeight: 400, // Gotham Book - Para textos principais
        lineHeight: 1.6,
        letterSpacing: '0.01em',
      },
      body2: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '0.875rem',
        fontWeight: 400, // Gotham Book - Para textos secundários
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },

      // ==================== SUBTÍTULOS ====================
      subtitle1: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '1rem',
        fontWeight: 500, // Gotham Medium - Para subtítulos destacados
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },
      subtitle2: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500, // Gotham Medium - Para subtítulos menores
        lineHeight: 1.4,
        letterSpacing: '0.02em',
      },

      // ==================== TEXTOS ESPECIAIS ====================
      caption: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '0.75rem',
        fontWeight: 400, // Gotham Book - Para legendas
        lineHeight: 1.4,
        letterSpacing: '0.03em',
      },
      overline: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '0.75rem',
        fontWeight: 500, // Gotham Medium - Para textos sobrescritos
        lineHeight: 1.4,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },

      // ==================== BOTÕES ====================
      button: {
        fontFamily: '"Gotham", "Helvetica Neue", "Arial", sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500, // Gotham Medium - Para botões
        lineHeight: 1.4,
        letterSpacing: '0.02em',
        textTransform: 'none', // Sem transformação automática
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      // ==================== COMPONENTES BUTTON ====================
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0px 4px 12px ${withOpacity(themeColors.primary.main, 0.3)}`,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: withOpacity(themeColors.primary.main, 0.08),
            },
          },
        },
      },

      // ==================== COMPONENTES CARD ====================
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isLight
              ? `0px 2px 8px ${withOpacity(themeColors.primary.main, 0.1)}`
              : `0px 2px 8px ${withOpacity('#000000', 0.3)}`,
            borderRadius: '12px',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isLight
                ? `0px 8px 24px ${withOpacity(themeColors.primary.main, 0.15)}`
                : `0px 8px 24px ${withOpacity('#000000', 0.4)}`,
              transition: 'all 0.3s ease-in-out',
            },
          },
        },
      },

      // ==================== COMPONENTES INPUT ====================
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': {
                borderColor: withOpacity(themeColors.primary.main, 0.3),
              },
              '&:hover fieldset': {
                borderColor: themeColors.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: themeColors.primary.main,
                borderWidth: '2px',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: themeColors.primary.main,
            },
          },
        },
      },

      // ==================== COMPONENTES CHIP ====================
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: withOpacity(themeColors.primary.main, 0.1),
            color: themeColors.primary.main,
            '&:hover': {
              backgroundColor: withOpacity(themeColors.primary.main, 0.2),
            },
          },
          colorSecondary: {
            backgroundColor: withOpacity(themeColors.secondary.main, 0.1),
            color: themeColors.secondary.main,
            '&:hover': {
              backgroundColor: withOpacity(themeColors.secondary.main, 0.2),
            },
          },
        },
      },

      // ==================== COMPONENTES PAPER ====================
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '12px',
          },
          elevation1: {
            boxShadow: isLight
              ? `0px 1px 3px ${withOpacity(themeColors.primary.main, 0.1)}`
              : `0px 1px 3px ${withOpacity('#000000', 0.3)}`,
          },
          elevation2: {
            boxShadow: isLight
              ? `0px 2px 6px ${withOpacity(themeColors.primary.main, 0.12)}`
              : `0px 2px 6px ${withOpacity('#000000', 0.35)}`,
          },
        },
      },

      // ==================== COMPONENTES APPBAR ====================
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? themeColors.background.paper : themeColors.background.paper,
            color: textColors.primary,
            boxShadow: 'none',
            borderBottom: `1px solid ${withOpacity(themeColors.primary.main, 0.1)}`,
          },
        },
      },

      // ==================== COMPONENTES DRAWER ====================
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? themeColors.background.paper : themeColors.background.paper,
            borderRight: `1px solid ${withOpacity(themeColors.primary.main, 0.1)}`,
          },
        },
      },
    },
  };
};

// Cache do tema para melhor performance
let cachedTheme: { [key: string]: Theme } = {};

export const getTheme = (mode: PaletteMode): Theme => {
  if (!cachedTheme[mode]) {
    cachedTheme[mode] = createTheme(getDesignTokens(mode));
  }
  return cachedTheme[mode];
};

// Limpa o cache quando necessário (para desenvolvimento)
export const clearThemeCache = (): void => {
  cachedTheme = {};
};

// Exporta o tema padrão
export default getTheme;

// ==================== TIPOS PERSONALIZADOS ====================

// Extend the Theme interface to include custom properties
declare module '@mui/material/styles' {
  interface Palette {
    surface?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }

  interface TypeBackground {
    accent?: string;
  }

  interface TypeText {
    muted?: string;
    accent?: string;
  }
}

// Utilitário para obter cores do tema
export const getThemeColors = (mode: PaletteMode) => {
  return mode === 'light' ? LIGHT_THEME_COLORS : DARK_THEME_COLORS;
};

// Utilitário para obter cores de texto do tema
export const getTextColors = (mode: PaletteMode) => {
  return mode === 'light' ? TEXT_COLORS.light : TEXT_COLORS.dark;
};
