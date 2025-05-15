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

// Função auxiliar para verificar se devemos realmente fazer uma nova requisição
const shouldFetchIngredients = (state: RootState, action: PayloadAction<SearchParams>): boolean => {
  const { items, loading, filter, page, itemPerPage } = state.ingredients;

  if (loading) return false;

  const sameParams =
    page === action.payload.page &&
    itemPerPage === action.payload.itemPerPage &&
    filter.category === (action.payload.category || null) &&
    filter.search === (action.payload.search || '');

  return !(sameParams && items.length > 0);
};

// Saga para buscar ingredientes
function* fetchIngredientsSaga(action: PayloadAction<SearchParams>): SagaIterator {
  try {
    const state: RootState = yield select();
    if (!shouldFetchIngredients(state, action)) {
      return; // Sai da saga se não for necessário requisitar
    }

    yield put(setGlobalLoading(true));

    const response = yield call(ingredientsService.getCachedIngredients, action.payload);

    yield put(fetchIngredientsSuccess(response));
  } catch (error) {
    yield put(fetchIngredientsFailure(error instanceof Error ? error.message : 'Erro ao carregar ingredientes'));
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para buscar ingrediente por ID
function* fetchIngredientByIdSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API COM CACHE
    const response = yield call(ingredientsService.getCachedIngredientById, action.payload);

    // Despacha a ação de sucesso
    yield put(fetchIngredientByIdSuccess(response));
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      fetchIngredientByIdFailure(error instanceof Error ? error.message : 'Erro ao carregar ingrediente')
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao carregar detalhes do ingrediente.',
        type: 'error',
        duration: 5000,
      })
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
      })
    );
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      createIngredientFailure(error instanceof Error ? error.message : 'Erro ao criar ingrediente')
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao criar ingrediente.',
        type: 'error',
        duration: 5000,
      })
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