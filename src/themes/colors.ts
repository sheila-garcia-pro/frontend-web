/**
 * Paleta de cores da nova identidade visual
 * Baseada nos PANTONES fornecidos no documento de identidade visual
 */

// ==================== CORES PRIMÁRIAS (PANTONES) ====================

export const BRAND_COLORS = {
  // PANTONE 7494C - Verde principal da marca
  PRIMARY_GREEN: '#4F6D48',
  PRIMARY_GREEN_RGB: 'rgb(79, 109, 72)',
  PRIMARY_GREEN_VALUES: { r: 79, g: 109, b: 72 },

  // PANTONE 493C - Rosa salmão secundário
  SECONDARY_PINK: '#DD8A99',
  SECONDARY_PINK_RGB: 'rgb(221, 138, 153)',
  SECONDARY_PINK_VALUES: { r: 221, g: 138, b: 153 },

  // Pantone P7-3U - Amarelo suave para destaques
  ACCENT_YELLOW: '#FFE4A9',
  ACCENT_YELLOW_RGB: 'rgb(255, 228, 169)',
  ACCENT_YELLOW_VALUES: { r: 255, g: 228, b: 169 },

  // Pantone 705C - Bege neutro para fundos
  NEUTRAL_BEIGE: '#FFF6DC',
  NEUTRAL_BEIGE_RGB: 'rgb(255, 246, 220)',
  NEUTRAL_BEIGE_VALUES: { r: 255, g: 246, b: 220 },
} as const;

// ==================== VARIAÇÕES GERADAS ====================

/**
 * Variações do verde primário para diferentes contextos
 */
export const GREEN_PALETTE = {
  50: '#F8FAF7', // Muito claro
  100: '#EDF2EB', // Claro
  200: '#D6E2D2', // Suave
  300: '#B8CCB2', // Médio claro
  400: '#94B18A', // Médio
  500: '#4F6D48', // Principal (PANTONE 7494C)
  600: '#455F3F', // Escuro
  700: '#3A5136', // Muito escuro
  800: '#2F422C', // Extra escuro
  900: '#253522', // Máximo escuro
} as const;

/**
 * Variações do rosa secundário para diferentes contextos
 */
export const PINK_PALETTE = {
  50: '#FDF9FA', // Muito claro
  100: '#FAEFF2', // Claro
  200: '#F2D9E0', // Suave
  300: '#E8BECA', // Médio claro
  400: '#DDA4B1', // Médio
  500: '#DD8A99', // Principal (PANTONE 493C)
  600: '#C9798A', // Escuro
  700: '#B5687A', // Muito escuro
  800: '#A1576B', // Extra escuro
  900: '#8D465C', // Máximo escuro
} as const;

/**
 * Variações do amarelo para destaques e warnings
 */
export const YELLOW_PALETTE = {
  50: '#FFFEF9', // Muito claro
  100: '#FFFCF0', // Claro
  200: '#FFF7D9', // Suave
  300: '#FFEFC2', // Médio claro
  400: '#FFE7B5', // Médio
  500: '#FFE4A9', // Principal (Pantone P7-3U)
  600: '#EBCE96', // Escuro
  700: '#D7B884', // Muito escuro
  800: '#C3A271', // Extra escuro
  900: '#AF8C5F', // Máximo escuro
} as const;

/**
 * Variações do bege neutro para fundos e superfícies
 */
export const BEIGE_PALETTE = {
  50: '#FFFFFE', // Quase branco
  100: '#FFFCF7', // Muito claro
  200: '#FFF9F0', // Claro
  300: '#FFF6DC', // Principal (Pantone 705C)
  400: '#FFF3C8', // Médio
  500: '#F0E8B4', // Escuro
  600: '#E1D3A0', // Muito escuro
  700: '#D2BE8C', // Extra escuro
  800: '#C3A978', // Dourado
  900: '#B49464', // Máximo escuro
} as const;

// ==================== CORES PARA TEMAS ====================

/**
 * Cores otimizadas para o tema light
 */
export const LIGHT_THEME_COLORS = {
  primary: {
    main: GREEN_PALETTE[500], // Verde principal
    light: GREEN_PALETTE[300], // Verde claro
    dark: GREEN_PALETTE[700], // Verde escuro
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: PINK_PALETTE[400], // Rosa médio (mais suave para light)
    light: PINK_PALETTE[200], // Rosa claro
    dark: PINK_PALETTE[600], // Rosa escuro
    contrastText: '#2D3748', // Texto escuro para contraste
  },
  background: {
    default: '#FFFFFF', // Branco puro
    paper: BEIGE_PALETTE[100], // Bege muito claro para cards
    accent: BEIGE_PALETTE[300], // Bege principal para seções especiais
  },
  surface: {
    primary: GREEN_PALETTE[50], // Superfície verde muito sutil
    secondary: PINK_PALETTE[50], // Superfície rosa muito sutil
    accent: YELLOW_PALETTE[100], // Superfície amarela para destaque
  },
} as const;

/**
 * Cores otimizadas para o tema dark
 */
export const DARK_THEME_COLORS = {
  primary: {
    main: GREEN_PALETTE[400], // Verde mais claro para contraste
    light: GREEN_PALETTE[300], // Verde claro
    dark: GREEN_PALETTE[600], // Verde escuro
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: PINK_PALETTE[300], // Rosa mais claro para dark mode
    light: PINK_PALETTE[200], // Rosa claro
    dark: PINK_PALETTE[500], // Rosa médio
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#121212', // Cinza escuro padrão (mais suave)
    paper: '#1E1E1E', // Cinza escuro para cards
    accent: GREEN_PALETTE[900], // Verde máximo escuro para seções especiais
  },
  surface: {
    primary: GREEN_PALETTE[800], // Superfície verde escura
    secondary: PINK_PALETTE[900], // Superfície rosa escura
    accent: YELLOW_PALETTE[800], // Superfície amarela escura
  },
} as const;

// ==================== CORES FUNCIONAIS ====================

/**
 * Cores para estados e feedback (mantendo harmonia com a identidade)
 */
export const FUNCTIONAL_COLORS = {
  success: {
    light: GREEN_PALETTE[400],
    main: GREEN_PALETTE[600],
    dark: GREEN_PALETTE[800],
  },
  warning: {
    light: YELLOW_PALETTE[300],
    main: YELLOW_PALETTE[500],
    dark: YELLOW_PALETTE[700],
  },
  error: {
    light: '#FFCDD2',
    main: '#F44336',
    dark: '#B71C1C',
  },
  info: {
    light: PINK_PALETTE[200],
    main: PINK_PALETTE[400],
    dark: PINK_PALETTE[600],
  },
} as const;

// ==================== UTILITÁRIOS ====================

/**
 * Função para gerar variações de transparência de uma cor
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Remove o # se presente
  const hex = color.replace('#', '');

  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Função para gerar gradientes baseados na identidade visual
 */
export const GRADIENTS = {
  primaryToSecondary: `linear-gradient(135deg, ${GREEN_PALETTE[500]} 0%, ${PINK_PALETTE[400]} 100%)`,
  backgroundSoft: `linear-gradient(180deg, ${BEIGE_PALETTE[100]} 0%, ${BEIGE_PALETTE[200]} 100%)`,
  accentWarm: `linear-gradient(45deg, ${YELLOW_PALETTE[300]} 0%, ${BEIGE_PALETTE[300]} 100%)`,
  darkPrimary: `linear-gradient(135deg, ${GREEN_PALETTE[700]} 0%, ${GREEN_PALETTE[900]} 100%)`,
} as const;

/**
 * Cores para uso em textos com boa acessibilidade
 */
export const TEXT_COLORS = {
  light: {
    primary: GREEN_PALETTE[800], // Verde escuro para texto principal
    secondary: GREEN_PALETTE[600], // Verde médio para texto secundário
    muted: GREEN_PALETTE[400], // Verde suave para texto auxiliar
    accent: PINK_PALETTE[600], // Rosa para destaques
  },
  dark: {
    primary: '#FFFFFF', // Branco para texto principal
    secondary: BEIGE_PALETTE[200], // Bege claro para texto secundário
    muted: BEIGE_PALETTE[400], // Bege médio para texto auxiliar
    accent: PINK_PALETTE[300], // Rosa claro para destaques
  },
} as const;
