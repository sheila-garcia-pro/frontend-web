import React from 'react';
import { Card, CardContent, CardActions, Typography, Box, Chip, Button } from '@mui/material';
import { Restaurant, Visibility, AccessTime } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import RecipeAvatar from '../RecipeAvatar';
import { Recipe } from '../../../types/recipes';

interface RecipeCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  preparationTime: string;
  descripition: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  name,
  image,
  category,
  preparationTime,
  descripition,
}) => {
  // Criar objeto Recipe para os botões PDF
  const recipeForPDF: Recipe = {
    _id: id,
    name,
    image,
    category,
    preparationTime,
    descripition,
    sku: '',
    yieldRecipe: '',
    typeYield: '',
    weightRecipe: '',
    typeWeightRecipe: '',
    ingredients: [],
    sellingPrice: 0,
    costPrice: 0,
    profit: 0,
  };
  return (
    <Card
      sx={{
        height: '100%',
        maxWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
      }}
    >
      <RecipeAvatar image={image} name={name} size={140} borderRadius={0} />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography gutterBottom variant="subtitle1" component="div" noWrap>
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1,
            height: '2.5em',
          }}
        >
          {descripition}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            size="small"
            icon={<Restaurant sx={{ fontSize: '0.8rem' }} />}
            label={category}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<AccessTime sx={{ fontSize: '0.8rem' }} />}
            label={preparationTime}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions sx={{ p: 1, pt: 0, flexDirection: 'column', gap: 1 }}>
        {/* Botão Ver Detalhes */}
        <Button
          size="small"
          component={RouterLink}
          to={`/recipes/${id}`}
          startIcon={<Visibility sx={{ fontSize: '0.8rem' }} />}
          sx={{
            fontSize: '0.8rem',
            borderRadius: 2,
            width: '100%',
          }}
          variant="outlined"
        >
          Ver Detalhes
        </Button>
      </CardActions>
    </Card>
  );
};

export default RecipeCard;
