// src/mocks/receitasMock.js
import receitasImg from '../assets/Receitas-Capa-1.png';

const dishTypes = ['Entrada', 'Recheio', 'Sobremesa', 'Prato Principal', 'Bebida'];

export const receitasMock = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  image: receitasImg,
  name: `Receita ${index + 1}`,
  dishType: dishTypes[Math.floor(Math.random() * dishTypes.length)],
  servings: Math.floor(Math.random() * 10 + 1), // de 1 a 10 porções
})); 