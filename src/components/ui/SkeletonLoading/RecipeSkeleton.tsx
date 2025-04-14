import React, { ElementType } from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

const RecipeSkeleton: React.FC = () => {
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
        height={180}
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
        
        {/* Chips */}
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Skeleton 
            variant="rounded" 
            width={100} 
            height={30} 
            animation="wave"
            sx={{ borderRadius: 4, bgcolor: 'grey.200' }}
          />
          <Skeleton 
            variant="rounded" 
            width={110} 
            height={30} 
            animation="wave"
            sx={{ borderRadius: 4, bgcolor: 'grey.200' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecipeSkeleton; 