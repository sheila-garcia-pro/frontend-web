import React, { ElementType, ReactNode, useState } from 'react';
import { Box, IconButton, Grid, useTheme, useMediaQuery } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface CarouselProps {
  children: ReactNode[];
  itemsPerPage?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  itemsPerPage = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const theme = useTheme();
  
  // Responsive items per page
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  
  // Determine how many items to show based on screen size
  let itemsToShow = itemsPerPage.xl || 5; // Default to xl
  if (isXs) itemsToShow = itemsPerPage.xs || 1;
  else if (isSm) itemsToShow = itemsPerPage.sm || 2;
  else if (isMd) itemsToShow = itemsPerPage.md || 3;
  else if (isLg) itemsToShow = itemsPerPage.lg || 4;
  
  const totalPages = Math.ceil(children.length / itemsToShow);
  
  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };
  
  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };
  
  // Get current items
  const startIndex = currentPage * itemsToShow;
  const visibleItems = children.slice(startIndex, startIndex + itemsToShow);
  
  return (
    <Box sx={{ position: 'relative', width: '100%', my: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <IconButton 
          onClick={handlePrevious}
          disabled={totalPages <= 1}
          sx={{ 
            position: { xs: 'relative', md: 'absolute' },
            left: { md: -20 },
            zIndex: 1,
          }}
        >
          <ChevronLeft />
        </IconButton>
        
        <Grid container spacing={2} sx={{ width: '100%', mx: 'auto' }}>
          {visibleItems.map((item, index) => (
            <Grid item key={index} xs={12/itemsPerPage.xs!} sm={12/itemsPerPage.sm!} md={12/itemsPerPage.md!} lg={12/itemsPerPage.lg!} xl={12/itemsPerPage.xl!} component={'div' as ElementType}>
              {item}
            </Grid>
          ))}
        </Grid>
        
        <IconButton 
          onClick={handleNext}
          disabled={totalPages <= 1}
          sx={{ 
            position: { xs: 'relative', md: 'absolute' },
            right: { md: -20 },
            zIndex: 1,
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>
      
      {/* Pagination indicators */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentPage(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                mx: 0.5,
                bgcolor: currentPage === index ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Carousel; 