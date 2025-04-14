import { ingredientesMock } from '../mocks/ingredientesMock';
import { receitasMock } from '../mocks/receitasMock';

// Interface para o payload de retorno da Home
export interface HomeDataPayload {
  ingredientes: typeof ingredientesMock;
  receitas: typeof receitasMock;
}

// Probabilidade de erro (5%)
const ERROR_PROBABILITY = 0.05;

// Tempo de carregamento simulado (entre 1 e 2.5 segundos)
const simulateLoadTime = () => Math.random() * 1500 + 1000;

/**
 * Simula o carregamento de dados da página Home com delay e possibilidade de erro
 * Esta função será substituída pela chamada real à API no futuro
 */
export const fetchHomeData = (): Promise<HomeDataPayload> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simula erro aleatório
      if (Math.random() < ERROR_PROBABILITY) {
        reject(new Error('Falha ao carregar os dados da Home.'));
        return;
      }

      // Retorna os dados mockados
      resolve({
        ingredientes: ingredientesMock,
        receitas: receitasMock,
      });
    }, simulateLoadTime());
  });
};

/**
 * Carrega os ingredientes com delay e possibilidade de erro
 * Esta função será substituída pela chamada real à API no futuro
 */
export const fetchIngredientes = (): Promise<typeof ingredientesMock> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simula erro aleatório
      if (Math.random() < ERROR_PROBABILITY) {
        reject(new Error('Falha ao carregar os dados de ingredientes.'));
        return;
      }

      // Retorna os dados mockados
      resolve(ingredientesMock);
    }, simulateLoadTime());
  });
};

/**
 * Carrega as receitas com delay e possibilidade de erro
 * Esta função será substituída pela chamada real à API no futuro
 */
export const fetchReceitas = (): Promise<typeof receitasMock> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simula erro aleatório
      if (Math.random() < ERROR_PROBABILITY) {
        reject(new Error('Falha ao carregar os dados de receitas.'));
        return;
      }

      // Retorna os dados mockados
      resolve(receitasMock);
    }, simulateLoadTime());
  });
}; 