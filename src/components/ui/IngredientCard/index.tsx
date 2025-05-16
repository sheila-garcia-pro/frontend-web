import React, { ElementType } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { Category, Visibility } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Ingredient } from '../../../types/ingredients';

interface IngredientCardProps {
  ingredient: Ingredient;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ ingredient }) => {
  const { _id, name, category, image } = ingredient;

  return (
    <Card
      sx={{
        height: '100%',
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
      <CardMedia
        component="div"
        image={image}
        title={`Imagem do ingrediente ${name}`}
        sx={{
          height: 140,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {name}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={<Category fontSize="small" />}
            label={category}
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
          to={`/ingredients/${_id}`}
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
