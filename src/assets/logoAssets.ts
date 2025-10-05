/**
 * 🎨 MAPEAMENTO DOS NOVOS ASSETS DA IDENTIDADE VISUAL
 *
 * Baseado nas MARCAS D'ÁGUA fornecidas na nova identidade visual
 */

// ==================== LOGOS PRINCIPAIS ====================

// Logo apenas símbolo (SG) - Versões coloridas
import logoSymbolGreen from './logos/logo_green.png'; // Verde
import logoSymbolPink from './logos/logo-symbol-pink.png'; // Rosa
import logoSymbolBeige from './logos/logo-symbol-beige.png'; // Bege
import logoSymbolWhite from './logos/logo_white.png'; // Branco
import logoSymbolBlack from './logos/logo-symbol-black.png'; // Preto/Cinza

// Logo completo com texto - Versões coloridas
import logoFullGreen from './logos/logo-full-green.png'; // Verde
import logoFullPink from './logos/logo-full-pink.png'; // Rosa
import logoFullBeige from './logos/logo-full-beige.png'; // Bege
import logoFullBlack from './logos/logo-full-black.png'; // Preto
import logoFullWhite from './logos/logo-full-white.png'; // Branco

// ==================== CONFIGURAÇÕES POR TEMA ====================

export const LOGO_ASSETS = {
  // Para temas claros (light mode)
  light: {
    symbol: logoSymbolGreen, // Símbolo verde para light mode (logo_green.png)
    full: logoFullGreen, // Logo completo verde para light mode
    original: logoFullGreen, // Usando logo completo verde como original para light mode
    fallback: logoSymbolGreen, // Fallback
  },

  // Para temas escuros (dark mode)
  dark: {
    symbol: logoSymbolWhite, // Símbolo branco para dark mode (logo_white.png)
    full: logoFullWhite, // Logo completo branco para dark mode
    original: logoFullWhite, // Usando logo completo branco como original para dark mode
    fallback: logoSymbolWhite, // Fallback
  },

  // Variações especiais
  variants: {
    green: {
      symbol: logoSymbolGreen,
      full: logoFullGreen,
    },
    pink: {
      symbol: logoSymbolPink,
      full: logoFullPink,
    },
    beige: {
      symbol: logoSymbolBeige,
      full: logoFullBeige,
    },
    white: {
      symbol: logoSymbolWhite,
      full: logoFullWhite,
    },
    black: {
      symbol: logoSymbolBlack,
      full: logoFullBlack,
    },
  },
};

// ==================== FAVICON E META TAGS ====================

export const FAVICON_ASSETS = {
  // Ícones para diferentes tamanhos
  small: logoSymbolWhite, // 16x16, 32x32
  medium: logoSymbolWhite, // 48x48, 96x96
  large: logoSymbolWhite, // 192x192, 512x512
  apple: logoSymbolWhite, // Apple touch icon
};

// ==================== UTILITÁRIOS ====================

/**
 * Obtém o logo apropriado baseado no tema e tipo
 */
export const getLogo = (
  theme: 'light' | 'dark',
  type: 'symbol' | 'full' | 'original' = 'symbol',
  variant?: keyof typeof LOGO_ASSETS.variants,
) => {
  if (variant && LOGO_ASSETS.variants[variant]) {
    return LOGO_ASSETS.variants[variant][type as 'symbol' | 'full'];
  }

  return LOGO_ASSETS[theme][type as keyof typeof LOGO_ASSETS.light];
};

/**
 * Obtém o favicon apropriado baseado no tamanho
 */
export const getFavicon = (size: keyof typeof FAVICON_ASSETS = 'medium') => {
  return FAVICON_ASSETS[size];
};

export default LOGO_ASSETS;
