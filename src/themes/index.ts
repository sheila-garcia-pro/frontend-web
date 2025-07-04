import { createTheme, Theme, ThemeOptions, PaletteMode } from '@mui/material';

// Tema personalizado compartilhado entre light e dark
const getDesignTokens = (mode: PaletteMode) => {
  const palette = {
    mode,
    ...(mode === 'light'
      ? {
          // Paleta moderna e limpa para o tema light
          primary: {
            main: '#059669', // Verde moderno e profissional
            light: '#34D399', // Verde claro
            dark: '#047857', // Verde escuro
            contrastText: '#FFFFFF', // Branco puro para contraste
          },
          secondary: {
            main: '#DDE19E', // Amarelo claro esverdeado (cor secundária solicitada)
            light: '#F5F3E7', // Bege areia
            dark: '#C1C8B1', // Verde pastel
            contrastText: '#3A4534', // Verde oliva escuro
          },
          background: {
            default: '#FFFFFF', // Branco puro
            paper: '#FAFAFA', // Branco levemente acinzentado
          },
          text: {
            primary: '#1A1A1A', // Preto suave (não puro para não cansar)
            secondary: '#666666', // Cinza médio
          },
          success: {
            main: '#22C55E', // Verde moderno
            light: '#4ADE80', // Verde claro
            dark: '#16A34A', // Verde escuro
          },
          error: {
            main: '#EF4444', // Vermelho moderno
            light: '#F87171', // Vermelho claro
            dark: '#DC2626', // Vermelho escuro
          },
          warning: {
            main: '#F59E0B', // Amarelo/laranja moderno
            light: '#FBBF24', // Amarelo claro
            dark: '#D97706', // Amarelo escuro
          },
          info: {
            main: '#06B6D4', // Ciano moderno
            light: '#22D3EE', // Ciano claro
            dark: '#0891B2', // Ciano escuro
          },
          divider: 'rgba(0, 0, 0, 0.08)', // Divisor sutil
        }
      : {
          // Paleta moderna e limpa para o tema dark
          primary: {
            main: '#10B981', // Verde mais claro para contraste no dark
            light: '#34D399', // Verde claro
            dark: '#059669', // Verde escuro
            contrastText: '#FFFFFF', // Branco puro
          },
          secondary: {
            main: '#94A3B8', // Cinza azulado claro
            light: '#CBD5E1', // Cinza muito claro
            dark: '#64748B', // Cinza médio
            contrastText: '#1A1A1A', // Preto suave
          },
          background: {
            default: '#0F0F0F', // Preto profundo mas não puro
            paper: '#1A1A1A', // Preto suave para cards
          },
          text: {
            primary: '#FFFFFF', // Branco puro
            secondary: '#A1A1AA', // Cinza claro
          },
          success: {
            main: '#16A34A', // Verde para dark mode
            light: '#22C55E', // Verde claro
            dark: '#15803D', // Verde escuro
          },
          error: {
            main: '#DC2626', // Vermelho para dark mode
            light: '#EF4444', // Vermelho claro
            dark: '#B91C1C', // Vermelho escuro
          },
          warning: {
            main: '#D97706', // Amarelo para dark mode
            light: '#F59E0B', // Amarelo claro
            dark: '#B45309', // Amarelo escuro
          },
          info: {
            main: '#0891B2', // Ciano para dark mode
            light: '#06B6D4', // Ciano claro
            dark: '#0E7490', // Ciano escuro
          },
          divider: 'rgba(255, 255, 255, 0.08)', // Divisor sutil para dark
        }),
  };

  return {
    palette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '2rem',
        },
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '1.75rem',
        },
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
      borderRadius: 6, // Bordas mais modernas e sutis
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 20px',
            borderRadius: '6px', // Bordas modernas
            fontSize: '0.875rem',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          fullWidth: true,
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              '& fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? '#059669' : '#10B981',
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'light' ? '#059669' : '#10B981',
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0, // Remove sombra para visual mais limpo
        },
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
            borderBottom:
              mode === 'light'
                ? '1px solid rgba(0, 0, 0, 0.08)'
                : '1px solid rgba(255, 255, 255, 0.08)',
            '& .MuiToolbar-root': {
              height: '64px',
              minHeight: '64px !important',
            },
            '& .MuiTypography-root': {
              fontWeight: 600,
              color: mode === 'light' ? '#1A1A1A' : '#FFFFFF',
            },
            // Garante que os ícones sejam visíveis no header
            '& .MuiIconButton-root': {
              color: mode === 'light' ? '#1A1A1A' : '#FFFFFF',
              '&:hover': {
                backgroundColor:
                  mode === 'light' ? 'rgba(5, 150, 105, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              },
            },
            '& .MuiSvgIcon-root': {
              color: mode === 'light' ? '#1A1A1A' : '#FFFFFF',
            },
            '& .MuiButton-root': {
              color: mode === 'light' ? '#1A1A1A' : '#FFFFFF',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FAFAFA' : '#1A1A1A',
            borderRight: `1px solid ${
              mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
            }`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            boxShadow:
              mode === 'light'
                ? '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.1)'
                : '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0px 4px 12px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0px 4px 12px rgba(0, 0, 0, 0.4), 0px 2px 4px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            '&:hover': {
              backgroundColor:
                mode === 'light' ? 'rgba(5, 150, 105, 0.04)' : 'rgba(16, 185, 129, 0.08)',
            },
          },
        },
      },
      // Personalização do Avatar
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#059669' : '#10B981',
            color: '#FFFFFF',
            fontWeight: 500,
          },
          colorDefault: {
            backgroundColor: mode === 'light' ? '#64748B' : '#94A3B8',
            color: '#FFFFFF',
          },
        },
      },
      // Personalização do Badge
      MuiBadge: {
        styleOverrides: {
          badge: {
            backgroundColor: mode === 'light' ? '#EF4444' : '#DC2626',
            color: '#FFFFFF',
            fontWeight: 600,
          },
        },
      },
      // Personalização de ícones
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            '&.MuiSvgIcon-colorPrimary': {
              color: mode === 'light' ? '#059669' : '#10B981',
            },
            '&.MuiSvgIcon-colorSecondary': {
              color: mode === 'light' ? '#64748B' : '#94A3B8',
            },
            '&.MuiSvgIcon-colorAction': {
              color: mode === 'light' ? '#666666' : '#A1A1AA',
            },
          },
        },
      },
      // Personalização de Tabs
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              color: mode === 'light' ? '#059669' : '#10B981',
            },
          },
        },
      },
      // Personalização para menus
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
            boxShadow:
              mode === 'light'
                ? '0px 4px 12px rgba(0, 0, 0, 0.1)'
                : '0px 4px 12px rgba(0, 0, 0, 0.3)',
            border: `1px solid ${
              mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
            }`,
          },
        },
      },
      // Personalização para Chip
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'light' ? 'rgba(5, 150, 105, 0.08)' : 'rgba(16, 185, 129, 0.12)',
            borderRadius: '12px',
            '&.MuiChip-colorPrimary': {
              backgroundColor: mode === 'light' ? '#059669' : '#10B981',
              color: '#FFFFFF',
            },
            '&.MuiChip-colorSecondary': {
              backgroundColor: mode === 'light' ? '#64748B' : '#94A3B8',
              color: '#FFFFFF',
            },
          },
          label: {
            fontWeight: 500,
          },
        },
      },
    },
  } as ThemeOptions;
};

// Cria o tema light
export const lightTheme: Theme = createTheme(getDesignTokens('light'));

// Cria o tema dark
export const darkTheme: Theme = createTheme(getDesignTokens('dark'));

// Exporta função para obter o tema com base no modo
export const getTheme = (mode: PaletteMode): Theme => (mode === 'light' ? lightTheme : darkTheme);

// Exporta o tema padrão
export default lightTheme;
