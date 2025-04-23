import { sanitizeData, maskEmail, maskCardNumber, maskPhone, maskDocument } from './security';
import SafeLogger, { log, SafeLogger as Logger } from './logger';

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
  log
};

// Export default para casos específicos
export default {
  security: {
    sanitizeData,
    maskEmail,
    maskCardNumber,
    maskPhone,
    maskDocument
  },
  log: SafeLogger,
  logger: SafeLogger
}; 