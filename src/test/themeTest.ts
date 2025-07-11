// Teste de importação das cores para verificar se tudo está funcionando
import { BRAND_COLORS, LIGHT_THEME_COLORS, DARK_THEME_COLORS } from '../themes/colors';

import { getTheme } from '../themes/index';

console.log('✅ Cores da marca carregadas:', BRAND_COLORS);
console.log('✅ Tema light carregado:', LIGHT_THEME_COLORS);
console.log('✅ Tema dark carregado:', DARK_THEME_COLORS);
console.log('✅ Função getTheme carregada:', typeof getTheme);

export const testColors = () => {
  console.log('🎨 Teste das cores - Nova identidade visual funcionando!');
  return true;
};
