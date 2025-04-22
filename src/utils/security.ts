/**
 * Utilitários de segurança para proteção de dados sensíveis
 */

/**
 * Mascara uma string deixando apenas os primeiros e últimos caracteres visíveis
 * @param value String a ser mascarada
 * @param visibleStart Número de caracteres visíveis no início
 * @param visibleEnd Número de caracteres visíveis no final
 * @returns String mascarada
 */
export const maskString = (
  value: string | undefined | null,
  visibleStart = 2,
  visibleEnd = 2
): string => {
  if (!value) return '';
  if (value.length <= visibleStart + visibleEnd) return value;
  
  const start = value.substring(0, visibleStart);
  const end = value.substring(value.length - visibleEnd);
  const masked = '•'.repeat(value.length - (visibleStart + visibleEnd));
  
  return `${start}${masked}${end}`;
};

/**
 * Mascara um endereço de email, deixando o domínio visível
 * @param email Email a ser mascarado
 * @returns Email mascarado
 */
export const maskEmail = (email: string | undefined | null): string => {
  if (!email) return '';
  if (!email.includes('@')) return maskString(email, 2, 2);
  
  const [username, domain] = email.split('@');
  return `${maskString(username, 2, 1)}@${domain}`;
};

/**
 * Mascara um número de cartão de crédito/débito
 * @param cardNumber Número do cartão
 * @returns Número mascarado (apenas últimos 4 dígitos visíveis)
 */
export const maskCardNumber = (cardNumber: string | undefined | null): string => {
  if (!cardNumber) return '';
  
  // Remove espaços e caracteres não numéricos
  const numbers = cardNumber.replace(/\D/g, '');
  
  // Mascaramos tudo, exceto os últimos 4 dígitos
  if (numbers.length <= 4) return numbers;
  
  const visible = numbers.slice(-4);
  const masked = '•'.repeat(numbers.length - 4);
  
  // Formata com espaços a cada 4 dígitos para melhor legibilidade
  const formatted = `${masked}${visible}`.replace(/(.{4})/g, '$1 ').trim();
  
  return formatted;
};

/**
 * Mascara um número de telefone, deixando apenas os últimos dígitos visíveis
 * @param phone Número de telefone
 * @returns Telefone mascarado
 */
export const maskPhone = (phone: string | undefined | null): string => {
  if (!phone) return '';
  
  // Remove tudo que não for número
  const numbers = phone.replace(/\D/g, '');
  
  // Se for menor que 4 dígitos, retorna sem mascarar
  if (numbers.length <= 4) return phone;
  
  // Mantém os últimos 4 dígitos visíveis
  return `•••• ••${numbers.slice(-4)}`;
};

/**
 * Mascara um CPF ou CNPJ
 * @param document CPF ou CNPJ
 * @returns Documento mascarado
 */
export const maskDocument = (document: string | undefined | null): string => {
  if (!document) return '';
  
  // Remove tudo que não for número
  const numbers = document.replace(/\D/g, '');
  
  // CPF
  if (numbers.length <= 11) {
    if (numbers.length <= 4) return document;
    return `***.**${numbers.slice(-3)}-**`;
  }
  
  // CNPJ
  return `**.***.**${numbers.slice(-6)}-**`;
};

/**
 * Sanitiza e mascara dados sensíveis para exibição ou logging
 * @param data Objeto contendo dados potencialmente sensíveis
 * @returns Objeto sanitizado com dados sensíveis mascarados
 */
export const sanitizeData = (data: any): any => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  
  // Lista de campos sensíveis e suas funções de mascaramento
  const sensitiveFields: Record<string, (value: any) => string> = {
    // Senhas
    password: () => '••••••••',
    senha: () => '••••••••',
    pass: () => '••••••••',
    pwd: () => '••••••••',
    newPassword: () => '••••••••',
    confirmPassword: () => '••••••••',
    
    // Dados pessoais
    email: maskEmail,
    cpf: maskDocument,
    cnpj: maskDocument,
    document: maskDocument,
    documento: maskDocument,
    phone: maskPhone,
    telefone: maskPhone,
    celular: maskPhone,
    mobile: maskPhone,
    
    // Dados de cartão
    cardNumber: maskCardNumber,
    cartao: maskCardNumber,
    card: maskCardNumber,
    cvv: () => '•••',
    cvc: () => '•••',
    securityCode: () => '•••',
    
    // Tokens/chaves
    token: (val) => maskString(String(val), 4, 4),
    apiKey: (val) => maskString(String(val), 4, 4),
    secretKey: (val) => maskString(String(val), 4, 4),
    secret: (val) => maskString(String(val), 4, 4),
  };
  
  // Função recursiva para processar objetos aninhados
  const processSensitiveData = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Se for um array, processa cada item
    if (Array.isArray(obj)) {
      return obj.map(item => processSensitiveData(item));
    }
    
    // Clona o objeto para não modificar o original
    const sanitized = { ...obj };
    
    for (const key of Object.keys(sanitized)) {
      const lowercaseKey = key.toLowerCase();
      
      // Verifica se é um campo sensível conhecido
      for (const sensitiveKey in sensitiveFields) {
        if (lowercaseKey.includes(sensitiveKey.toLowerCase())) {
          if (sanitized[key] != null && sanitized[key] !== '') {
            sanitized[key] = sensitiveFields[sensitiveKey](sanitized[key]);
          }
          break;
        }
      }
      
      // Processa recursivamente objetos aninhados
      if (typeof sanitized[key] === 'object') {
        sanitized[key] = processSensitiveData(sanitized[key]);
      }
    }
    
    return sanitized;
  };
  
  return processSensitiveData(data);
}; 