import React, { ElementType } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Box, Chip, Button } from '@mui/material';
import { Restaurant, Visibility } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Ingredient } from '../../../types/ingredients';

// Interface com suporte a ambos os formatos (legado e novo)
interface IngredientCardProps {
  // Novo formato
  ingredient?: Ingredient;
  // Formato legado
  id?: string | number;
  name?: string;
  image?: string;
  price?: string;
  recipesCount?: number;
}

const IngredientCard: React.FC<IngredientCardProps> = (props) => {
  // Extrair dados independentemente do formato das props
  const isLegacyFormat = !props.ingredient && props.name !== undefined;
  
  // Dados a serem usados na renderização
  const id = isLegacyFormat ? props.id : props.ingredient?._id;
  const name = isLegacyFormat ? props.name : props.ingredient?.name;
  const image = isLegacyFormat ? props.image : props.ingredient?.image;
  const price = isLegacyFormat ? props.price : undefined; // Não existe no novo formato
  const recipesCount = isLegacyFormat 
    ? props.recipesCount 
    : (props.recipesCount !== undefined ? props.recipesCount : 0); // Use props.recipesCount se fornecido, caso contrário 0
  
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
        
        {/* Exibir preço apenas se estiver disponível (formato legado) */}
        {price && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Preço: R$ {price}
          </Typography>
        )}
        
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