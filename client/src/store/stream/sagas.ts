import { call, cancel, cancelled, fork, put, take } from 'redux-saga/effects';
import type { EventChannel, SagaIterator, Task } from 'redux-saga';
import type { Defect } from '@4c-console/shared';
import { createSSEChannel } from '../../api/sseChannel';
import { defectsSlice } from '../defects/slice';
import { streamSlice } from './slice';

export function* handleStreamMessages(channel: EventChannel<Defect>): SagaIterator {
  try {
    while (true) {
      const newDefect: Defect = yield take(channel);
      yield put(defectsSlice.actions.prependDefect(newDefect));
      yield put(streamSlice.actions.increment());
    }
  } finally {
    if (yield cancelled()) {
      // cleanup handled by parent channel.close()
    }
  }
}

export function* streamDefectsSaga(): SagaIterator {
  while (true) {
    yield take(streamSlice.actions.start.type);
    const channel: EventChannel<Defect> = yield call(createSSEChannel, '/api/stream');
    yield put(streamSlice.actions.connected());

    const task: Task = yield fork(handleStreamMessages, channel);

    yield take(streamSlice.actions.stop.type);
    yield cancel(task);
    channel.close();
    yield put(streamSlice.actions.disconnected());
  }
}
