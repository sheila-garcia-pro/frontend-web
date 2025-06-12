import { call, put, takeLatest, select, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import {
  fetchIngredientsRequest,
  fetchIngredientsSuccess,
  fetchIngredientsFailure,
  createIngredientRequest,
  createIngredientSuccess,
  createIngredientFailure,
  updateIngredientRequest,
  updateIngredientSuccess,
  updateIngredientFailure,
  deleteIngredientRequest,
  deleteIngredientSuccess,
  deleteIngredientFailure,
  updatePriceMeasureRequest,
  updatePriceMeasureSuccess,
  updatePriceMeasureFailure,
} from '../slices/ingredientsSlice';
import { setGlobalLoading, addNotification } from '../slices/uiSlice';
import * as ingredientsService from '../../services/api/ingredients';
import { clearCache } from '../../services/api';
import { SearchParams, CreateIngredientParams } from '../../types/ingredients';

// Função auxiliar para recarregar a lista de ingredientes
function* reloadIngredientsList(showLoading = true): SagaIterator {
  try {
    if (showLoading) {
      yield put(setGlobalLoading(true));
    }

    const currentState = yield select((state) => state.ingredients);
    const searchParams: SearchParams = {
      page: 1,
      itemPerPage: 1000,
      category: currentState.filter.category || undefined,
      search: currentState.filter.search || undefined,
    };

    // Limpa o cache antes de fazer a nova requisição
    yield call(clearCache, '/v1/users/me/ingredient');
    const response = yield call(ingredientsService.getCachedIngredients, searchParams);
    yield put(fetchIngredientsSuccess(response));
  } catch (error) {
    console.error('reloadIngredientsList - erro:', error);
    yield put(
      addNotification({
        message: 'Erro ao atualizar a lista de ingredientes.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    if (showLoading) {
      yield put(setGlobalLoading(false));
    }
  }
}

// Saga para buscar ingredientes
export function* fetchIngredientsSaga(
  action: PayloadAction<SearchParams & { forceRefresh?: boolean }>,
): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    if (action.payload.forceRefresh) {
      try {
        yield call(clearCache, '/v1/users/me/ingredient');
      } catch (cacheError) {
        console.warn('Erro ao limpar cache:', cacheError);
        // Continua a execução mesmo se falhar ao limpar o cache
      }
    }

    const response = yield call(ingredientsService.getCachedIngredients, {
      ...action.payload,
      category: action.payload.category || undefined,
    });

    yield put(fetchIngredientsSuccess(response));

    if (action.payload.forceRefresh) {
      yield put(
        addNotification({
          message: 'Lista de ingredientes atualizada com sucesso!',
          type: 'success',
          duration: 2000,
        }),
      );
    }
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

    if (response) {
      yield put(createIngredientSuccess(response));

      // Recarrega a lista de ingredientes
      yield call(reloadIngredientsList);

      yield put(
        addNotification({
          message: 'Ingrediente criado com sucesso!',
          type: 'success',
          duration: 4000,
        }),
      );
    }
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

// Saga para atualizar ingrediente
export function* updateIngredientSaga(
  action: PayloadAction<{ id: string; params: Partial<CreateIngredientParams> }>,
): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    const response = yield call(
      ingredientsService.updateIngredient,
      action.payload.id,
      action.payload.params,
    );
    yield put(updateIngredientSuccess(response)); // Mostra notificação de sucesso imediatamente
    yield put(
      addNotification({
        message: 'Ingrediente atualizado com sucesso!',
        type: 'success',
        duration: 4000,
      }),
    );

    // Aguarda 1 segundo antes de recarregar a lista (tempo suficiente para o servidor processar)
    yield delay(1000);

    // Recarrega a lista de ingredientes sem mostrar loading global
    yield call(reloadIngredientsList, false);
  } catch (error) {
    console.error('updateIngredientSaga - erro:', error);
    yield put(
      updateIngredientFailure(
        error instanceof Error ? error.message : 'Erro ao atualizar ingrediente',
      ),
    );

    yield put(
      addNotification({
        message: 'Erro ao atualizar ingrediente.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para deletar ingrediente
export function* deleteIngredientSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));
    yield call(ingredientsService.deleteIngredient, action.payload);
    yield put(deleteIngredientSuccess(action.payload));

    // Mostra notificação de sucesso imediatamente
    yield put(
      addNotification({
        message: 'Ingrediente excluído com sucesso.',
        type: 'success',
        duration: 3000,
      }),
    );

    // Aguarda 1 segundo antes de recarregar a lista
    yield delay(1000);

    // Recarrega a lista de ingredientes sem mostrar loading global
    yield call(reloadIngredientsList, false);
  } catch (error) {
    console.error('deleteIngredientSaga - erro:', error);
    yield put(
      deleteIngredientFailure(
        error instanceof Error ? error.message : 'Erro ao deletar ingrediente',
      ),
    );

    yield put(
      addNotification({
        message: 'Erro ao deletar ingrediente.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para atualizar preço e medida
export function* updatePriceMeasureSaga(
  action: PayloadAction<{
    id: string;
    params: { price: number; quantity: number; unitMeasure: string };
  }>,
): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    const response = yield call(
      ingredientsService.updateIngredientPriceMeasure,
      action.payload.id,
      action.payload.params,
    );
    yield put(updatePriceMeasureSuccess(response));

    // Mostra notificação de sucesso imediatamente
    yield put(
      addNotification({
        message: 'Preço do ingrediente atualizado com sucesso!',
        type: 'success',
        duration: 4000,
      }),
    );

    // Aguarda 1 segundo antes de recarregar a lista
    yield delay(1000);

    // Recarrega a lista de ingredientes sem mostrar loading global
    yield call(reloadIngredientsList, false);
  } catch (error) {
    console.error('updatePriceMeasureSaga - erro:', error);
    yield put(
      updatePriceMeasureFailure(
        error instanceof Error ? error.message : 'Erro ao atualizar preço do ingrediente',
      ),
    );

    yield put(
      addNotification({
        message: 'Erro ao atualizar preço do ingrediente.',
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
  takeLatest(updateIngredientRequest.type, updateIngredientSaga),
  takeLatest(deleteIngredientRequest.type, deleteIngredientSaga),
  takeLatest(updatePriceMeasureRequest.type, updatePriceMeasureSaga),
];

export default ingredientsSagas;
