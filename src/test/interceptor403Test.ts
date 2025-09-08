/**
 * Teste para verificar se o interceptor trata corretamente o status 403
 *
 * Este arquivo pode ser usado para testar manualmente se o interceptor
 * está funcionando corretamente para status 403
 */

import api from '@services/api';

export const test403Response = async () => {
  try {
    // Simular uma requisição que pode retornar 403
    // Substitua pela URL que está retornando 403 no seu caso
    const response = await api.get('/v1/some-protected-endpoint');

    return response;
  } catch (error: any) {
    throw error;
  }
};

// Para usar no console do navegador:
// import { test403Response } from '@test/interceptor403Test';
// test403Response();

export default test403Response;
