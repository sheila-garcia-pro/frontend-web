/**
 * Exemplo: Mudança de typeWeightRecipe de ID para Texto
 *
 * Este arquivo demonstra como a alteração do typeWeightRecipe
 * afeta o payload enviado para a API.
 */

console.log('=== Mudança de typeWeightRecipe: ID → Texto ===\n');

// Exemplo: Dados como eram enviados ANTES da alteração
const payloadAntes = {
  name: 'Teste144',
  category: 'Pratos principais',
  descripition: '',
  image: '',
  preparationTime: '3h',
  yieldRecipe: '-1',
  typeYield: 'Pessoas',
  weightRecipe: '2',
  typeWeightRecipe: '68f539808c1a600d4a5d8d7c', // ❌ ID da unidade
  ingredients: [
    {
      idIngredient: '68f6243c8c1a600d4a5d8f27',
      quantityIngredientRecipe: '5920',
      unitAmountUseIngredient: 'Gramas',
    },
  ],
  modePreparation: [],
};

console.log('📤 ANTES (ID):');
console.log(`typeWeightRecipe: "${payloadAntes.typeWeightRecipe}"`);
console.log('↑ Valor não legível para humanos');

// Exemplo: Dados como serão enviados DEPOIS da alteração
const payloadDepois = {
  ...payloadAntes,
  typeWeightRecipe: 'Quilogramas', // ✅ Nome legível da unidade
};

console.log('\n📤 DEPOIS (Texto):');
console.log(`typeWeightRecipe: "${payloadDepois.typeWeightRecipe}"`);
console.log('↑ Valor legível e compreensível');

console.log('\n🔄 COMPARAÇÃO:');
console.log('| Campo | Antes | Depois |');
console.log('|-------|-------|--------|');
console.log(
  `| typeWeightRecipe | ${payloadAntes.typeWeightRecipe} | ${payloadDepois.typeWeightRecipe} |`,
);

console.log('\n✅ BENEFÍCIOS:');
console.log('1. API recebe dados mais legíveis');
console.log('2. Não precisa fazer lookup de ID → Nome');
console.log('3. Dados são mais autodocumentados');
console.log('4. Facilita debug e logs');

console.log('\n📋 MUDANÇA NO COMPONENTE:');
console.log('RecipeBasicInfo.tsx:');
console.log('- ANTES: value={unit._id}    // Salvava ID');
console.log('- DEPOIS: value={unit.name}  // Salva nome');

export {};
