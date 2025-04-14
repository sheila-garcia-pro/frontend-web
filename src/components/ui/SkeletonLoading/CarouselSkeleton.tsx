import React, { ElementType } from 'react';
import { Grid, Box } from '@mui/material';

interface CarouselSkeletonProps {
  SkeletonComponent: React.FC;
  count: number;
  itemsPerRow: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const CarouselSkeleton: React.FC<CarouselSkeletonProps> = ({ 
  SkeletonComponent, 
  count, 
  itemsPerRow 
}) => {
  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid 
            item 
            key={index} 
            xs={12/itemsPerRow.xs} 
            sm={12/itemsPerRow.sm} 
            md={12/itemsPerRow.md} 
            lg={12/itemsPerRow.lg} 
            xl={12/itemsPerRow.xl} 
            component={'div' as ElementType}
          >
            <SkeletonComponent />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CarouselSkeleton; 