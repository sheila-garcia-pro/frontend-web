/**
 * Exemplo Atualizado: Sistema de Conversão com "Gramas" Completo
 *
 * Este arquivo demonstra como o sistema agora envia "Gramas" completo
 * ao invés de apenas "g" para a API.
 */

import { convertRecipeIngredientsForAPI } from '../utils/recipeIngredientConversion';

console.log('=== Sistema de Conversão Atualizado ===\n');

// Exemplo: Ingrediente do seu caso específico
const ingredienteExemplo = {
  ingredient: {
    _id: '68f6243c8c1a600d4a5d8f27',
    name: 'Bicarbonato de Sódio',
  },
  quantity: 111,
  unitMeasure: '1/3 xícara',
};

console.log('📥 ENTRADA (do componente):');
console.log(JSON.stringify(ingredienteExemplo, null, 2));

// Converter para formato API
const ingredienteConvertido = convertRecipeIngredientsForAPI([ingredienteExemplo]);

console.log('\n📤 SAÍDA (para API):');
console.log(JSON.stringify(ingredienteConvertido[0], null, 2));

console.log('\n🔄 COMPARAÇÃO:');
console.log(
  `Quantidade: ${ingredienteExemplo.quantity} → ${ingredienteConvertido[0].quantityIngredientRecipe}`,
);
console.log(
  `Unidade: "${ingredienteExemplo.unitMeasure}" → "${ingredienteConvertido[0].unitAmountUseIngredient}"`,
);

// Cálculo detalhado
const calculo = 111 * (1 / 3) * 160; // 111 * 1/3 xícara * 160g por xícara
console.log(`\n🧮 CÁLCULO:`);
console.log(`111 × (1/3) × 160g = ${calculo}g = ${calculo} Gramas`);

console.log('\n✅ RESULTADO FINAL:');
console.log('A API agora recebe "Gramas" completo ao invés de apenas "g"');

export {};
