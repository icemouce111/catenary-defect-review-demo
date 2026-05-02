import { END, eventChannel } from 'redux-saga';
import type { EventChannel } from 'redux-saga';
import type { Defect } from '@4c-console/shared';

export const createSSEChannel = (url = '/api/stream'): EventChannel<Defect> =>
  eventChannel<Defect>((emit) => {
    const source = new EventSource(url);

    source.addEventListener('defect', (event) => {
      const defect = JSON.parse((event as MessageEvent<string>).data) as Defect;
      emit(defect);
    });

    source.onerror = () => {
      emit(END);
    };

    return () => source.close();
  });
