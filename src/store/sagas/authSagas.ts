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
  User,
} from '@store/slices/authSlice';
import { setGlobalLoading } from '@store/slices/uiSlice';
import * as authService from '@services/api/auth';
import * as usersService from '@services/api/users';

// Tipos
type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string; phone: string };
type UpdateUserPayload = { id: string; [key: string]: any };

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
    const { token } = yield call(authService.login, credentials);

    // Salva o token no localStorage
    localStorage.setItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token', token);

    // Busca os dados do usuário atual
    const user = yield call(usersService.getCurrentUser);

    // Despacha a ação de sucesso
    yield put(loginSuccess({ user, token }));
  } catch (error) {
    // Despacha a ação de falha
    yield put(loginFailure(error instanceof Error ? error.message : 'Erro ao realizar login'));
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

    // Despacha a ação de sucesso
    yield put(registerSuccess({ user, token }));
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

    // Despacha a ação de sucesso
    yield put(checkAuthSuccess({ user, token }));
  } catch (error) {
    // Se o token for inválido, remove-o
    localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token');

    // Despacha a ação de falha
    yield put(checkAuthFailure());
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

// Sagas de autenticação
const authSagas = [
  takeLatest(loginRequest.type, loginSaga),
  takeLatest(registerRequest.type, registerSaga),
  takeLatest(checkAuthRequest.type, checkAuthSaga),
  takeLatest(updateUserRequest.type, updateUserSaga),
];

export default authSagas;
