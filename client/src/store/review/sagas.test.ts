import { describe, expect, it } from 'vitest';
import { put } from 'redux-saga/effects';
import { defectsSlice } from '../defects/slice';
import { reviewSlice } from './slice';
import { reviewDefectSaga } from './sagas';

describe('review saga', () => {
  it('applies an optimistic review before mutation and rolls it back on failure', () => {
    const payload = { id: 'DEF-001', action: '已确认' as const, comment: '可见裂损' };
    const generator = reviewDefectSaga(reviewSlice.actions.submitReviewRequested(payload));

    expect(generator.next().value).toMatchObject({
      type: 'SELECT',
      payload: { args: ['DEF-001'] },
    });
    expect(generator.next('待复核').value).toEqual(
      put(defectsSlice.actions.updateDefectStatusOptimistic({ id: 'DEF-001', status: '已确认' })),
    );
    generator.next();

    expect(generator.throw!(new Error('network offline')).value).toEqual(
      put(defectsSlice.actions.rollbackDefectStatus({ id: 'DEF-001', previousStatus: '待复核' })),
    );
    expect(generator.next().value).toEqual(
      put(reviewSlice.actions.submitReviewFailed({ id: 'DEF-001', error: 'network offline' })),
    );
    expect(generator.next().done).toBe(true);
  });
});
