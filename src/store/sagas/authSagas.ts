import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  checkAuthRequest,
  checkAuthSuccess,
  checkAuthFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  User,
} from '@store/slices/authSlice';
import { setGlobalLoading } from '@store/slices/uiSlice';
import * as authService from '@services/api/auth';
import * as usersService from '@services/api/users';
import { addNotification } from '@store/slices/uiSlice';
import tokenManager from '@utils/tokenManager';
import { setLoginInProgress, getLoginInProgress } from '@utils/loginFlag';
import { markRecentLogin, isRecentLogin } from '@utils/loginProtection';

// Tipos
type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string; phone: string };
type UpdateUserPayload = Partial<Omit<User, 'image'>> & { image?: string | null };
type ForgotPasswordPayload = { email: string };
type ResetPasswordPayload = { token: string; newPassword: string };

// Saga Login
function* loginSaga(action: PayloadAction<LoginPayload>): SagaIterator {
  try {
    setLoginInProgress(true);
    yield put(setGlobalLoading(true));

    // Usar credenciais no formato correto para a API
    const credentials = {
      email: action.payload.email,
      password: action.payload.password,
    };

    // Chama o serviço de API para login
    const response = yield call(authService.login, credentials); // Verifica se obteve um token válido
    if (!response || !response.token) {
      throw new Error('Não foi possível realizar o login. Por favor, tente novamente.');
    }
    const { token, refreshToken, user, expiresIn } = response;

    // Salva o token no localStorage usando tokenManager
    tokenManager.setToken(token);

    // Verificar se foi salvo corretamente
    const savedToken = tokenManager.getToken();

    // Salva o refresh token se fornecido
    if (refreshToken) {
      tokenManager.setRefreshToken(refreshToken);
    }

    // Se a resposta já inclui os dados do usuário, usar eles
    let userData = user;

    // Se não tem dados do usuário na resposta, buscar separadamente
    if (!userData) {
      try {
        userData = yield call(usersService.getCurrentUser);
      } catch (userError) {
        // Se falhar ao buscar dados do usuário, considera o login falho
        console.error('Erro ao buscar dados do usuário:', userError);
        tokenManager.clearAuthData();
        throw new Error('Falha ao obter dados do usuário');
      }
    }

    // Despacha a ação de sucesso
    yield put(loginSuccess({ user: userData, token }));

    // Verificar se o estado foi atualizado

    // Marcar login recente para proteção contra checkAuth imediato
    markRecentLogin();

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Login realizado com sucesso!',
        type: 'success',
      }),
    );

    setLoginInProgress(false);
  } catch (error) {
    setLoginInProgress(false);

    // Despacha a ação de falha
    yield put(
      loginFailure(
        error instanceof Error
          ? error.message
          : 'Por favor, verifique seu email e senha. Tente novamente.',
      ),
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao fazer login. Por favor, tente novamente.',
        type: 'error',
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga Registro
function* registerSaga(action: PayloadAction<RegisterPayload>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API para registro
    const user = yield call(authService.register, action.payload);

    // Após registro, fazer login automaticamente
    const loginCredentials = {
      email: action.payload.email,
      password: action.payload.password,
    }; // Obter token de login
    const response = yield call(authService.login, loginCredentials);

    // Salva o token no localStorage usando tokenManager
    tokenManager.setToken(response.token);

    // Despacha a ação de sucesso
    yield put(registerSuccess({ user, token: response.token }));

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Registro realizado com sucesso!',
        type: 'success',
      }),
    );
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      registerFailure(error instanceof Error ? error.message : 'Erro ao realizar cadastro'),
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao realizar cadastro. Por favor, tente novamente.',
        type: 'error',
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga Verificação de Token
function* checkAuthSaga(): SagaIterator {
  const token = tokenManager.getToken();
  const isLoginActive = getLoginInProgress();
  const hasRecentLogin = isRecentLogin();

  // Se login está em progresso ou aconteceu recentemente, não verificar agora
  if (isLoginActive || hasRecentLogin) {
    return;
  }

  if (!token) {
    yield put(checkAuthFailure());
    return;
  }

  try {
    // Chama o serviço de API para verificar o token obtendo o usuário atual
    const user = yield call(usersService.getCurrentUser);

    // Se a chamada foi bem sucedida, o token ainda é válido
    if (user) {
      // Despacha a ação de sucesso
      yield put(checkAuthSuccess({ user, token }));
      return;
    }

    // Se não obteve usuário, considera falha na autenticação
    throw new Error('Falha ao obter dados do usuário');
  } catch (error) {
    console.error('🔍 [CHECK AUTH SAGA] Error in checkAuth:', error);

    // Verificar se é um erro de rede ou se realmente é token inválido
    const isNetworkError =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED');

    if (isNetworkError) {
      // Para erros de rede, não limpar os dados, apenas falhar silenciosamente
      yield put(checkAuthFailure());
      return;
    }

    // Se o token for inválido ou houver qualquer outro erro, limpa os dados de autenticação
    tokenManager.clearAuthData();

    // Despacha a ação de falha
    yield put(checkAuthFailure());

    // Se o erro for 401 (Unauthorized), é token expirado
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        // Não redirecionar aqui pois o interceptor já vai tratar
        return;
      }
    }

    // Para outros erros, redireciona apenas se não estiver em rota de autenticação
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (!authRoutes.includes(window.location.pathname)) {
      window.location.href = '/login';
    }
  }
}

// Saga Atualização do Usuário
function* updateUserSaga(action: PayloadAction<UpdateUserPayload>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API para atualizar o usuário
    const user = yield call(authService.updateUser, action.payload);

    // Despacha a ação de sucesso
    yield put(updateUserSuccess(user));

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Perfil atualizado com sucesso!',
        type: 'success',
      }),
    );
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      updateUserFailure(error instanceof Error ? error.message : 'Erro ao atualizar usuário'),
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao atualizar perfil. Por favor, tente novamente.',
        type: 'error',
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para solicitar recuperação de senha (envio de email)
function* forgotPasswordSaga(action: PayloadAction<ForgotPasswordPayload>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API para enviar email de recuperação
    yield call(authService.forgotPassword, action.payload.email);

    // Despacha a ação de sucesso
    yield put(forgotPasswordSuccess());

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Enviamos por email o link de recuperação',
        type: 'success',
      }),
    );
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      forgotPasswordFailure(
        error instanceof Error ? error.message : 'Erro ao solicitar recuperação de senha',
      ),
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Não foi possível enviar as instruções. Tente novamente.',
        type: 'error',
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para redefinir senha com token
function* resetPasswordSaga(action: PayloadAction<ResetPasswordPayload>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API para redefinir a senha
    yield call(authService.resetPassword, action.payload.token, action.payload.newPassword);

    // Despacha a ação de sucesso
    yield put(resetPasswordSuccess());

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Senha redefinida com sucesso! Você já pode fazer login.',
        type: 'success',
      }),
    );

    // Redirecionar para a página de login após sucesso
    window.location.href = '/login';
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      resetPasswordFailure(
        error instanceof Error
          ? error.message
          : 'Erro de autenticação. Não foi possível redefinir a senha.',
      ),
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro de autenticação. Por favor, tente novamente mais tarde.',
        type: 'error',
      }),
    );

    // Redirecionar para a página de login em caso de erro
    window.location.href = '/login';
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Sagas de autenticação
const authSagas = [
  takeLatest(loginRequest.type, loginSaga),
  takeLatest(registerRequest.type, registerSaga),
  takeLatest(checkAuthRequest.type, checkAuthSaga),
  takeLatest(updateUserRequest.type, updateUserSaga),
  takeLatest(forgotPasswordRequest.type, forgotPasswordSaga),
  takeLatest(resetPasswordRequest.type, resetPasswordSaga),
];

export default authSagas;
