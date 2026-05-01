/**
 * Exemplo de Uso do Sistema de Conversão de Ingredientes de Receitas
 *
 * Este arquivo demonstra como o novo sistema de conversão funciona
 * especificamente para ingredientes de receitas.
 */

import {
  convertRecipeIngredientsForAPI,
  validateRecipeIngredients,
  formatIngredientsForLog,
} from '../utils/recipeIngredientConversion';

// Exemplo 1: Dados de ingredientes como recebidos do componente
console.log('=== Exemplo de Conversão de Ingredientes de Receita ===\n');

const ingredientesOriginais = [
  {
    ingredient: {
      _id: '68f6243c8c1a600d4a5d8f27',
      name: 'Bicarbonato de Sódio',
    },
    quantity: 111,
    unitMeasure: '1/3 xícara',
  },
  {
    ingredient: {
      _id: '68f6243c8c1a600d4a5d8f28',
      name: 'Farinha de Trigo',
    },
    quantity: 2,
    unitMeasure: 'colher (sopa)',
  },
  {
    ingredient: {
      _id: '68f6243c8c1a600d4a5d8f29',
      name: 'Açúcar',
    },
    quantity: 1,
    unitMeasure: 'xícara',
  },
  {
    ingredient: {
      _id: '68f6243c8c1a600d4a5d8f30',
      name: 'Sal',
    },
    quantity: 0.5,
    unitMeasure: 'colher (chá)',
  },
];

console.log('Ingredientes Originais:');
ingredientesOriginais.forEach((ing, index) => {
  console.log(`${index + 1}. ${ing.ingredient.name}: ${ing.quantity} ${ing.unitMeasure}`);
});

// Exemplo 2: Validação dos ingredientes
console.log('\n=== Validação dos Ingredientes ===');
const validacao = validateRecipeIngredients(ingredientesOriginais);
console.log('Validação:', validacao);

if (validacao.isValid) {
  console.log('✅ Todos os ingredientes são válidos!');
} else {
  console.log('❌ Erros encontrados:', validacao.errors);
}

if (validacao.warnings.length > 0) {
  console.log('⚠️ Avisos:', validacao.warnings);
}

// Exemplo 3: Conversão para formato API
console.log('\n=== Conversão para Formato API ===');
const ingredientesConvertidos = convertRecipeIngredientsForAPI(ingredientesOriginais);

console.log('Ingredientes Convertidos (formato API):');
ingredientesConvertidos.forEach((ing, index) => {
  const original = ingredientesOriginais[index];
  console.log(`${index + 1}. ${original.ingredient.name}:`);
  console.log(`   - Original: ${original.quantity} ${original.unitMeasure}`);
  console.log(`   - API: ${ing.quantityIngredientRecipe} ${ing.unitAmountUseIngredient}`);
  console.log(`   - ID: ${ing.idIngredient}`);
});

// Exemplo 4: Log formatado para debug
console.log('\n=== Log Formatado ===');
const logFormatado = formatIngredientsForLog(ingredientesOriginais, ingredientesConvertidos);
console.log(logFormatado);

// Exemplo 5: Comparação lado a lado
console.log('\n=== Comparação Detalhada ===');
console.log('| Ingrediente | Original | Convertido | Conversão Aplicada |');
console.log('|-------------|----------|------------|-------------------|');

ingredientesOriginais.forEach((original, index) => {
  const convertido = ingredientesConvertidos[index];
  const conversaoAplicada = original.unitMeasure !== convertido.unitAmountUseIngredient;

  console.log(
    `| ${original.ingredient.name.padEnd(10)} | ${original.quantity} ${original.unitMeasure.padEnd(8)} | ${convertido.quantityIngredientRecipe} ${convertido.unitAmountUseIngredient.padEnd(8)} | ${conversaoAplicada ? '✅ Sim' : '❌ Não'.padEnd(6)} |`,
  );
});

// Exemplo 6: Payload final como seria enviado para API
console.log('\n=== Payload Final para API ===');
const payloadReceita = {
  name: 'Teste144',
  category: 'Pratos principais',
  descripition: '',
  image: '',
  preparationTime: '3h',
  yieldRecipe: '-1',
  typeYield: 'Pessoas',
  weightRecipe: '2',
  typeWeightRecipe: '68f539808c1a600d4a5d8d7c',
  costDirect: [],
  costIndirect: [],
  priceCost: 0,
  priceProfit: 0,
  priceSale: 0,
  ingredients: ingredientesConvertidos,
  modePreparation: [],
};

console.log('Payload completo:');
console.log(JSON.stringify(payloadReceita, null, 2));

// Exemplo 7: Casos especiais
console.log('\n=== Casos Especiais ===');

const casosEspeciais = [
  {
    ingredient: { _id: 'test1', name: 'Ingrediente já em gramas' },
    quantity: 100,
    unitMeasure: 'g',
  },
  {
    ingredient: { _id: 'test2', name: 'Ingrediente em kg' },
    quantity: 0.5,
    unitMeasure: 'kg',
  },
  {
    ingredient: { _id: 'test3', name: 'Unidade não reconhecida' },
    quantity: 1,
    unitMeasure: 'pitada',
  },
];

console.log('Casos especiais:');
const casosConvertidos = convertRecipeIngredientsForAPI(casosEspeciais);
casosEspeciais.forEach((original, index) => {
  const convertido = casosConvertidos[index];
  console.log(
    `- ${original.ingredient.name}: ${original.quantity} ${original.unitMeasure} → ${convertido.quantityIngredientRecipe} ${convertido.unitAmountUseIngredient}`,
  );
});

export {};
