import React, { ElementType } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import IngredientCard from '../components/ui/IngredientCard';
import { Ingredient } from '../types/ingredients';

// Este componente é apenas para teste e não precisa ser usado na aplicação
const IngredientCardTest: React.FC = () => {
  // Dados no formato antigo (legado - como usado na página Home)
  const legacyFormatIngredient = {
    id: '1',
    name: 'Formato Legado',
    image: 'https://exemplo.com/imagem.jpg',
    price: '25.50',
    recipesCount: 10
  };

  // Dados no formato novo (API - como usado na página Ingredients)
  const newFormatIngredient: Ingredient = {
    _id: '2',
    name: 'Formato Novo',
    categoryId: 'cat123',
    image: 'https://exemplo.com/imagem2.jpg'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teste do Componente IngredientCard
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Formato Legado (propriedades separadas):
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
          <IngredientCard
            id={legacyFormatIngredient.id}
            name={legacyFormatIngredient.name}
            image={legacyFormatIngredient.image}
            price={legacyFormatIngredient.price}
            recipesCount={legacyFormatIngredient.recipesCount}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Formato Novo (objeto ingredient):
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
          <IngredientCard
            ingredient={newFormatIngredient}
            recipesCount={5}
          />
        </Grid>
      </Grid>

      <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
        Este componente demonstra que o IngredientCard agora suporta ambos os formatos de dados,
        permitindo uma migração gradual para o novo formato da API.
      </Typography>
    </Box>
  );
};

export default IngredientCardTest; 