import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchCategoryByIdRequest,
  fetchCategoryByIdSuccess,
  fetchCategoryByIdFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
} from '../slices/categoriesSlice';
import { setGlobalLoading, addNotification } from '../slices/uiSlice';
import * as categoriesService from '../../services/api/categories';
import { SearchParams, CreateCategoryParams } from '../../types/ingredients';

// Saga para buscar categorias
function* fetchCategoriesSaga(action: PayloadAction<Omit<SearchParams, 'category'>>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API
    const response = yield call(categoriesService.getCategories, action.payload);

    // Despacha a ação de sucesso
    yield put(fetchCategoriesSuccess(response));
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      fetchCategoriesFailure(error instanceof Error ? error.message : 'Erro ao carregar categorias')
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao carregar categorias.',
        type: 'error',
        duration: 5000,
      })
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para buscar categoria por ID
function* fetchCategoryByIdSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API
    const response = yield call(categoriesService.getCategoryById, action.payload);

    // Despacha a ação de sucesso
    yield put(fetchCategoryByIdSuccess(response));
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      fetchCategoryByIdFailure(error instanceof Error ? error.message : 'Erro ao carregar categoria')
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao carregar detalhes da categoria.',
        type: 'error',
        duration: 5000,
      })
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para criar categoria
function* createCategorySaga(action: PayloadAction<CreateCategoryParams>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    // Chama o serviço de API
    const response = yield call(categoriesService.createCategory, action.payload);

    // Despacha a ação de sucesso
    yield put(createCategorySuccess(response));

    // Notificação de sucesso
    yield put(
      addNotification({
        message: 'Categoria criada com sucesso!',
        type: 'success',
        duration: 4000,
      })
    );
  } catch (error) {
    // Despacha a ação de falha
    yield put(
      createCategoryFailure(error instanceof Error ? error.message : 'Erro ao criar categoria')
    );

    // Notificação de erro
    yield put(
      addNotification({
        message: 'Erro ao criar categoria.',
        type: 'error',
        duration: 5000,
      })
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Sagas de categorias
const categoriesSagas = [
  takeLatest(fetchCategoriesRequest.type, fetchCategoriesSaga),
  takeLatest(fetchCategoryByIdRequest.type, fetchCategoryByIdSaga),
  takeLatest(createCategoryRequest.type, createCategorySaga),
];

export default categoriesSagas; 