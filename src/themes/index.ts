import { createTheme, Theme, ThemeOptions, PaletteMode } from '@mui/material';

// Tema personalizado compartilhado entre light e dark
const getDesignTokens = (mode: PaletteMode) => {
  const palette = {
    mode,
    ...(mode === 'light'
      ? {
          // Paleta para o tema light
          primary: {
            main: '#3A4534', // Verde oliva escuro (cor principal solicitada)
            light: '#8DA67A', // Verde claro suave
            dark: '#2E3627', // Verde mais escuro
            contrastText: '#F5F3E7', // Bege areia para contraste
          },
          secondary: {
            main: '#DDE19E', // Amarelo claro esverdeado (cor secundária solicitada)
            light: '#F5F3E7', // Bege areia
            dark: '#C1C8B1', // Verde pastel
            contrastText: '#3A4534', // Verde oliva escuro
          },
          background: {
            default: '#F5F3E7', // Bege areia
            paper: '#fff',
          },
          text: {
            primary: '#3A4534', // Verde oliva escuro
            secondary: '#5A654D', // Tom médio de verde oliva
          },
          success: {
            main: '#8DA67A', // Verde claro suave
            light: '#C1C8B1', // Verde pastel
            dark: '#3A4534', // Verde oliva escuro
          },
          error: {
            main: '#D32F2F',
            light: '#EF5350',
            dark: '#C62828',
          },
          warning: {
            main: '#DDE19E', // Amarelo claro esverdeado
            light: '#F5F3E7', // Bege areia
            dark: '#C1C8B1', // Verde pastel
          },
          divider: 'rgba(58, 69, 52, 0.12)', // Verde oliva com transparência
        }
      : {
          // Paleta para o tema dark - Melhorada para maior nitidez
          primary: {
            main: '#E8EDAA', // Amarelo mais vibrante para o modo dark
            light: '#F5F3E7', // Bege areia
            dark: '#C1C8B1', // Verde pastel
            contrastText: '#23291C', // Verde escuro mais profundo
          },
          secondary: {
            main: '#A1BC8B', // Verde claro suave mais vibrante
            light: '#C1C8B1', // Verde pastel
            dark: '#3A4534', // Verde oliva escuro
            contrastText: '#FFFFFF', // Branco puro para melhor contraste
          },
          background: {
            default: '#333D2C', // Tom mais escuro para maior contraste
            paper: '#23291C', // Verde escuro mais profundo para cards e componentes
          },
          text: {
            primary: '#FFFFFF', // Branco puro para melhor legibilidade
            secondary: '#E8EDAA', // Amarelo mais vibrante
          },
          success: {
            main: '#A1BC8B', // Verde mais vibrante
            light: '#C1C8B1', // Verde pastel
            dark: '#3A4534', // Verde oliva escuro
          },
          error: {
            main: '#F44336',
            light: '#E57373',
            dark: '#D32F2F',
          },
          warning: {
            main: '#E8EDAA', // Amarelo mais vibrante
            light: '#F5F3E7', // Bege areia
            dark: '#C1C8B1', // Verde pastel
          },
          divider: 'rgba(232, 237, 170, 0.2)', // Amarelo claro com maior opacidade
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
      borderRadius: 8, // Aumentado para bordas mais suaves
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
            borderRadius: '8px', // Botões com bordas mais arredondadas
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
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
              borderRadius: '8px', // Inputs com bordas mais arredondadas
              '&:hover fieldset': {
                borderColor: mode === 'light' ? '#3A4534' : '#E8EDAA',
              },
            },
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 3, // Aumentado para dar mais destaque
        },
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#3A4534' : '#23291C', // Verde escuro mais profundo no modo dark
            borderBottom: mode === 'light' 
              ? '1px solid rgba(58, 69, 52, 0.12)' 
              : '1px solid rgba(232, 237, 170, 0.2)',
            '& .MuiToolbar-root': {
              height: '68px', // Altura aumentada
            },
            '& .MuiTypography-root': {
              fontWeight: 600, // Texto mais em negrito
              letterSpacing: '0.5px', // Espaçamento maior entre letras
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#F5F3E7' : '#333D2C', // Cor de fundo mais escura
            borderRight: `1px solid ${
              mode === 'light' ? 'rgba(58, 69, 52, 0.12)' : 'rgba(232, 237, 170, 0.15)'
            }`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px', // Cards com bordas mais arredondadas
            boxShadow:
              mode === 'light'
                ? '0px 2px 8px rgba(58, 69, 52, 0.1)'
                : '0px 2px 8px rgba(0, 0, 0, 0.3)',
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0px 4px 12px rgba(58, 69, 52, 0.15)'
                  : '0px 4px 12px rgba(0, 0, 0, 0.5)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px', // Papéis com bordas mais arredondadas
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px', // Items de lista com bordas arredondadas
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(58, 69, 52, 0.05)' : 'rgba(221, 225, 158, 0.05)',
            },
          },
        },
      },
      // Personalização do Avatar
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#3A4534' : '#DDE19E',
            color: mode === 'light' ? '#F5F3E7' : '#2E3627',
            fontWeight: 500,
          },
          colorDefault: {
            backgroundColor: mode === 'light' ? '#8DA67A' : '#C1C8B1',
            color: mode === 'light' ? '#F5F3E7' : '#2E3627',
          },
        },
      },
      // Personalização do Badge
      MuiBadge: {
        styleOverrides: {
          badge: {
            backgroundColor: mode === 'light' ? '#DDE19E' : '#DDE19E',
            color: mode === 'light' ? '#3A4534' : '#2E3627',
            fontWeight: 'bold',
          },
        },
      },
      // Personalização de ícones
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            // Cores suaves para ícones
            '&.MuiSvgIcon-colorPrimary': {
              color: mode === 'light' ? '#3A4534' : '#DDE19E',
            },
            '&.MuiSvgIcon-colorSecondary': {
              color: mode === 'light' ? '#8DA67A' : '#C1C8B1',
            },
            '&.MuiSvgIcon-colorAction': {
              color: mode === 'light' ? '#5A654D' : '#F5F3E7',
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
              color: mode === 'light' ? '#3A4534' : '#DDE19E',
            },
          },
        },
      },
      // Personalização para menus
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#fff' : '#2E3627',
            boxShadow: mode === 'light' 
              ? '0px 2px 8px rgba(58, 69, 52, 0.1)' 
              : '0px 2px 8px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      // Personalização para Chip
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(58, 69, 52, 0.08)' : 'rgba(221, 225, 158, 0.1)',
            borderRadius: '16px',
            '&.MuiChip-colorPrimary': {
              backgroundColor: mode === 'light' ? '#3A4534' : '#DDE19E',
              color: mode === 'light' ? '#F5F3E7' : '#2E3627',
            },
            '&.MuiChip-colorSecondary': {
              backgroundColor: mode === 'light' ? '#DDE19E' : '#8DA67A',
              color: mode === 'light' ? '#3A4534' : '#F5F3E7',
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
