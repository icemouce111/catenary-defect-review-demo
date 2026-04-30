import { describe, expect, it } from 'vitest';
import { put } from 'redux-saga/effects';
import { defectReviewOptimistic, defectReviewRollback } from '../defects/slice';
import { reviewFailed, reviewSubmitted } from './slice';
import { reviewDefectSaga } from './sagas';

describe('review saga', () => {
  it('applies an optimistic review before mutation and rolls it back on failure', () => {
    const payload = { id: 'DEF-001', action: '已确认' as const, comment: '可见裂损' };
    const generator = reviewDefectSaga(reviewSubmitted(payload));

    expect(generator.next().value).toEqual(put(defectReviewOptimistic(payload)));
    generator.next();

    expect(generator.throw!(new Error('network offline')).value).toEqual(
      put(defectReviewRollback({ id: 'DEF-001' })),
    );
    expect(generator.next().value).toEqual(
      put(reviewFailed({ id: 'DEF-001', error: 'network offline' })),
    );
    expect(generator.next().done).toBe(true);
  });
});
