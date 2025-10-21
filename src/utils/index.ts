import { sanitizeData, maskEmail, maskCardNumber, maskPhone, maskDocument } from './security';
import SafeLogger, { log, SafeLogger as Logger } from './logger';
import { convertToGrams, culinaryConversions } from './unitConversion';
import {
  isSupportedUnit,
  parseUnitString,
  formatGramsDisplay,
  validatePriceMeasureData,
  normalizePriceMeasureData,
  suggestUnits,
} from './unitValidation';
import {
  convertRecipeIngredientsForAPI,
  validateRecipeIngredients,
  formatIngredientsForLog,
} from './recipeIngredientConversion';

// Re-exporta utilitários de segurança individualmente para facilitar importação
export {
  // Security utils
  sanitizeData,
  maskEmail,
  maskCardNumber,
  maskPhone,
  maskDocument,

  // Logger utils
  SafeLogger,
  Logger,
  log,

  // Unit conversion utils
  convertToGrams,
  culinaryConversions,

  // Unit validation utils
  isSupportedUnit,
  parseUnitString,
  formatGramsDisplay,
  validatePriceMeasureData,
  normalizePriceMeasureData,
  suggestUnits,

  // Recipe ingredient conversion utils
  convertRecipeIngredientsForAPI,
  validateRecipeIngredients,
  formatIngredientsForLog,
};

// Export default para casos específicos
export default {
  security: {
    sanitizeData,
    maskEmail,
    maskCardNumber,
    maskPhone,
    maskDocument,
  },
  log: SafeLogger,
  logger: SafeLogger,
  units: {
    convertToGrams,
    culinaryConversions,
    isSupportedUnit,
    parseUnitString,
    formatGramsDisplay,
    validatePriceMeasureData,
    normalizePriceMeasureData,
    suggestUnits,
  },
  recipes: {
    convertRecipeIngredientsForAPI,
    validateRecipeIngredients,
    formatIngredientsForLog,
  },
};
