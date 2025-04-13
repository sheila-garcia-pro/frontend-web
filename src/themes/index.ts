import { createTheme, Theme, ThemeOptions, PaletteMode } from '@mui/material';

// Tema personalizado compartilhado entre light e dark
const getDesignTokens = (mode: PaletteMode) => {
  const palette = {
    mode,
    ...(mode === 'light'
      ? {
          // Paleta para o tema light
          primary: {
            main: '#1976D2',
            light: '#42a5f5',
            dark: '#115293',
            contrastText: '#fff',
          },
          secondary: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
            contrastText: '#fff',
          },
          background: {
            default: '#F5F5F5',
            paper: '#fff',
          },
          text: {
            primary: '#333333',
            secondary: '#666666',
          },
          success: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
          },
          error: {
            main: '#F44336',
            light: '#E57373',
            dark: '#D32F2F',
          },
          warning: {
            main: '#FFC107',
            light: '#FFD54F',
            dark: '#FFA000',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Paleta para o tema dark
          primary: {
            main: '#1976D2',
            light: '#42a5f5',
            dark: '#115293',
            contrastText: '#fff',
          },
          secondary: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
            contrastText: '#fff',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#fff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
          success: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
          },
          error: {
            main: '#F44336',
            light: '#E57373',
            dark: '#D32F2F',
          },
          warning: {
            main: '#FFC107',
            light: '#FFD54F',
            dark: '#FFA000',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
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
      borderRadius: 4,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
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
              '&:hover fieldset': {
                borderColor: mode === 'light' ? '#1976D2' : '#42a5f5',
              },
            },
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#1976D2' : '#272727',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
            borderRight: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === 'light' ? '0px 2px 4px rgba(0,0,0,0.1)' : '0px 2px 4px rgba(0,0,0,0.5)',
            '&:hover': {
              boxShadow:
                mode === 'light' ? '0px 4px 8px rgba(0,0,0,0.15)' : '0px 4px 8px rgba(0,0,0,0.7)',
            },
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
