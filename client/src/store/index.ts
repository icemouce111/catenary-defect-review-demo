import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import defectsReducer from './defects/slice';
import reviewReducer from './review/slice';
import streamReducer from './stream/slice';
import { rootSaga } from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    defects: defectsReducer,
    review: reviewReducer,
    stream: streamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
