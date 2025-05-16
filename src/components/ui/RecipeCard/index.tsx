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
import { People, Restaurant, Visibility } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface RecipeCardProps {
  id: string | number;
  name: string;
  image: string;
  dishType: string;
  servings: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ id, name, image, dishType, servings }) => {
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
        component="img"
        height="180"
        image={image}
        alt={`Imagem da receita ${name}`}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {name}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<Restaurant fontSize="small" />}
            label={dishType}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<People fontSize="small" />}
            label={`${servings} porções`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          component={RouterLink}
          to={`/recipes/${id}`}
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

export default RecipeCard;
