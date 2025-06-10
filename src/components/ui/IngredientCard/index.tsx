import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { _id, name, image, isEdit } = ingredient;

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
        minHeight: { xs: 260, sm: 280 }, // Altura responsiva
        maxWidth: { xs: '100%', sm: 300 }, // Largura máxima responsiva
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
        position: 'relative',
        mx: 'auto',
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      {' '}
      {isEdit && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Tooltip title={t('ingredients.actions.delete')}>
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
          height: 180, // Aumentado para 180px
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(0, 0, 0, 0.04)', // Fundo neutro para melhor visualização
        }}
      />{' '}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          noWrap
          sx={{
            fontSize: '1.1rem',
            fontWeight: 500,
            mb: 2,
          }}
        >
          {name}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          {' '}
          <Chip
            label={`R$ ${ingredient.price?.price.toFixed(2) || '0.00'}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              height: 28,
              '& .MuiChip-label': {
                px: 1,
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      </CardContent>{' '}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          onClick={() => onViewDetails(_id)}
          startIcon={<Visibility />}
          sx={{
            ml: 'auto',
            mr: 'auto',
            borderRadius: 3,
            px: 2,
            fontSize: '0.875rem',
            height: 36,
            minWidth: 140,
            whiteSpace: 'nowrap',
          }}
          variant="outlined"
        >
          {t('ingredients.actions.viewDetails')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default IngredientCard;
