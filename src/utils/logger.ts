import { sanitizeData } from './security';

/**
 * Logger seguro que mascara informações sensíveis automaticamente
 */
export class SafeLogger {
  static isProduction = process.env.NODE_ENV === 'production';
  static isTestEnv = process.env.NODE_ENV === 'test';
  
  /**
   * Determina se o logger deve exibir mensagens no ambiente atual
   */
  static shouldLog(): boolean {
    // Não exibir logs em produção a menos que explicitamente habilitado
    if (this.isProduction && !process.env.REACT_APP_ENABLE_PROD_LOGS) {
      return false;
    }
    
    // Não exibir logs em ambiente de teste
    if (this.isTestEnv) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Sanitiza dados sensíveis antes de logar
   */
  private static sanitize(data: any): any {
    if (typeof data === 'object' && data !== null) {
      return sanitizeData(data);
    }
    return data;
  }

  /**
   * Prepara os argumentos para logging, sanitizando objetos
   */
  private static prepareArgs(args: any[]): any[] {
    return args.map(arg => this.sanitize(arg));
  }

  /**
   * Loga mensagem informativa com dados sanitizados
   */
  static info(message: string, ...args: any[]): void {
    if (!this.shouldLog()) return;
    
    console.info(
      `%c[INFO] %c${message}`,
      'color: #0088ff; font-weight: bold',
      'color: inherit',
      ...this.prepareArgs(args)
    );
  }

  /**
   * Loga mensagem de aviso com dados sanitizados
   */
  static warn(message: string, ...args: any[]): void {
    if (!this.shouldLog()) return;
    
    console.warn(
      `%c[WARN] %c${message}`,
      'color: #ffbb00; font-weight: bold',
      'color: inherit',
      ...this.prepareArgs(args)
    );
  }

  /**
   * Loga mensagem de erro com dados sanitizados
   */
  static error(message: string, ...args: any[]): void {
    if (!this.shouldLog()) return;
    
    console.error(
      `%c[ERROR] %c${message}`,
      'color: #ff0044; font-weight: bold',
      'color: inherit',
      ...this.prepareArgs(args)
    );
  }

  /**
   * Loga mensagem de depuração com dados sanitizados
   */
  static debug(message: string, ...args: any[]): void {
    if (!this.shouldLog()) return;
    
    console.debug(
      `%c[DEBUG] %c${message}`,
      'color: #00aa88; font-weight: bold',
      'color: inherit',
      ...this.prepareArgs(args)
    );
  }

  /**
   * Loga uma requisição HTTP com dados sanitizados
   */
  static request(method: string, url: string, data?: any): void {
    if (!this.shouldLog()) return;
    
    console.log(
      `%c[REQUEST] %c${method.toUpperCase()} %c${url}`,
      'color: #8855ff; font-weight: bold',
      'color: #885599; font-weight: bold',
      'color: inherit',
      data ? this.sanitize(data) : ''
    );
  }

  /**
   * Loga uma resposta HTTP com dados sanitizados
   */
  static response(status: number, url: string, data?: any): void {
    if (!this.shouldLog()) return;
    
    const statusColor = status < 300 ? '#00aa44' : status < 400 ? '#ff9900' : '#ff0044';
    
    console.log(
      `%c[RESPONSE] %c${status} %c${url}`,
      'color: #8855ff; font-weight: bold',
      `color: ${statusColor}; font-weight: bold`,
      'color: inherit',
      data ? this.sanitize(data) : ''
    );
  }
}

// Alias mais curto para conveniência
export const log = SafeLogger;

// Export default para import simples
export default SafeLogger; 