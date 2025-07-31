// test/menuCalculationsTest.ts - Teste manual dos cálculos financeiros

import {
  calculateMenuFinancials,
  validateCalculations,
  formatCurrency,
  formatPercentage,
} from '../src/utils/menuCalculations';

// Cenário 1: Teste com dados do cardápio "Suco" da imagem
console.log('=== TESTE 1: Cenário do Cardápio "Suco" ===');
const teste1 = calculateMenuFinancials({
  totalItems: 2,
  itemsCost: 5.27,
  directCostsPercentage: 0,
  indirectCostsPercentage: 0,
  sellPrice: 0,
});

console.log('Resultado calculado:');
console.log('- Custo Total:', formatCurrency(teste1.totalCost));
console.log('- Custo Unitário:', formatCurrency(teste1.unitCost));
console.log('- Custo dos Itens:', formatCurrency(teste1.itemsCost));
console.log('- Custos Diretos:', formatCurrency(teste1.directCosts));
console.log('- Custos Indiretos:', formatCurrency(teste1.indirectCosts));
console.log('- Preço de Venda:', formatCurrency(teste1.sellPrice));
console.log('- Margem de Lucro:', formatPercentage(teste1.profitMargin));
console.log('- Markup:', formatPercentage(teste1.markup));

const erros1 = validateCalculations(teste1);
if (erros1.length > 0) {
  console.log('❌ Erros encontrados:');
  erros1.forEach((erro) => console.log('  -', erro));
} else {
  console.log('✅ Cálculos corretos!');
}

console.log('\n=== TESTE 2: Cenário com Preço de Venda ===');
const teste2 = calculateMenuFinancials({
  totalItems: 2,
  itemsCost: 5.27,
  directCostsPercentage: 10, // 10% de custos diretos
  indirectCostsPercentage: 5, // 5% de custos indiretos
  sellPrice: 9.65, // Preço da imagem
});

console.log('Resultado calculado:');
console.log('- Custo Total:', formatCurrency(teste2.totalCost));
console.log('- Custo Unitário:', formatCurrency(teste2.unitCost));
console.log('- Custo dos Itens:', formatCurrency(teste2.itemsCost));
console.log('- Custos Diretos:', formatCurrency(teste2.directCosts));
console.log('- Custos Indiretos:', formatCurrency(teste2.indirectCosts));
console.log('- Preço de Venda:', formatCurrency(teste2.sellPrice));
console.log('- Margem de Lucro:', formatPercentage(teste2.profitMargin));
console.log('- Markup:', formatPercentage(teste2.markup));

const erros2 = validateCalculations(teste2);
if (erros2.length > 0) {
  console.log('❌ Erros encontrados:');
  erros2.forEach((erro) => console.log('  -', erro));
} else {
  console.log('✅ Cálculos corretos!');
}

console.log('\n=== TESTE 3: Validação Manual ===');
console.log('Teste 2 - Verificação manual:');
const itemsCost = 5.27;
const directCosts = (itemsCost * 10) / 100; // 0.527
const indirectCosts = (itemsCost * 5) / 100; // 0.2635
const totalCost = itemsCost + directCosts + indirectCosts; // 6.0605
const unitCost = totalCost / 2; // 3.03025
const sellPrice = 9.65;
const profitMargin = ((sellPrice - totalCost) / sellPrice) * 100; // 37.23%
const markup = ((sellPrice - totalCost) / totalCost) * 100; // 59.24%

console.log('Cálculos manuais:');
console.log('- Custo dos Itens:', formatCurrency(itemsCost));
console.log('- Custos Diretos (10%):', formatCurrency(directCosts));
console.log('- Custos Indiretos (5%):', formatCurrency(indirectCosts));
console.log('- Custo Total:', formatCurrency(totalCost));
console.log('- Custo Unitário:', formatCurrency(unitCost));
console.log('- Margem de Lucro:', formatPercentage(profitMargin));
console.log('- Markup:', formatPercentage(markup));

// Comparação
console.log('\nComparação (calculado vs manual):');
console.log('- Custo Total:', formatCurrency(teste2.totalCost), 'vs', formatCurrency(totalCost));
console.log(
  '- Margem:',
  formatPercentage(teste2.profitMargin),
  'vs',
  formatPercentage(profitMargin),
);
console.log('- Markup:', formatPercentage(teste2.markup), 'vs', formatPercentage(markup));
