import { eventChannel } from 'redux-saga';
import type { EventChannel } from 'redux-saga';
import type { Defect } from '@4c-console/shared';

export type DefectStreamEvent =
  | { type: 'ready'; message: string }
  | { type: 'defect'; defect: Defect }
  | { type: 'error'; error: string };

export const createDefectStreamChannel = (url = '/api/stream'): EventChannel<DefectStreamEvent> =>
  eventChannel<DefectStreamEvent>((emit) => {
    const source = new EventSource(url);

    source.addEventListener('ready', (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as { message?: string };
      emit({ type: 'ready', message: payload.message ?? '检测车流已连接' });
    });

    source.addEventListener('defect', (event) => {
      const defect = JSON.parse((event as MessageEvent<string>).data) as Defect;
      emit({ type: 'defect', defect });
    });

    source.onerror = () => {
      emit({ type: 'error', error: '检测车流连接异常，浏览器会尝试自动重连' });
    };

    return () => source.close();
  });
