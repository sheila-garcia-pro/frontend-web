/**
 * 🎨 MAPEAMENTO DOS NOVOS ASSETS DA IDENTIDADE VISUAL
 * 
 * Baseado nas MARCAS D'ÁGUA fornecidas na nova identidade visual
 */

// ==================== LOGOS PRINCIPAIS ====================

// Logo apenas símbolo (SG) - Versões coloridas
import logoSymbolGreen from './logos/logo-symbol-green.png';      // Verde
import logoSymbolPink from './logos/logo-symbol-pink.png';       // Rosa
import logoSymbolBeige from './logos/logo-symbol-beige.png';      // Bege
import logoSymbolWhite from './logos/logo-symbol-white.png';      // Branco
import logoSymbolBlack from './logos/logo-symbol-black.png';      // Preto/Cinza

// Logo completo com texto - Versões coloridas  
import logoFullGreen from './logos/logo-full-green.png';        // Verde
import logoFullPink from './logos/logo-full-pink.png';         // Rosa
import logoFullBeige from './logos/logo-full-beige.png';        // Bege
import logoFullBlack from './logos/logo-full-black.png';        // Preto
import logoFullWhite from './logos/logo-full-white.png';        // Branco

// ==================== CONFIGURAÇÕES POR TEMA ====================

export const LOGO_ASSETS = {
  // Para temas claros (light mode)
  light: {
    symbol: logoSymbolGreen,        // Símbolo verde para light mode
    full: logoFullGreen,           // Logo completo verde para light mode
    fallback: logoSymbolGreen,     // Fallback
  },
  
  // Para temas escuros (dark mode)
  dark: {
    symbol: logoSymbolWhite,       // Símbolo branco para dark mode
    full: logoFullWhite,          // Logo completo branco para dark mode  
    fallback: logoSymbolWhite,    // Fallback
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
    }
  }
};

// ==================== FAVICON E META TAGS ====================

export const FAVICON_ASSETS = {
  // Ícones para diferentes tamanhos
  small: logoSymbolGreen,         // 16x16, 32x32
  medium: logoSymbolGreen,        // 48x48, 96x96  
  large: logoSymbolGreen,         // 192x192, 512x512
  apple: logoSymbolGreen,         // Apple touch icon
};

// ==================== UTILITÁRIOS ====================

/**
 * Obtém o logo apropriado baseado no tema e tipo
 */
export const getLogo = (
  theme: 'light' | 'dark',
  type: 'symbol' | 'full' = 'symbol',
  variant?: keyof typeof LOGO_ASSETS.variants
) => {
  if (variant && LOGO_ASSETS.variants[variant]) {
    return LOGO_ASSETS.variants[variant][type];
  }
  
  return LOGO_ASSETS[theme][type];
};

/**
 * Obtém o favicon apropriado baseado no tamanho
 */
export const getFavicon = (size: keyof typeof FAVICON_ASSETS = 'medium') => {
  return FAVICON_ASSETS[size];
};

export default LOGO_ASSETS;
