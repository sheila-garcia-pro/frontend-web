import * as securityUtils from './security';
import SafeLogger, { log } from './logger';

// Re-exporta utilitários para facilitar importação
export { 
  securityUtils,
  SafeLogger,
  log
};

// Export default para casos específicos
export default {
  security: securityUtils,
  log: SafeLogger
}; 