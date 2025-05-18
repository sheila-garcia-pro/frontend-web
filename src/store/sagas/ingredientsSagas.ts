import { call, put, takeLatest, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import {
  fetchIngredientsRequest,
  fetchIngredientsSuccess,
  fetchIngredientsFailure,
  createIngredientRequest,
  createIngredientSuccess,
  createIngredientFailure,
} from '../slices/ingredientsSlice';
import { setGlobalLoading, addNotification } from '../slices/uiSlice';
import * as ingredientsService from '../../services/api/ingredients';
import { SearchParams, CreateIngredientParams } from '../../types/ingredients';
import { clearCache } from '../../services/api';

// Saga para buscar ingredientes
export function* fetchIngredientsSaga(action: PayloadAction<SearchParams>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    const response = yield call(ingredientsService.getCachedIngredients, {
      ...action.payload,
      category: action.payload.category || undefined,
    });

    yield put(fetchIngredientsSuccess(response));
  } catch (error) {
    console.error('fetchIngredientsSaga - erro:', error);
    yield put(
      fetchIngredientsFailure(
        error instanceof Error ? error.message : 'Erro ao carregar ingredientes',
      ),
    );

    yield put(
      addNotification({
        message: 'Erro ao carregar ingredientes.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para criar um novo ingrediente
export function* createIngredientSaga(action: PayloadAction<CreateIngredientParams>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Criar o ingrediente
    const response = yield call(ingredientsService.createIngredient, action.payload);
    
    yield put(createIngredientSuccess(response));

    // Aguarda 2 segundos para garantir que o servidor processou completamente
    yield delay(2000);

    // Limpa o cache antes de buscar novos dados
    clearCache('/v1/users/me/ingredient');

    try {
      // Tentar buscar o novo ingrediente especificamente para confirmar que está disponível
      yield call(ingredientsService.getIngredientById, response._id);
      
      // Se chegou aqui, o ingrediente está disponível, então recarrega a lista
      yield put(
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 1000,
        }),
      );
    } catch (retryError) {
      // Se falhou em buscar o novo ingrediente, espera mais um pouco e tenta recarregar a lista
      yield delay(1000);
      yield put(
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 1000,
        }),
      );
    }

    yield put(
      addNotification({
        message: 'Ingrediente criado com sucesso!',
        type: 'success',
        duration: 4000,
      }),
    );
  } catch (error) {
    yield put(
      createIngredientFailure(error instanceof Error ? error.message : 'Erro ao criar ingrediente'),
    );

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
  takeLatest(createIngredientRequest.type, createIngredientSaga),
];

export default ingredientsSagas;
