/**
 * Exemplo de Uso do Sistema de Conversão de Unidades
 *
 * Este arquivo demonstra como usar as novas funcionalidades de conversão
 * de unidades de medida implementadas no sistema.
 */

import { convertToGrams, culinaryConversions } from '../utils/unitConversion';

import {
  isSupportedUnit,
  parseUnitString,
  formatGramsDisplay,
  validatePriceMeasureData,
  normalizePriceMeasureData,
  suggestUnits,
} from '../utils/unitValidation';

// Exemplo 1: Conversão básica
console.log('=== Conversão Básica ===');
console.log('1 colher (chá) =', convertToGrams(1, 'colher (chá)'), 'gramas');
console.log('2 colheres (sopa) =', convertToGrams(2, 'colher (sopa)'), 'gramas');
console.log('0.5 xícara =', convertToGrams(0.5, 'xícara'), 'gramas');

// Exemplo 2: Validação de unidades
console.log('\n=== Validação de Unidades ===');
console.log('colher (chá) é suportada?', isSupportedUnit('colher (chá)'));
console.log('unidade inválida é suportada?', isSupportedUnit('unidade inválida'));

// Exemplo 3: Parsing de strings de unidade
console.log('\n=== Parsing de Strings ===');
const parsed1 = parseUnitString('2 colheres (sopa)');
console.log('2 colheres (sopa):', parsed1);

const parsed2 = parseUnitString('colher (chá)');
console.log('colher (chá):', parsed2);

// Exemplo 4: Formatação para exibição
console.log('\n=== Formatação para Exibição ===');
console.log('5 gramas:', formatGramsDisplay(5));
console.log('1500 gramas:', formatGramsDisplay(1500));
console.log('0.5 gramas:', formatGramsDisplay(0.5));

// Exemplo 5: Validação de dados de preço/medida
console.log('\n=== Validação de Dados ===');
const dataValida = {
  price: 2.5,
  quantity: 1,
  unitMeasure: 'colher (chá)',
};

const validacao = validatePriceMeasureData(dataValida);
console.log('Dados válidos:', validacao);

const dataInvalida = {
  price: -1,
  quantity: 0,
  unitMeasure: '',
};

const validacaoInvalida = validatePriceMeasureData(dataInvalida);
console.log('Dados inválidos:', validacaoInvalida);

// Exemplo 6: Normalização de dados
console.log('\n=== Normalização de Dados ===');
const dadosOriginais = {
  price: 3.0,
  quantity: 2,
  unitMeasure: 'colher (sopa)',
};

const dadosNormalizados = normalizePriceMeasureData(dadosOriginais);
console.log('Dados originais:', dadosNormalizados.original);
console.log('Dados convertidos:', dadosNormalizados.converted);
console.log('Conversão aplicada?', dadosNormalizados.conversionApplied);
console.log('Detalhes da conversão:', dadosNormalizados.conversionDetails);

// Exemplo 7: Sugestões de unidades
console.log('\n=== Sugestões de Unidades ===');
console.log('Sugestões para "colher":', suggestUnits('colher'));
console.log('Sugestões para "xícara":', suggestUnits('xícara'));
console.log('Sugestões vazias:', suggestUnits(''));

// Exemplo 8: Simulação de fluxo completo
console.log('\n=== Simulação de Fluxo Completo ===');
const ingredienteExemplo = {
  name: 'Bicarbonato de Sódio',
  category: 'Doces e químicos',
  price: {
    price: 2,
    quantity: 1,
    unitMeasure: '1 colher (chá)',
  },
};

console.log('Ingrediente original:', ingredienteExemplo);

// Simular o que acontece quando enviamos para a API
const dadosParaAPI = normalizePriceMeasureData(ingredienteExemplo.price);
console.log('Dados que serão enviados para API:', dadosParaAPI.converted);

if (dadosParaAPI.conversionApplied) {
  console.log(
    `✅ Conversão aplicada: ${dadosParaAPI.original.quantity} ${dadosParaAPI.original.unitMeasure} → ${dadosParaAPI.converted.quantity}${dadosParaAPI.converted.unitMeasure}`,
  );
} else {
  console.log('❌ Nenhuma conversão foi aplicada');
}

// Exemplo 9: Verificar todas as unidades disponíveis
console.log('\n=== Unidades Disponíveis ===');
console.log('Unidades culinárias suportadas:');
Object.entries(culinaryConversions).forEach(([unidade, gramas]) => {
  console.log(`- ${unidade}: ${gramas}g`);
});

export {};
