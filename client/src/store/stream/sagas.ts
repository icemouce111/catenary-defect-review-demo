import { call, cancel, cancelled, fork, put, take } from 'redux-saga/effects';
import type { EventChannel, SagaIterator, Task } from 'redux-saga';
import { createDefectStreamChannel, type DefectStreamEvent } from '../../api/sseChannel';
import { defectStreamReceived } from '../defects/slice';
import {
  streamDefectReceived,
  streamFailed,
  streamReady,
  streamStarted,
  streamStopped,
} from './slice';

function* handleStreamMessages(channel: EventChannel<DefectStreamEvent>): SagaIterator {
  try {
    while (true) {
      const message: DefectStreamEvent = yield take(channel);
      if (message.type === 'ready') {
        yield put(streamReady({ connectedAt: new Date().toISOString() }));
      }
      if (message.type === 'defect') {
        yield put(defectStreamReceived(message.defect));
        yield put(streamDefectReceived());
      }
      if (message.type === 'error') {
        yield put(streamFailed(message.error));
      }
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}

export function* streamDefectsSaga(): SagaIterator {
  while (true) {
    yield take(streamStarted.type);
    const channel: EventChannel<DefectStreamEvent> = yield call(createDefectStreamChannel);
    const task: Task = yield fork(handleStreamMessages, channel);
    yield take(streamStopped.type);
    yield cancel(task);
    channel.close();
  }
}
