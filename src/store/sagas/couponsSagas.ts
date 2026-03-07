import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import {
  fetchCouponsRequest,
  fetchCouponsSuccess,
  fetchCouponsFailure,
  createCouponRequest,
  createCouponSuccess,
  createCouponFailure,
  updateCouponRequest,
  updateCouponSuccess,
  updateCouponFailure,
  deleteCouponRequest,
  deleteCouponSuccess,
  deleteCouponFailure,
  fetchCouponByIdRequest,
  fetchCouponByIdSuccess,
  fetchCouponByIdFailure,
} from '../slices/couponsSlice';
import { setGlobalLoading, addNotification } from '../slices/uiSlice';
import * as couponsService from '../../services/api/coupons';
import { CouponSearchParams, CreateCouponParams, UpdateCouponParams } from '../../types/coupons';

// Saga para buscar cupons
export function* fetchCouponsSaga(action: PayloadAction<CouponSearchParams>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    const response = yield call(couponsService.getCoupons, action.payload);
    yield put(fetchCouponsSuccess(response));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Erro ao carregar cupons';

    yield put(fetchCouponsFailure(errorMessage));
    yield put(
      addNotification({
        message: 'Erro ao carregar cupons.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para criar um novo cupom
export function* createCouponSaga(action: PayloadAction<CreateCouponParams>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    const response = yield call(couponsService.createCoupon, action.payload);
    yield put(createCouponSuccess(response));

    yield put(
      addNotification({
        message: 'Cupom criado com sucesso!',
        type: 'success',
        duration: 4000,
      }),
    );

    // Recarrega a lista para garantir sincronização
    const reloadParams: CouponSearchParams = {
      page: 1,
      itemPerPage: 10,
    };
    const reloadResponse = yield call(couponsService.getCoupons, reloadParams);
    yield put(fetchCouponsSuccess(reloadResponse));
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar cupom';

    yield put(createCouponFailure(errorMessage));
    yield put(
      addNotification({
        message: 'Erro ao criar cupom.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para atualizar cupom
export function* updateCouponSaga(
  action: PayloadAction<{ id: string; params: UpdateCouponParams }>,
): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    const response = yield call(
      couponsService.updateCoupon,
      action.payload.id,
      action.payload.params,
    );
    yield put(updateCouponSuccess(response));

    yield put(
      addNotification({
        message: 'Cupom atualizado com sucesso!',
        type: 'success',
        duration: 4000,
      }),
    );

    // Recarrega a lista para garantir sincronização
    const reloadParams: CouponSearchParams = {
      page: 1,
      itemPerPage: 10,
    };
    const reloadResponse = yield call(couponsService.getCoupons, reloadParams);
    yield put(fetchCouponsSuccess(reloadResponse));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Erro ao atualizar cupom';

    yield put(updateCouponFailure(errorMessage));
    yield put(
      addNotification({
        message: 'Erro ao atualizar cupom.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para deletar cupom
export function* deleteCouponSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    yield call(couponsService.deleteCoupon, action.payload);
    yield put(deleteCouponSuccess(action.payload));

    yield put(
      addNotification({
        message: 'Cupom excluído com sucesso.',
        type: 'success',
        duration: 3000,
      }),
    );

    // Recarrega a lista para garantir sincronização
    const reloadParams: CouponSearchParams = {
      page: 1,
      itemPerPage: 10,
    };
    const reloadResponse = yield call(couponsService.getCoupons, reloadParams);
    yield put(fetchCouponsSuccess(reloadResponse));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Erro ao deletar cupom';

    yield put(deleteCouponFailure(errorMessage));
    yield put(
      addNotification({
        message: 'Erro ao deletar cupom.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Saga para buscar cupom por ID
export function* fetchCouponByIdSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield put(setGlobalLoading(true));

    const response = yield call(couponsService.getCouponById, action.payload);
    yield put(fetchCouponByIdSuccess(response));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Erro ao carregar cupom';

    yield put(fetchCouponByIdFailure(errorMessage));
    yield put(
      addNotification({
        message: 'Erro ao carregar detalhes do cupom.',
        type: 'error',
        duration: 5000,
      }),
    );
  } finally {
    yield put(setGlobalLoading(false));
  }
}

// Sagas de cupons
const couponsSagas = [
  takeLatest(fetchCouponsRequest.type, fetchCouponsSaga),
  takeLatest(createCouponRequest.type, createCouponSaga),
  takeLatest(updateCouponRequest.type, updateCouponSaga),
  takeLatest(deleteCouponRequest.type, deleteCouponSaga),
  takeLatest(fetchCouponByIdRequest.type, fetchCouponByIdSaga),
];

export default couponsSagas;
