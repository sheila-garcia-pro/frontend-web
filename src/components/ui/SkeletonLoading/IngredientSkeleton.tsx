import React, { ElementType } from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

const IngredientSkeleton: React.FC = () => {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: 2,
      borderRadius: 2
    }}>
      {/* Imagem */}
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={140}
        animation="wave"
        sx={{ bgcolor: 'grey.200' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Nome */}
        <Skeleton 
          variant="text" 
          width="80%" 
          height={32} 
          animation="wave"
          sx={{ mb: 1, bgcolor: 'grey.200' }}
        />
        
        {/* Preço */}
        <Skeleton 
          variant="text" 
          width="50%" 
          height={24} 
          animation="wave"
          sx={{ mb: 1, bgcolor: 'grey.200' }}
        />
        
        {/* Chip de receitas */}
        <Box sx={{ mt: 1 }}>
          <Skeleton 
            variant="rounded" 
            width={120} 
            height={30} 
            animation="wave"
            sx={{ borderRadius: 4, bgcolor: 'grey.200' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default IngredientSkeleton; 