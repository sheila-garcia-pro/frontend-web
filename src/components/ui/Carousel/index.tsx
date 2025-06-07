import React, { ReactNode, useState } from 'react';
import { Box, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
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
  const itemsToShow =
    (isXs
      ? itemsPerPage.xs
      : isSm
        ? itemsPerPage.sm
        : isMd
          ? itemsPerPage.md
          : isLg
            ? itemsPerPage.lg
            : itemsPerPage.xl) || 1;
  // Calculate total pages and items
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;
  const totalPages = Math.ceil(totalItems / itemsToShow);
  const itemWidth = 100 / itemsToShow; // Largura de cada item em porcentagem

  // Reset to first page when screen size changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [itemsToShow]);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Se não houver itens, retorna uma mensagem
  if (!totalItems) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Nenhum item disponível para exibição.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        py: 3, // Aumentado para dar mais espaço para os indicadores
        px: { xs: 1, sm: 2 },
        overflow: 'hidden',
        maxWidth: '100vw',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: { xs: '32px', sm: '64px' },
          zIndex: 2,
          pointerEvents: 'none',
        },
        '&::before': {
          left: 0,
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.background.paper} 0%, transparent 100%)`,
        },
        '&::after': {
          right: 0,
          background: (theme) =>
            `linear-gradient(-90deg, ${theme.palette.background.paper} 0%, transparent 100%)`,
        },
      }}
    >
      {' '}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          width: '100%', // Largura do container
          transition: 'transform 0.3s ease-in-out',
          transform: `translateX(-${currentPage * 100}%)`,
        }}
      >
        {Array.from({ length: Math.ceil(childrenArray.length / itemsToShow) }).map(
          (_, pageIndex) => (
            <Box
              key={pageIndex}
              sx={{
                display: 'flex',
                gap: 2,
                flex: 'none',
                width: '100%',
              }}
            >
              {childrenArray
                .slice(pageIndex * itemsToShow, (pageIndex + 1) * itemsToShow)
                .map((child, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      px: { xs: 0.5, sm: 1 },
                    }}
                  >
                    {child}
                  </Box>
                ))}
            </Box>
          ),
        )}
      </Box>
      {totalItems > itemsToShow && (
        <>
          {' '}
          <IconButton
            onClick={handlePrev}
            disabled={currentPage === 0}
            sx={{
              position: 'absolute',
              left: { xs: 0, sm: 1 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              bgcolor: 'background.paper',
              boxShadow: 2,
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4,
              },
              '&.Mui-disabled': {
                opacity: 0,
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            sx={{
              position: 'absolute',
              right: { xs: 0, sm: 1 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              bgcolor: 'background.paper',
              boxShadow: 2,
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4,
              },
              '&.Mui-disabled': {
                opacity: 0,
              },
            }}
          >
            <ChevronRight />
          </IconButton>
          {/* Indicadores de página */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: { xs: 0.5, sm: 1 },
              zIndex: 3,
              py: 1,
            }}
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentPage(index)}
                sx={{
                  width: { xs: 6, sm: 8 },
                  height: { xs: 6, sm: 8 },
                  borderRadius: '50%',
                  backgroundColor: currentPage === index ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    backgroundColor: currentPage === index ? 'primary.dark' : 'grey.400',
                  },
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Carousel;
