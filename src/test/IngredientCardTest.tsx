import React, { ElementType } from 'react';
import { Grid } from '@mui/material';
import { IngredientCard, IngredientDetailsModal } from '../components/ui';
import { Ingredient } from '../types/ingredients';

const IngredientCardTest: React.FC = () => {
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = React.useState<string | null>(null);

  // Exemplo de ingrediente com a nova estrutura
  const ingredient: Ingredient = {
    _id: '1',
    name: 'Laranja',
    category: 'Frutas',
    image: 'https://d2ctodxo1ppx6l.cloudfront.net/string/Ingredientes.jpg',
    isEdit: true,
  };

  const handleViewDetails = (id: string) => {
    setSelectedIngredientId(id);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedIngredientId(null);
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
          <IngredientCard ingredient={ingredient} onViewDetails={handleViewDetails} />
        </Grid>
      </Grid>

      <IngredientDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        ingredientId={selectedIngredientId}
      />
    </>
  );
};

export default IngredientCardTest;
