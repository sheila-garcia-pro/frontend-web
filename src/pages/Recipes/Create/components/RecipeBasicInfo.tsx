import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Schedule as ScheduleIcon, Scale as ScaleIcon } from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { RecipeCategory } from '../../../../services/api/recipeCategories';
import QuickCategoryAdd from '../../../../components/ui/QuickCategoryAdd';
import QuickUnitAmountUseAdd from '../../../../components/ui/QuickUnitAmountUseAdd';

/**
 * Interface para os props do componente
 */
interface RecipeBasicInfoProps {
  // Dados do formulário
  name: string;
  category: string;
  yieldRecipe: string;
  typeYield: string;
  preparationTime: string;
  preparationTimeValue: Dayjs | null;
  descripition: string;
  weightRecipe: string;
  typeWeightRecipe: string;

  // Dados externos
  userCategories: RecipeCategory[];
  yields: Array<{ _id: string; name: string; description?: string }>;
  userUnitsAmountUse: Array<{ _id?: string; id?: string; name: string; description?: string }>;
  isLoadingCategories: boolean;
  loadingYields: boolean;
  loadingUserUnits: boolean;

  // Erros
  errors: { [key: string]: string };

  // Handlers
  onFieldChange: (field: string, value: any) => void;
  onCategoryChange: (event: SelectChangeEvent<string>) => void;
  onTimeChange: (newValue: Dayjs | null) => void;
  onCategoryAdded: (categoryId: string, categoryName: string) => Promise<string>;
}

/**
 * Componente para informações básicas da receita
 */
const RecipeBasicInfo: React.FC<RecipeBasicInfoProps> = ({
  name,
  category,
  yieldRecipe,
  typeYield,
  preparationTime,
  preparationTimeValue,
  descripition,
  weightRecipe,
  typeWeightRecipe,
  userCategories,
  yields,
  userUnitsAmountUse,
  isLoadingCategories,
  loadingYields,
  loadingUserUnits,
  errors,
  onFieldChange,
  onCategoryChange,
  onTimeChange,
  onCategoryAdded,
}) => {
  /**
   * Handler para mudanças em campos de texto
   */
  const handleTextChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFieldChange(field, e.target.value);
    };

  return (
    <Box>
      {/* Cabeçalho da Seção */}
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
        📝 Informações Básicas
      </Typography>

      <Stack spacing={3}>
        {/* Linha 1: Nome da Receita */}
        <TextField
          label="Nome da Receita"
          name="name"
          fullWidth
          value={name}
          onChange={handleTextChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          required
          data-testid="recipe-name-input"
        />

        {/* Linha 2: Categoria e Rendimento */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth error={!!errors.category} data-testid="category-select">
              <InputLabel>Categoria *</InputLabel>
              <Select
                value={category}
                onChange={onCategoryChange}
                label="Categoria *"
                disabled={isLoadingCategories}
                endAdornment={
                  isLoadingCategories ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null
                }
              >
                {userCategories?.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                )) || []}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>
            <QuickCategoryAdd onCategoryAdded={onCategoryAdded} />
          </Box>

          <TextField
            label="Rendimento"
            name="yieldRecipe"
            fullWidth
            value={yieldRecipe}
            onChange={handleTextChange('yieldRecipe')}
            error={!!errors.yieldRecipe}
            helperText={errors.yieldRecipe}
            required
            type="number"
            sx={{ flex: 1 }}
            data-testid="yield-recipe-input"
          />
        </Box>

        {/* Linha 3: Tipo de Rendimento e Tempo de Preparação */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <FormControl
            fullWidth
            error={!!errors.typeYield}
            sx={{ flex: 1 }}
            data-testid="yield-type-select"
          >
            <InputLabel>Tipo de Rendimento *</InputLabel>
            <Select
              value={typeYield || ''}
              onChange={(e) => {
                const value = e.target.value;
                onFieldChange('typeYield', value);
              }}
              label="Tipo de Rendimento *"
              disabled={loadingYields}
              displayEmpty
            >
              <MenuItem value="">
                <em>Selecione um tipo de rendimento</em>
              </MenuItem>
              {yields?.map((yieldItem, index) => {
                const itemValue = yieldItem._id || yieldItem.name || `yield-${index}`;
                return (
                  <MenuItem key={itemValue} value={itemValue}>
                    {yieldItem.name}
                  </MenuItem>
                );
              }) || []}
            </Select>
            {errors.typeYield && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.typeYield}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ flex: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <TimePicker
                label="Tempo de Preparação *"
                value={preparationTimeValue}
                onChange={onTimeChange}
                views={['hours', 'minutes']}
                format="HH:mm"
                slots={{
                  openPickerIcon: ScheduleIcon,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.preparationTime,
                    helperText: errors.preparationTime || 'Tempo estimado para preparo',
                    inputProps: { 'data-testid': 'preparation-time-input' },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* Linha 4: Descrição */}
        <TextField
          label="Descrição"
          fullWidth
          multiline
          rows={3}
          value={descripition}
          onChange={handleTextChange('descripition')}
          error={!!errors.descripition}
          helperText={errors.descripition || 'Descreva brevemente esta receita'}
        />

        {/* Linha 5: Peso da Receita e Tipo de Peso */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            ⚖️ Informações de Peso (Opcional)
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <QuickUnitAmountUseAdd onUnitAdded={() => {}} />
              </Box>

              <TextField
                label="Peso da Receita"
                name="weightRecipe"
                value={weightRecipe}
                onChange={handleTextChange('weightRecipe')}
                fullWidth
                error={!!errors.weightRecipe}
                helperText={errors.weightRecipe || 'Digite apenas números (ex: 1.5, 250)'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScaleIcon />
                    </InputAdornment>
                  ),
                  inputProps: {
                    inputMode: 'decimal',
                    pattern: '[0-9]*[.,]?[0-9]*',
                  },
                }}
                data-testid="weight-recipe-input"
              />
            </Box>

            <FormControl
              fullWidth
              error={!!errors.typeWeightRecipe}
              sx={{ flex: 1 }}
              data-testid="weight-type-select"
            >
              <InputLabel>Unidade de Peso</InputLabel>
              <Select
                value={typeWeightRecipe || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onFieldChange('typeWeightRecipe', value);
                }}
                label="Unidade de Peso"
                disabled={loadingUserUnits}
                displayEmpty
              >
                <MenuItem value=""></MenuItem>
                {userUnitsAmountUse?.map((unit, index) => {
                  const itemValue = unit._id || unit.id || unit.name || `unit-${index}`;
                  return (
                    <MenuItem key={itemValue} value={itemValue}>
                      {unit.name}
                    </MenuItem>
                  );
                }) || []}
              </Select>
              {errors.typeWeightRecipe && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.typeWeightRecipe}
                </Typography>
              )}
            </FormControl>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default RecipeBasicInfo;
