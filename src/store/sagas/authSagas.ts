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
import { delay } from 'redux-saga/effects';

// Tipos
type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string; phone: string };
type UpdateUserPayload = { id: string; [key: string]: any };
type ForgotPasswordPayload = { email: string };
type ResetPasswordPayload = { token: string; newPassword: string };

// Saga Login
function* loginSaga(action: PayloadAction<LoginPayload>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Adaptar credenciais para o formato da API
    const credentials = {
      login: action.payload.email, // Usar email como login
      password: action.payload.password,
    };

    // Chama o serviço de API para login
    const response = yield call(authService.login, credentials);

    // Verifica se obteve um token válido
    if (!response || !response.token) {
      throw new Error('Não foi possível realizar o login. Por favor, tente novamente.');
    }

    const { token } = response;

    // Salva o token no localStorage
    localStorage.setItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token', token);

    try {
      // Busca os dados do usuário atual
      const user = yield call(usersService.getCurrentUser);

      // Despacha a ação de sucesso (sem enviar a senha no payload)
      yield put(loginSuccess({ user, token }));
    } catch (userError) {
      // Se falhar ao buscar dados do usuário, considera o login falho
      localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token');
      throw new Error('Falha ao obter dados do usuário');
    }

    // Limpa as credenciais para garantir que não sejam acessíveis
    action.payload.password = '';
  } catch (error) {
    // Remover o token se houver falha no login
    localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token');

    // Despacha a ação de falha
    yield put(
      loginFailure(
        error instanceof Error
          ? error.message
          : 'Por favor, verifique seu email e senha. Tente novamente.',
      ),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga Registro
function* registerSaga(action: PayloadAction<RegisterPayload>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Preparar credenciais para o formato da API usando todos os campos do payload
    const credentials = {
      name: action.payload.name,
      email: action.payload.email,
      password: action.payload.password,
      phone: action.payload.phone, // Usar o valor fornecido pelo usuário
    };

    // Chama o serviço de API para registro
    const user = yield call(authService.register, credentials);

    // Após registro, fazer login automaticamente
    const loginCredentials = {
      login: action.payload.email,
      password: action.payload.password,
    };

    // Obter token de login
    const { token } = yield call(authService.login, loginCredentials);

    // Salva o token no localStorage
    localStorage.setItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token', token);

    // Despacha a ação de sucesso (sem enviar a senha no payload)
    yield put(registerSuccess({ user, token }));

    // Limpa as credenciais para garantir que não sejam acessíveis
    action.payload.password = '';
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      registerFailure(error instanceof Error ? error.message : 'Erro ao realizar cadastro'),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga Verificação de Token
function* checkAuthSaga(): SagaIterator {
  const token = localStorage.getItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token');

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
    // Se o token for inválido ou houver qualquer erro, remove o token
    localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token');

    // Despacha a ação de falha e redireciona para login se não estiver lá
    yield put(checkAuthFailure());
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

// Saga Atualização do Usuário
function* updateUserSaga(action: PayloadAction<UpdateUserPayload>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API
    const user = yield call(authService.updateUser, action.payload);

    // Despacha a ação de sucesso
    yield put(updateUserSuccess(user));
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      updateUserFailure(error instanceof Error ? error.message : 'Erro ao atualizar usuário'),
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
    const result = yield call(authService.forgotPassword, action.payload.email);

    // Despacha a ação de sucesso
    yield put(forgotPasswordSuccess());

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Enviamos por email o link de recuperaçao',
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
    const result = yield call(
      authService.resetPassword,
      action.payload.token,
      action.payload.newPassword,
    );

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
    // Não removemos este redirecionamento pois neste caso faz sentido ir para login
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
