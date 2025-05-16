import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import {
  fetchIngredientsRequest,
  fetchIngredientsSuccess,
  fetchIngredientsFailure,
  fetchIngredientByIdRequest,
  fetchIngredientByIdSuccess,
  fetchIngredientByIdFailure,
  createIngredientRequest,
  createIngredientSuccess,
  createIngredientFailure,
} from '../slices/ingredientsSlice';
import { setGlobalLoading, addNotification } from '../slices/uiSlice';
import * as ingredientsService from '../../services/api/ingredients';
import { SearchParams, CreateIngredientParams } from '../../types/ingredients';
import { RootState } from '../index';

// Verifica se deve fazer a requisição de ingredientes
const shouldFetchIngredients = (state: RootState, action: PayloadAction<SearchParams>): boolean => {
  const { loading } = state.ingredients;

  // Se houver uma mudança nos parâmetros, força a requisição
  const currentParams =
    state.ingredients.page +
    ',' +
    state.ingredients.itemPerPage +
    ',' +
    state.ingredients.filter.category +
    ',' +
    state.ingredients.filter.search;

  const newParams =
    action.payload.page +
    ',' +
    action.payload.itemPerPage +
    ',' +
    action.payload.category +
    ',' +
    action.payload.search;

  const paramsChanged = currentParams !== newParams;

  // Permite a requisição se não estiver carregando ou se os parâmetros mudaram
  return !loading || paramsChanged;
};

// Saga para buscar ingredientes
function* fetchIngredientsSaga(action: PayloadAction<SearchParams>): SagaIterator {
  try {
    const state: RootState = yield select();
    console.log('fetchIngredientsSaga - parâmetros:', action.payload);

    // Verifica se deve fazer a requisição
    if (!shouldFetchIngredients(state, action)) {
      console.log('fetchIngredientsSaga - requisição ignorada:', {
        loading: state.ingredients.loading,
        currentParams: {
          page: state.ingredients.page,
          itemPerPage: state.ingredients.itemPerPage,
          category: state.ingredients.filter.category,
          search: state.ingredients.filter.search,
        },
        newParams: action.payload,
      });
      return;
    }

    // Usa o serviço de ingredientes com cache para melhor performance
    const response = yield call(ingredientsService.getCachedIngredients, action.payload);
    console.log('fetchIngredientsSaga - resposta da API:', response);

    yield put(fetchIngredientsSuccess(response));
  } catch (error) {
    console.error('fetchIngredientsSaga - erro:', error);
    yield put(
      fetchIngredientsFailure(
        error instanceof Error ? error.message : 'Erro ao carregar ingredientes',
      ),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para buscar ingrediente por ID
function* fetchIngredientByIdSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));
    console.log('fetchIngredientByIdSaga - ID:', action.payload);

    // Chama o serviço de API COM CACHE
    const response = yield call(ingredientsService.getCachedIngredientById, action.payload);
    console.log('fetchIngredientByIdSaga - resposta:', response);

    // Despacha a ação de sucesso
    yield put(fetchIngredientByIdSuccess(response));
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      fetchIngredientByIdFailure(
        error instanceof Error ? error.message : 'Erro ao carregar ingrediente',
      ),
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao carregar detalhes do ingrediente.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para criar ingrediente
function* createIngredientSaga(action: PayloadAction<CreateIngredientParams>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API
    const response = yield call(ingredientsService.createIngredient, action.payload);

    // Despacha a ação de sucesso
    yield put(createIngredientSuccess(response));

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Ingrediente criado com sucesso!',
        type: 'success',
        duration: 4000,
      }),
    );
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      createIngredientFailure(error instanceof Error ? error.message : 'Erro ao criar ingrediente'),
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao criar ingrediente.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Sagas de ingredientes
const ingredientsSagas = [
  takeLatest(fetchIngredientsRequest.type, fetchIngredientsSaga),
  takeLatest(fetchIngredientByIdRequest.type, fetchIngredientByIdSaga),
  takeLatest(createIngredientRequest.type, createIngredientSaga),
];

export default ingredientsSagas;
