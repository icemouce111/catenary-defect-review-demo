import { all, fork } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { defectsSaga } from './defects/sagas';
import { reviewSaga } from './review/sagas';
import { streamDefectsSaga } from './stream/sagas';

export function* rootSaga(): SagaIterator {
  yield all([fork(defectsSaga), fork(reviewSaga), fork(streamDefectsSaga)]);
}
