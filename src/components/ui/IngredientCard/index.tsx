import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Category, Visibility, Delete, RestaurantMenu } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Ingredient } from '../../../types/ingredients';

interface IngredientCardProps {
  ingredient: Ingredient;
  onViewDetails: (id: string) => void;
  onDelete?: (id: string) => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ ingredient, onViewDetails, onDelete }) => {
  const { _id, name, category, image, isEdit } = ingredient;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(_id);
    }
  };

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
        position: 'relative',
      }}
    >
      {isEdit && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Tooltip title="Deletar ingrediente">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <CardMedia
        component="div"
        image={image}
        title={`Imagem do ingrediente ${name}`}
        sx={{
          height: 140,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(0, 0, 0, 0.04)', // Fundo neutro para melhor visualização
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {name}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={<RestaurantMenu fontSize="medium" />}
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
          onClick={() => onViewDetails(_id)}
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
