import {
  convertToGrams,
  convertPriceDataToGrams,
  getConversionDescription,
} from '../unitConversion';

describe('Conversões de Unidades', () => {
  describe('convertToGrams', () => {
    // Testes para medidas culinárias
    test('deve converter colher de chá para gramas', () => {
      expect(convertToGrams(1, '1 colher (chá)')).toBe(5);
      expect(convertToGrams(2, 'colher de chá')).toBe(10);
      expect(convertToGrams(1, 'colheres (chá)')).toBe(5);
      expect(convertToGrams(3, 'c. chá')).toBe(15);
    });

    test('deve converter colher de sopa para gramas', () => {
      expect(convertToGrams(1, '1 colher (sopa)')).toBe(15);
      expect(convertToGrams(2, 'colher de sopa')).toBe(30);
      expect(convertToGrams(1, 'colheres (sopa)')).toBe(15);
      expect(convertToGrams(3, 'c. sopa')).toBe(45);
    });

    test('deve converter colher de sobremesa para gramas', () => {
      expect(convertToGrams(1, '1 colher (sobremesa)')).toBe(10);
      expect(convertToGrams(2, 'colher de sobremesa')).toBe(20);
    });

    test('deve converter xícaras para gramas', () => {
      expect(convertToGrams(1, 'xícara')).toBe(160);
      expect(convertToGrams(2, 'xícaras')).toBe(320);
      expect(convertToGrams(1, 'xícara de chá')).toBe(160);
    });

    test('deve converter copos para gramas', () => {
      expect(convertToGrams(1, 'copo')).toBe(240);
      expect(convertToGrams(2, 'copos')).toBe(480);
      expect(convertToGrams(1, 'copo americano')).toBe(240);
    });

    // Testes para unidades tradicionais
    test('deve converter quilogramas para gramas', () => {
      expect(convertToGrams(1, 'Quilogramas')).toBe(1000);
      expect(convertToGrams(0.5, 'kg')).toBe(500);
      expect(convertToGrams(2, 'quilogramas')).toBe(2000);
    });

    test('deve manter gramas como gramas', () => {
      expect(convertToGrams(100, 'Gramas')).toBe(100);
      expect(convertToGrams(500, 'gramas')).toBe(500);
      expect(convertToGrams(250, 'g')).toBe(250);
    });

    test('deve converter litros para gramas', () => {
      expect(convertToGrams(1, 'litros')).toBe(1000);
      expect(convertToGrams(0.5, 'l')).toBe(500);
    });

    test('deve converter mililitros para gramas', () => {
      expect(convertToGrams(250, 'ml')).toBe(250);
      expect(convertToGrams(500, 'mililitros')).toBe(500);
    });

    // Testes para medidas pequenas
    test('deve converter pitadas e dentes', () => {
      expect(convertToGrams(1, 'pitada')).toBe(1);
      expect(convertToGrams(2, 'pitadas')).toBe(2);
      expect(convertToGrams(1, 'dente de alho')).toBe(3);
      expect(convertToGrams(3, 'dentes')).toBe(9);
      expect(convertToGrams(1, 'punhado')).toBe(30);
    });

    test('deve retornar quantidade original para unidades não reconhecidas', () => {
      expect(convertToGrams(100, 'unidade desconhecida')).toBe(100);
      expect(convertToGrams(50, '')).toBe(50);
      expect(convertToGrams(75, undefined as any)).toBe(75);
    });
  });

  describe('convertPriceDataToGrams', () => {
    test('deve converter dados de preço com medidas culinárias', () => {
      const result = convertPriceDataToGrams(2, 1, '1 colher (chá)');
      expect(result).toEqual({
        price: 2,
        quantity: 5,
        unitMeasure: 'Gramas',
      });
    });

    test('deve converter dados de preço com quilogramas', () => {
      const result = convertPriceDataToGrams(10, 1, 'Quilogramas');
      expect(result).toEqual({
        price: 10,
        quantity: 1000,
        unitMeasure: 'Gramas',
      });
    });

    test('deve manter dados originais se já estão em gramas', () => {
      const result = convertPriceDataToGrams(5, 100, 'Gramas');
      expect(result).toEqual({
        price: 5,
        quantity: 100,
        unitMeasure: 'Gramas',
      });
    });

    test('deve converter colher de sopa para gramas', () => {
      const result = convertPriceDataToGrams(1.5, 1, 'colher de sopa');
      expect(result).toEqual({
        price: 1.5,
        quantity: 15,
        unitMeasure: 'Gramas',
      });
    });
  });

  describe('getConversionDescription', () => {
    test('deve retornar descrição de mantido quando não houve conversão', () => {
      const description = getConversionDescription(100, 'Gramas', 100);
      expect(description).toBe('Mantido: 100 Gramas');
    });

    test('deve retornar descrição de conversão quando houve mudança', () => {
      const description = getConversionDescription(1, '1 colher (chá)', 5);
      expect(description).toBe('Convertido: 1 1 colher (chá) → 5g');
    });

    test('deve retornar descrição de conversão para quilogramas', () => {
      const description = getConversionDescription(2, 'Quilogramas', 2000);
      expect(description).toBe('Convertido: 2 Quilogramas → 2000g');
    });
  });
});

// Exemplos de uso para demonstração
describe('Exemplos Práticos', () => {
  test('exemplo: Bicarbonato de Sódio com colher de chá', () => {
    const originalData = {
      price: 2,
      quantity: 1,
      unitMeasure: '1 colher (chá)',
    };

    const convertedData = convertPriceDataToGrams(
      originalData.price,
      originalData.quantity,
      originalData.unitMeasure,
    );

    expect(convertedData).toEqual({
      price: 2,
      quantity: 5, // 1 colher de chá = 5g
      unitMeasure: 'Gramas',
    });

    const description = getConversionDescription(
      originalData.quantity,
      originalData.unitMeasure,
      convertedData.quantity,
    );

    expect(description).toBe('Convertido: 1 1 colher (chá) → 5g');
  });

  test('exemplo: Farinha com xícara', () => {
    const originalData = {
      price: 8,
      quantity: 1,
      unitMeasure: 'xícara',
    };

    const convertedData = convertPriceDataToGrams(
      originalData.price,
      originalData.quantity,
      originalData.unitMeasure,
    );

    expect(convertedData).toEqual({
      price: 8,
      quantity: 160, // 1 xícara = 160g (média)
      unitMeasure: 'Gramas',
    });
  });

  test('exemplo: Açúcar já em gramas - deve manter', () => {
    const originalData = {
      price: 5,
      quantity: 500,
      unitMeasure: 'Gramas',
    };

    const convertedData = convertPriceDataToGrams(
      originalData.price,
      originalData.quantity,
      originalData.unitMeasure,
    );

    expect(convertedData).toEqual({
      price: 5,
      quantity: 500,
      unitMeasure: 'Gramas',
    });

    const description = getConversionDescription(
      originalData.quantity,
      originalData.unitMeasure,
      convertedData.quantity,
    );

    expect(description).toBe('Mantido: 500 Gramas');
  });
});
