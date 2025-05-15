import { ingredientesMock } from '../mocks/ingredientesMock';
import { receitasMock } from '../mocks/receitasMock';
import * as ingredientsService from './api/ingredients';
import { Ingredient } from '../types/ingredients';

// Interface para o payload de retorno da Home
export interface HomeDataPayload {
  ingredientes: any[]; // Mantém tipo genérico para compatibilidade
  receitas: typeof receitasMock;
}

// Probabilidade de erro (5%)
const ERROR_PROBABILITY = 0.05;

// Tempo de carregamento simulado (entre 1 e 2.5 segundos)
const simulateLoadTime = () => Math.random() * 1500 + 1000;

// Função auxiliar para converter ingredientes da API no formato esperado pelos componentes legados
const convertIngredientsToLegacyFormat = (ingredients: Ingredient[]): any[] => {
  return ingredients.map(ingredient => ({
    id: ingredient._id,
    name: ingredient.name,
    image: ingredient.image,
    price: "0.00", // Não temos preço na nova API, mas precisamos para compatibilidade
    recipesCount: 0 // Valor padrão para compatibilidade
  }));
};

/**
 * Carrega dados da página Home combinando dados reais da API e mockados
 */
export const fetchHomeData = async (): Promise<HomeDataPayload> => {
  try {
    // Tenta buscar dados reais da API de ingredientes
    const ingredientsResponse = await ingredientsService.getIngredients({
      page: 1,
      itemPerPage: 6 // Limitamos para exibição na home
    });
    
    // Converte os ingredientes para o formato legado
    const ingredients = convertIngredientsToLegacyFormat(ingredientsResponse.data);
    
    // Retorna uma combinação de dados reais e mockados
    return {
      ingredientes: ingredients,
      receitas: receitasMock, // Receitas ainda são mockadas
    };
  } catch (error) {
    console.warn('Erro ao buscar ingredientes da API, usando dados mockados:', error);
    
    // Em caso de erro, usa os dados mockados como fallback
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
  }
};

/**
 * Carrega os ingredientes com prioridade para dados reais da API
 */
export const fetchIngredientes = async (): Promise<any[]> => {
  try {
    // Tenta buscar dados reais da API
    const response = await ingredientsService.getIngredients({
      page: 1,
      itemPerPage: 12
    });
    
    // Converte para o formato legado
    return convertIngredientsToLegacyFormat(response.data);
  } catch (error) {
    console.warn('Erro ao buscar ingredientes da API, usando dados mockados:', error);
    
    // Em caso de erro, usa os dados mockados como fallback
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
  }
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