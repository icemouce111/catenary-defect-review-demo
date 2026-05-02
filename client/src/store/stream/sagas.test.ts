import { describe, expect, it, vi } from 'vitest';
import { call, cancel, fork, put, take } from 'redux-saga/effects';
import type { EventChannel, Task } from 'redux-saga';
import type { Defect } from '@4c-console/shared';
import { createSSEChannel } from '../../api/sseChannel';
import { defectsSlice } from '../defects/slice';
import { streamSlice } from './slice';
import { handleStreamMessages, streamDefectsSaga } from './sagas';

const makeDefect = (id: string): Defect => ({
  id,
  line: '沪昆线',
  section: 'K124+300',
  poleNumber: '23#杆',
  component: '定位器线夹',
  defectType: '松脱/偏移',
  confidence: 92.6,
  riskLevel: '一级',
  status: '待复核',
  detectedAt: '2026-04-18T02:23:00.000Z',
  imageUrl: '/images/sample-1.svg',
  bbox: { x: 0.49, y: 0.27, w: 0.16, h: 0.32 },
  reviewLogs: [],
});

describe('stream sagas', () => {
  it('opens /api/stream, forks channel handling, then cancels and closes on stop', () => {
    const channel = { close: vi.fn(), take: vi.fn() } as unknown as EventChannel<Defect>;
    const task = { '@@redux-saga/TASK': true } as unknown as Task;
    const generator = streamDefectsSaga();

    expect(generator.next().value).toEqual(take(streamSlice.actions.start.type));
    expect(generator.next().value).toEqual(call(createSSEChannel, '/api/stream'));
    expect(generator.next(channel).value).toEqual(put(streamSlice.actions.connected()));
    expect(generator.next().value).toEqual(fork(handleStreamMessages, channel));
    expect(generator.next(task).value).toEqual(take(streamSlice.actions.stop.type));
    expect(generator.next().value).toEqual(cancel(task));
    expect(generator.next().value).toEqual(put(streamSlice.actions.disconnected()));
    expect(channel.close).toHaveBeenCalledTimes(1);
  });

  it('prepends new defects and increments stream count for every channel message', () => {
    const channel = { close: vi.fn(), take: vi.fn() } as unknown as EventChannel<Defect>;
    const defect = makeDefect('DEF-002');
    const generator = handleStreamMessages(channel);

    expect(generator.next().value).toEqual(take(channel));
    expect(generator.next(defect).value).toEqual(put(defectsSlice.actions.prependDefect(defect)));
    expect(generator.next().value).toEqual(put(streamSlice.actions.increment()));
  });
});
