import React, { ElementType } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Box, Chip, Button } from '@mui/material';
import { Restaurant, Visibility } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface IngredientCardProps {
  id: number;
  name: string;
  image: string;
  price: string;
  recipesCount: number;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ 
  id, 
  name, 
  image, 
  price, 
  recipesCount 
}) => {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s', 
      borderRadius: 2,
      overflow: 'hidden',
      '&:hover': { 
        transform: 'translateY(-5px)', 
        boxShadow: 6 
      } 
    }}>
      <CardMedia
        component="img"
        height="100"
        image={image}
        alt={`Imagem do ingrediente ${name}`}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Preço: R$ {price}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip 
            icon={<Restaurant fontSize="small" />} 
            label={`${recipesCount} receitas`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          component={RouterLink} 
          to={`/ingredients/${id}`} 
          startIcon={<Visibility />}
          sx={{ 
            ml: 'auto',
            mr: 'auto',
            mb: 0.5,
            borderRadius: 4,
          }}
          variant="outlined"
        >
          Ver Detalhes
        </Button>
      </CardActions>
    </Card>
  );
};

export default IngredientCard; 