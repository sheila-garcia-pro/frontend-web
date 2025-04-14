import ingredienteImg from '../assets/Ingredientes.jpg';

export const ingredientesMock = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  image: ingredienteImg,
  name: `Ingrediente ${index + 1}`,
  price: (Math.random() * 50 + 1).toFixed(2),
  recipesCount: Math.floor(Math.random() * 20 + 1), // de 1 a 20 receitas
})); 