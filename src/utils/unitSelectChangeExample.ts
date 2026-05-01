/**
 * Exemplo: Alteração do Select de Unidade de Peso
 *
 * Demonstra a mudança de units-amount-use para unit-measure
 * no select de unidade de peso das receitas.
 */

console.log('=== Select de Unidade de Peso: units-amount-use → unit-measure ===\n');

// Exemplo: Como eram as opções ANTES (units-amount-use)
const opcoesAntes = [
  {
    _id: '60a1b2c3d4e5f6789012345a',
    name: 'Quilogramas para Massa',
    quantity: '1',
    unitMeasure: 'kg',
  },
  {
    _id: '60a1b2c3d4e5f6789012345b',
    name: 'Gramas para Farinha',
    quantity: '500',
    unitMeasure: 'g',
  },
  {
    _id: '60a1b2c3d4e5f6789012345c',
    name: 'Xícaras para Líquido',
    quantity: '2',
    unitMeasure: 'xícara',
  },
];

console.log('📋 ANTES (units-amount-use):');
console.log('Opções complexas com quantidade e contexto específico:');
opcoesAntes.forEach((opcao, index) => {
  console.log(`${index + 1}. ${opcao.name} (${opcao.quantity} ${opcao.unitMeasure})`);
});

// Exemplo: Como são as opções DEPOIS (unit-measure)
const opcoesDepois = [
  { _id: 'unit001', name: 'Quilogramas', acronym: 'kg' },
  { _id: 'unit002', name: 'Gramas', acronym: 'g' },
  { _id: 'unit003', name: 'Litros', acronym: 'l' },
  { _id: 'unit004', name: 'Mililitros', acronym: 'ml' },
  { _id: 'unit005', name: 'Unidades', acronym: 'un' },
];

console.log('\n📋 DEPOIS (unit-measure):');
console.log('Opções simples e básicas:');
opcoesDepois.forEach((opcao, index) => {
  console.log(`${index + 1}. ${opcao.name} ${opcao.acronym ? `(${opcao.acronym})` : ''}`);
});

console.log('\n🎯 DIFERENÇAS:');
console.log('| Aspecto | units-amount-use | unit-measure |');
console.log('|---------|------------------|--------------|');
console.log('| Propósito | Receitas específicas | Unidades básicas |');
console.log('| Complexidade | Alta (contexto específico) | Baixa (genérica) |');
console.log('| Quantidade | Inclui quantidade padrão | Só a unidade |');
console.log('| Uso | Ingredientes de receitas | Peso da receita |');

console.log('\n✅ BENEFÍCIOS DA MUDANÇA:');
console.log('1. 🎯 Simplicidade: Opções mais diretas para peso da receita');
console.log('2. 🔄 Separação: units-amount-use fica só para ingredientes');
console.log('3. 📏 Clareza: Peso da receita usa unidades básicas (kg, g, l, ml)');
console.log('4. 🏗️ Arquitetura: Cada tipo de unidade tem seu propósito específico');

console.log('\n📱 NO COMPONENTE:');
console.log('- Select "Unidade de Peso" agora usa unitMeasures[]');
console.log('- Select ingredientes continua usando userUnitsAmountUse[]');
console.log('- Cada um tem seu loading state separado');

console.log('\n🔄 PAYLOAD RESULTANTE:');
const payloadExemplo = {
  name: 'Bolo de Chocolate',
  typeWeightRecipe: 'Quilogramas', // ← Agora vem de unit-measure
  weightRecipe: '1.5',
  ingredients: [
    {
      idIngredient: '123',
      quantityIngredientRecipe: '300',
      unitAmountUseIngredient: 'Gramas', // ← Este continua vindo de units-amount-use
    },
  ],
};

console.log(JSON.stringify(payloadExemplo, null, 2));

export {};
