import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

// Importa reducers
import authReducer from '@store/slices/authSlice';
import uiReducer from '@store/slices/uiSlice';
import dashboardReducer from '@store/slices/dashboardSlice';

// Importa sagas
import authSagas from '@store/sagas/authSagas';
import uiSagas from '@store/sagas/uiSagas';

// Cria middleware do Saga
const sagaMiddleware = createSagaMiddleware();

// Combina todos os reducers
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  dashboard: dashboardReducer,
  // Adicione outros reducers aqui
});

// Configuração do store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, // Habilitando thunk para poder usar createAsyncThunk
      serializableCheck: {
        // Ignorar ações ou caminhos específicos que não são serializáveis
        ignoredActions: ['YOUR_ACTION_TYPE'],
        ignoredPaths: ['some.path'],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Função raiz do Saga que combina todas as sagas
function* rootSaga() {
  yield all([
    ...authSagas,
    ...uiSagas,
    // Adicione outras sagas aqui
  ]);
}

// Inicia o Saga
sagaMiddleware.run(rootSaga);

// Exporta os tipos do state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
