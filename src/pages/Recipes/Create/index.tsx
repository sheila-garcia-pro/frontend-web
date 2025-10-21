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
    const success = await submitRecipe();
    if (success) {
      navigate('/recipes', {
        state: {
          message: 'Receita criada com sucesso!',
          reloadList: true,
          createdRecipeName: formData.name,
        },
      });
    }
  };

  // Definir passos do wizard
  const steps = ['Informações Básicas', 'Ingredientes', 'Modo de Preparo', 'Finalização'];

  // Loading inicial
  if (loadingExternalData) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            Carregando dados necessários...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <GlobalStyles styles={errorHighlightStyles} />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Header com Breadcrumbs e Navegação */}
          <Box sx={{ mb: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link
                component={RouterLink}
                to="/recipes"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <Restaurant fontSize="small" />
                Receitas
              </Link>
              <Typography
                color="text.primary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <Add fontSize="small" />
                Nova Receita
              </Typography>
            </Breadcrumbs>

            {/* Header Principal */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 2,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <IconButton
                onClick={handleGoBack}
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 2 },
                }}
              >
                <ArrowBack />
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Criar Nova Receita
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Preencha as informações abaixo para criar uma nova receita
                </Typography>
              </Box>

              {/* Ações do Header */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={submitting}
                  startIcon={<Cancel />}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || loadingExternalData}
                  startIcon={<Save />}
                >
                  {submitting ? 'Salvando...' : 'Salvar Receita'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Conteúdo Principal */}
          <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardContent sx={{ p: 4 }}>
              {/* Progress Stepper */}
              <Box sx={{ mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Seções do Formulário */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Seção 1: Informações Básicas */}
                <Box>
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

                <Divider />

                {/* Seção 2: Upload de Imagem */}
                <Box>
                  <RecipeImageUpload
                    image={formData.image || ''}
                    selectedFile={selectedFile}
                    uploading={uploading}
                    errors={errors}
                    onFileChange={() => {}} // Implementado internamente no componente
                    onImageUpdate={handleImageUpdate}
                  />
                </Box>

                <Divider />

                {/* Seção 3: Ingredientes */}
                <Box data-testid="ingredients-section">
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
                    🥘 Ingredientes da Receita
                  </Typography>

                  {errors.ingredients && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {errors.ingredients}
                    </Alert>
                  )}

                  <RecipeIngredientsCard
                    recipeId="new"
                    initialIngredients={recipeIngredients}
                    onIngredientsUpdate={updateRecipeIngredients}
                  />
                </Box>

                <Divider />

                {/* Seção 4: Modo de Preparo */}
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
                        🍎 Informações Nutricionais
                      </Typography>

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
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default RecipeCreatePage;
