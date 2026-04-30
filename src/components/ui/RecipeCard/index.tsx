import React from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  MenuProps,
} from '@mui/material';
import { Restaurant, AccessTime, MoreVert, PictureAsPdf, DeleteOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import RecipeAvatar from '../RecipeAvatar';
import { Recipe } from '../../../types/recipes';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (recipe: Recipe) => void;
  onPdf?: (recipe: Recipe) => void;
  onOpenDetails?: (recipe: Recipe) => void;
  isPdfGenerating?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onDelete,
  onPdf,
  onOpenDetails,
  isPdfGenerating = false,
}) => {
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = (event?: React.SyntheticEvent) => {
    event?.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleMenuClose: MenuProps['onClose'] = (event) => {
    if (event && 'stopPropagation' in event) {
      (event as React.SyntheticEvent).stopPropagation();
    }
    setMenuAnchorEl(null);
  };

  const handleOpenDetails = () => {
    if (onOpenDetails) {
      onOpenDetails(recipe);
      return;
    }

    navigate(`/recipes/${recipe._id}`);
  };

  const handlePdfClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    if (onPdf) {
      onPdf(recipe);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    if (onDelete) {
      onDelete(recipe);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        maxWidth: 320,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (theme) => theme.shadows[6],
        },
        position: 'relative',
      }}
    >
      <IconButton
        onClick={handleMenuOpen}
        aria-label="acoes da receita"
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'background.default',
          },
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 6,
          sx: {
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handlePdfClick} disabled={!onPdf || isPdfGenerating}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText>{isPdfGenerating ? 'Gerando PDF...' : 'Gerar PDF'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} disabled={!onDelete}>
          <ListItemIcon>
            <DeleteOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      <CardActionArea onClick={handleOpenDetails} sx={{ alignItems: 'stretch' }}>
        <RecipeAvatar image={recipe.image} name={recipe.name} size={160} borderRadius={0} />
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography gutterBottom variant="subtitle1" component="div" noWrap sx={{
            fontWeight: 600,
          }}>
            {recipe.name}
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
              minHeight: '2.5em',
            }}
          >
            {recipe.descripition}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              size="small"
              icon={<Restaurant sx={{ fontSize: '0.8rem' }} />}
              label={recipe.category}
              color="primary"
              variant="outlined"
            />
            <Chip
              size="small"
              icon={<AccessTime sx={{ fontSize: '0.8rem' }} />}
              label={recipe.preparationTime}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default RecipeCard;
