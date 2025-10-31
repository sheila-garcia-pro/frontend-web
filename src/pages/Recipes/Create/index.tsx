import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  SelectChangeEvent,
  GlobalStyles,
} from '@mui/material';
import { ArrowBack, Restaurant, Add, Save, Cancel } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

// Hooks personalizados
import { useRecipeForm } from '../../../hooks/recipes/useRecipeForm';
import { useRecipeExternalData } from '../../../hooks/recipes/useRecipeExternalData';
import { useDevice } from '../../../hooks/useDevice';

// Componentes da página
import RecipeBasicInfo from './components/RecipeBasicInfo';
import RecipeImageUpload from './components/RecipeImageUpload';

// Componentes reutilizáveis existentes
import { RecipeIngredientsCard } from '../../../components/ui';
import RecipeStepsCard from '../../../components/ui/RecipeStepsCard';
import NutritionalInfoSection from '../../../components/ui/NutritionalInfoSection';
import EnhancedFinancialSection from '../../../components/ui/EnhancedFinancialSection';

/**
 * Página dedicada para criação de receitas
 *
 * Migração do RecipeModal para uma página completa seguindo princípios SOLID:
 * - Single Responsibility: Cada componente tem uma responsabilidade específica
 * - Open/Closed: Extensível para novas funcionalidades sem modificar existentes
 * - Dependency Inversion: Depende de abstrações (hooks) não de implementações
 * - Interface Segregation: Interfaces pequenas e focadas
 * - Liskov Substitution: Componentes podem ser substituídos sem quebrar funcionalidade
 */
const RecipeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Hook de responsividade
  const { isMobile, isTablet, isDesktop } = useDevice();

  // Estilos globais para highlight de campos com erro
  const errorHighlightStyles = {
    '.field-error': {
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#f44336 !important',
          borderWidth: '2px !important',
        },
        '&:hover fieldset': {
          borderColor: '#f44336 !important',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#f44336 !important',
        },
      },
      '& .MuiFormLabel-root': {
        color: '#f44336 !important',
      },
      '& .MuiSelect-select': {
        borderColor: '#f44336 !important',
      },
      animation: 'pulseError 0.6s ease-in-out',
    },
    '@keyframes pulseError': {
      '0%': {
        boxShadow: '0 0 0 0px rgba(244, 67, 54, 0.4)',
      },
      '70%': {
        boxShadow: '0 0 0 8px rgba(244, 67, 54, 0)',
      },
      '100%': {
        boxShadow: '0 0 0 0px rgba(244, 67, 54, 0)',
      },
    },
  };

  // Hooks personalizados para gerenciar estado e lógica
  const {
    // Estado do formulário
    formData,
    errors,
    submitting,
    uploading,
    selectedFile,
    preparationTimeValue,
    recipeIngredients,
    recipeSteps,

    // Setters
    setUploading,
    setSelectedFile,

    // Actions
    updateFormField,
    updatePreparationTime,
    updateRecipeIngredients,
    updateRecipeSteps,
    validateForm,
    submitRecipe,
    resetForm,
  } = useRecipeForm();

  // Hook para dados externos
  const {
    userCategories,
    yields,
    unitMeasures,
    userUnitsAmountUse,
    isLoading: loadingExternalData,
    isLoadingCategories,
    loadingYields,
    handleCategoryAdded,
    handleUnitAdded,
  } = useRecipeExternalData();

  // Controle de navegação
  const handleGoBack = () => {
    navigate('/recipes');
  };

  const handleCancel = () => {
    resetForm();
    navigate('/recipes');
  };

  // Handlers específicos
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    updateFormField('category', event.target.value);
  };

  const handleImageUpdate = (imageUrl: string | null) => {
    updateFormField('image', imageUrl || '');
  };

  // Submissão final
  const handleSubmit = async () => {
    const result = await submitRecipe();
    if (result.success && result.recipe) {
      // Navegar diretamente para a receita criada
      navigate(`/recipes/${result.recipe._id}`, {
        state: {
          message: 'Receita criada com sucesso!',
          justCreated: true,
        },
      });
    }
  };

  // Definir passos do wizard
  const steps = ['Informações Básicas', 'Ingredientes', 'Modo de Preparo', 'Finalização'];

  // Loading inicial
  if (loadingExternalData) {
    return (
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflow: 'hidden',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
          '& *': {
            maxWidth: '100%',
          },
        }}
      >
        <Container
          maxWidth={isMobile ? 'sm' : isTablet ? 'lg' : 'xl'}
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              textAlign: 'center',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Carregando dados necessários...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <GlobalStyles styles={errorHighlightStyles} />
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflow: 'hidden',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
          '& *': {
            maxWidth: '100%',
          },
        }}
      >
        <Container
          maxWidth={isMobile ? 'sm' : isTablet ? 'lg' : 'xl'}
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Header com Breadcrumbs e Navegação */}
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <Link
                component={RouterLink}
                to="/recipes"
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                <Restaurant fontSize={isMobile ? 'small' : 'medium'} />
                Receitas
              </Link>
              <Typography
                color="text.primary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                <Add fontSize={isMobile ? 'small' : 'medium'} />
                Nova Receita
              </Typography>
            </Breadcrumbs>

            {/* Header Principal */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 2, sm: 2 },
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 1.5, sm: 2 },
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
                border: '1px solid',
                borderColor: 'divider',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Botão voltar e título - Mobile: linha, Desktop: inline */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexGrow: 1,
                  width: '100%',
                }}
              >
                <IconButton
                  onClick={handleGoBack}
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    minWidth: { xs: 40, sm: 44 },
                    minHeight: { xs: 40, sm: 44 },
                    '&:hover': {
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ArrowBack sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {isMobile ? 'Nova Receita' : 'Criar Nova Receita'}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    Preencha as informações abaixo para criar uma nova receita
                  </Typography>
                </Box>
              </Box>

              {/* Ações do Header */}
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1.5, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={submitting}
                  startIcon={<Cancel sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                  size={isMobile ? 'large' : 'medium'}
                  fullWidth={isMobile}
                  sx={{
                    minHeight: { xs: 48, sm: 42 },
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || loadingExternalData}
                  startIcon={<Save sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                  size={isMobile ? 'large' : 'medium'}
                  fullWidth={isMobile}
                  sx={{
                    minHeight: { xs: 48, sm: 42 },
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: 600,
                  }}
                >
                  {submitting ? 'Salvando...' : isMobile ? 'Salvar' : 'Salvar Receita'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Conteúdo Principal */}
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              overflow: 'hidden',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
              }}
            >
              {/* Progress Stepper */}
              <Box
                sx={{
                  mb: { xs: 3, sm: 4 },
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel={!isMobile}
                  orientation={isMobile ? 'vertical' : 'horizontal'}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    },
                    '& .MuiStepIcon-root': {
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                    },
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{isMobile ? label.split(' ')[0] : label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Seções do Formulário */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 3, sm: 4 },
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Seção 1: Informações Básicas */}
                <Box
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <RecipeBasicInfo
                    name={formData.name}
                    category={formData.category}
                    yieldRecipe={formData.yieldRecipe}
                    typeYield={formData.typeYield}
                    preparationTime={formData.preparationTime}
                    preparationTimeValue={preparationTimeValue}
                    descripition={formData.descripition}
                    weightRecipe={formData.weightRecipe}
                    typeWeightRecipe={formData.typeWeightRecipe}
                    userCategories={userCategories}
                    yields={yields}
                    unitMeasures={unitMeasures}
                    userUnitsAmountUse={userUnitsAmountUse}
                    isLoadingCategories={isLoadingCategories}
                    loadingYields={loadingYields}
                    loadingUnitMeasures={loadingExternalData}
                    loadingUserUnits={loadingExternalData}
                    errors={errors}
                    onFieldChange={updateFormField}
                    onCategoryChange={handleCategoryChange}
                    onTimeChange={updatePreparationTime}
                    onCategoryAdded={handleCategoryAdded}
                  />
                </Box>

                <Divider sx={{ width: '100%' }} />

                {/* Seção 2: Upload de Imagem */}
                <Box
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <RecipeImageUpload
                    image={formData.image || ''}
                    selectedFile={selectedFile}
                    uploading={uploading}
                    errors={errors}
                    onFileChange={() => {}} // Implementado internamente no componente
                    onImageUpdate={handleImageUpdate}
                  />
                </Box>

                <Divider sx={{ width: '100%' }} />

                {/* Seção 3: Ingredientes */}
                <Box
                  data-testid="ingredients-section"
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                  >
                    🥘 Ingredientes da Receita
                  </Typography>

                  {errors.ingredients && (
                    <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
                      {errors.ingredients}
                    </Alert>
                  )}

                  <RecipeIngredientsCard
                    recipeId="new"
                    initialIngredients={recipeIngredients}
                    onIngredientsUpdate={updateRecipeIngredients}
                  />
                </Box>

                <Divider sx={{ width: '100%' }} />

                {/* Seção 4: Modo de Preparo */}
                <Box
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                  >
                    👨‍🍳 Modo de Preparo
                  </Typography>

                  <RecipeStepsCard
                    recipeId="new"
                    initialSteps={recipeSteps}
                    onStepsUpdate={updateRecipeSteps}
                  />
                </Box>

                {/* Seção 5: Informações Financeiras */}
                {/* Temporariamente comentado para resolver problemas de tipo
                <Divider />
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 3,
                    }}
                  >
                    💰 Informações Financeiras
                  </Typography>

                  <EnhancedFinancialSection
                    recipeIngredients={recipeIngredients}
                    initialFinancialData={{
                      totalSalePrice: formData.priceSale || 0,
                      unitSalePrice: 0,
                      monthlyRevenue: 10000,
                      totalYield: parseFloat(formData.yieldRecipe) || 1,
                      unitYield: 1,
                      directCosts: formData.costDirect || [],
                      indirectCosts: formData.costIndirect || [],
                    }}
                    onFinancialDataChange={(data) => {
                      if (data.totalSalePrice !== undefined) {
                        updateFormField('priceSale', data.totalSalePrice);
                      }
                      if (data.directCosts !== undefined) {
                        updateFormField('costDirect', data.directCosts);
                      }
                      if (data.indirectCosts !== undefined) {
                        updateFormField('costIndirect', data.indirectCosts);
                      }
                    }}
                    totalYield={parseFloat(formData.yieldRecipe) || 1}
                  />
                </Box>
                */}

                {/* Seção 6: Informações Nutricionais (se houver ingredientes) */}
                {recipeIngredients.length > 0 && (
                  <>
                    <Divider sx={{ width: '100%' }} />
                    <Box
                      sx={{
                        width: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant={isMobile ? 'subtitle1' : 'h6'}
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: { xs: 2, sm: 3 },
                          fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        }}
                      >
                        🍎 Informações Nutricionais
                      </Typography>

                      {/* DEBUG: Log para verificar dados passados */}
                      {(() => {
                        console.log('🍎 [Recipe Create] Renderizando NutritionalInfoSection:', {
                          ingredientsCount: recipeIngredients.length,
                          ingredients: recipeIngredients.map((ri) => ({
                            name: ri.ingredient.name,
                            quantity: ri.quantity,
                            unit: ri.unitMeasure,
                            totalWeight: ri.totalWeight,
                          })),
                          recipe: {
                            name: formData.name,
                            yield: formData.yieldRecipe,
                          },
                        });
                        return null;
                      })()}

                      <NutritionalInfoSection
                        recipe={{
                          _id: 'new',
                          name: formData.name || 'Nova Receita',
                          category: formData.category || '',
                          image: formData.image || '',
                          yieldRecipe: formData.yieldRecipe || '1',
                          typeYield: formData.typeYield || '',
                          preparationTime: formData.preparationTime || '',
                          weightRecipe: formData.weightRecipe || '0',
                          typeWeightRecipe: formData.typeWeightRecipe || '',
                          descripition: formData.descripition || '',
                          ingredients: [],
                          modePreparation: recipeSteps,
                        }}
                        recipeIngredients={recipeIngredients}
                      />
                    </Box>
                  </>
                )}

                {/* Seção de Ações do Final */}
                <Divider sx={{ width: '100%' }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: { xs: 2, sm: 3 },
                    pt: { xs: 3, sm: 4 },
                    pb: { xs: 1, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: '100%',
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={submitting}
                    startIcon={<Cancel sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                    size={isMobile ? 'large' : 'medium'}
                    fullWidth={isMobile}
                    sx={{
                      minHeight: { xs: 48, sm: 42 },
                      fontSize: { xs: '1rem', sm: '0.875rem' },
                      fontWeight: 600,
                      px: { xs: 3, sm: 4 },
                      minWidth: { sm: 140 },
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting || loadingExternalData}
                    startIcon={<Save sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                    size={isMobile ? 'large' : 'medium'}
                    fullWidth={isMobile}
                    sx={{
                      minHeight: { xs: 48, sm: 42 },
                      fontSize: { xs: '1rem', sm: '0.875rem' },
                      fontWeight: 600,
                      px: { xs: 3, sm: 4 },
                      minWidth: { sm: 140 },
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {submitting ? 'Salvando...' : isMobile ? 'Salvar Receita' : 'Salvar Receita'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default RecipeCreatePage;
