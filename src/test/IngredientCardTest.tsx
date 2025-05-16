import React, { ElementType } from 'react';
import { Grid } from '@mui/material';
import { IngredientCard } from '../components/ui';
import { Ingredient } from '../types/ingredients';

const IngredientCardTest: React.FC = () => {
  // Exemplo de ingrediente com a nova estrutura
  const ingredient: Ingredient = {
    _id: '1',
    name: 'Laranja',
    category: 'Frutas',
    image: 'https://d2ctodxo1ppx6l.cloudfront.net/string/Ingredientes.jpg',
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
        <IngredientCard ingredient={ingredient} />
      </Grid>
    </Grid>
  );
};

export default IngredientCardTest;
