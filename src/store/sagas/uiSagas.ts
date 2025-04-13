import { takeLatest, put, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { addNotification, removeNotification, setGlobalLoading } from '@store/slices/uiSlice';

// Generator para auto-remover notificações após um tempo
function* handleAddNotificationSaga(action: PayloadAction<any>) {
  const { id } = action.payload;
  // Espera por 5 segundos (ou o tempo definido na notificação)
  const timeout = action.payload.timeout || 5000;
  yield delay(timeout);
  // Remove a notificação
  yield put(removeNotification(id));
}

// Generator para operações que precisam de loading global
function* handleShowLoaderWithTimeoutSaga(action: PayloadAction<number | undefined>) {
  try {
    const timeout = action.payload || 30000; // Default 30s timeout
    // Aguarda o timeout
    yield delay(timeout);
    // Esconde o loader se ainda estiver ativo após o timeout
    yield put(setGlobalLoading(false));
  } catch (error) {
    // Em caso de erro, garante que o loader seja escondido
    yield put(setGlobalLoading(false));
  }
}

// Array de sagas para exportação
const uiSagas = [
  takeLatest(addNotification.type, handleAddNotificationSaga),
  takeLatest(setGlobalLoading.type, handleShowLoaderWithTimeoutSaga),
];

export default uiSagas;
