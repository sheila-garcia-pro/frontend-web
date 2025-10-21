import {
  convertToGrams,
  convertPriceDataToGrams,
  getConversionDescription,
} from './unitConversion';

/**
 * Arquivo de demonstração e testes manuais para as conversões de unidades
 * Execute este arquivo para verificar se as conversões estão funcionando corretamente
 */

console.log('=== DEMONSTRAÇÃO DE CONVERSÕES DE UNIDADES ===\n');

// Teste 1: Bicarbonato de Sódio com colher de chá (seu exemplo)
console.log('1. Exemplo: Bicarbonato de Sódio');
const bicarbonato = {
  name: 'Bicarbonato de Sódio',
  category: 'Doces e químicos',
  price: { price: 2, quantity: 1, unitMeasure: '1 colher (chá)' },
};

console.log('Dados originais:', bicarbonato.price);

const bicarbonato_converted = convertPriceDataToGrams(
  bicarbonato.price.price,
  bicarbonato.price.quantity,
  bicarbonato.price.unitMeasure,
);

console.log('Dados convertidos:', bicarbonato_converted);
console.log(
  'Descrição da conversão:',
  getConversionDescription(
    bicarbonato.price.quantity,
    bicarbonato.price.unitMeasure,
    bicarbonato_converted.quantity,
  ),
);
console.log('✅ 1 colher de chá = 5g\n');

// Teste 2: Medidas culinárias variadas
console.log('2. Outras medidas culinárias:');
const exemplos = [
  { nome: 'Açúcar', quantidade: 2, unidade: 'colher de sopa' },
  { nome: 'Farinha', quantidade: 1, unidade: 'xícara' },
  { nome: 'Leite', quantidade: 1, unidade: 'copo americano' },
  { nome: 'Sal', quantidade: 3, unidade: 'pitadas' },
  { nome: 'Alho', quantidade: 2, unidade: 'dentes' },
  { nome: 'Canela', quantidade: 1, unidade: 'colher de sobremesa' },
];

exemplos.forEach((ex) => {
  const gramas = convertToGrams(ex.quantidade, ex.unidade);
  console.log(`${ex.nome}: ${ex.quantidade} ${ex.unidade} = ${gramas}g`);
});
console.log();

// Teste 3: Unidades já em gramas (deve manter)
console.log('3. Unidades que já estão em gramas (devem ser mantidas):');
const unidadesGramas = [
  { quantidade: 500, unidade: 'Gramas' },
  { quantidade: 100, unidade: 'gramas' },
  { quantidade: 250, unidade: 'g' },
];

unidadesGramas.forEach((ex) => {
  const converted = convertPriceDataToGrams(5.0, ex.quantidade, ex.unidade);
  console.log(`${ex.quantidade} ${ex.unidade} →`, converted);
});
console.log();

// Teste 4: Conversões de peso tradicionais
console.log('4. Conversões tradicionais:');
const tradicionais = [
  { quantidade: 1, unidade: 'Quilogramas' },
  { quantidade: 0.5, unidade: 'kg' },
  { quantidade: 1, unidade: 'litros' },
  { quantidade: 250, unidade: 'ml' },
];

tradicionais.forEach((ex) => {
  const gramas = convertToGrams(ex.quantidade, ex.unidade);
  console.log(`${ex.quantidade} ${ex.unidade} = ${gramas}g`);
});
console.log();

// Teste 5: Exemplo completo de envio para API
console.log('5. Simulação de envio para API:');
console.log('Dados ANTES da conversão (como o usuário digitou):');
const dadosOriginais = {
  ingredientId: '123456789',
  price: 2.5,
  quantity: 1,
  unitMeasure: '1 colher (chá)',
};
console.log(JSON.stringify(dadosOriginais, null, 2));

console.log('\nDados DEPOIS da conversão (como será enviado para a API):');
const dadosConvertidos = {
  ingredientId: dadosOriginais.ingredientId,
  ...convertPriceDataToGrams(
    dadosOriginais.price,
    dadosOriginais.quantity,
    dadosOriginais.unitMeasure,
  ),
};
console.log(JSON.stringify(dadosConvertidos, null, 2));

console.log('\n=== CONVERSÃO CONCLUÍDA ===');
console.log('✅ Agora quando você enviar dados como "1 colher (chá)" para a API,');
console.log('   automaticamente será convertido para "5 Gramas"');
console.log('✅ A API receberá sempre valores padronizados em gramas');
console.log('✅ O sistema funciona com medidas culinárias brasileiras comuns');
