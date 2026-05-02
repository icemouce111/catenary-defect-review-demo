import { call, cancel, cancelled, fork, join, put, race, take } from 'redux-saga/effects';
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
    const result: { stopped?: true; ended?: true } = yield race({
      stopped: take(streamSlice.actions.stop.type),
      ended: join(task),
    });

    channel.close();

    if (result.stopped) {
      yield cancel(task);
      yield put(streamSlice.actions.disconnected());
      continue;
    }

    yield put(streamSlice.actions.failed('检测流连接已断开，请检查后端 /api/stream'));
  }
}
