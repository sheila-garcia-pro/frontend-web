// Hook para aplicar estilos que removem as setas dos inputs de número
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Hook que retorna estilos para remover as setas dos inputs de número
 * @returns Objeto sx com estilos para remover setas dos inputs type="number"
 */
export const useNumberInputStyles = (): SxProps<Theme> => ({
  '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
    {
      WebkitAppearance: 'none',
      margin: 0,
    },
  '& input[type="number"]': {
    MozAppearance: 'textfield',
  },
});

/**
 * Estilos para remover as setas dos inputs de número
 * Use este objeto em conjunto com outros estilos sx
 */
export const numberInputStyles: SxProps<Theme> = {
  '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
    {
      WebkitAppearance: 'none',
      margin: 0,
    },
  '& input[type="number"]': {
    MozAppearance: 'textfield',
  },
};

/**
 * Função utilitária para combinar estilos existentes com a remoção de setas
 * @param existingSx - Estilos sx existentes
 * @returns Estilos combinados
 */
export const withNumberInputStyles = (existingSx?: SxProps<Theme>): SxProps<Theme> => ({
  ...existingSx,
  ...numberInputStyles,
});
