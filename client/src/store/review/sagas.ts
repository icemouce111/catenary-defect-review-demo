import { call, put, select, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { ReviewStatus } from '@4c-console/shared';
import { apolloClient } from '../../api/apolloClient';
import { toGraphQLStatus } from '../../api/graphqlEnums';
import {
  REVIEW_DEFECT_MUTATION,
  type GraphQLDefect,
  normalizeDefect,
} from '../../api/queries';
import { defectsSlice } from '../defects/slice';
import { reviewSlice } from './slice';
import type { ReviewSubmitPayload } from './slice';
import type { RootState } from '..';

interface ReviewMutationResult {
  reviewDefect: GraphQLDefect;
}

const selectDefectStatus = (state: RootState, id: string) =>
  state.defects.list.find((defect) => defect.id === id)?.status;

export function* reviewDefectSaga(
  action: ReturnType<typeof reviewSlice.actions.submitReviewRequested>,
): SagaIterator {
  const payload: ReviewSubmitPayload = action.payload;
  let previousStatus: ReviewStatus | undefined;

  try {
    previousStatus = yield select(selectDefectStatus, payload.id);
    if (!previousStatus) {
      throw new Error('未找到当前缺陷，无法提交复核');
    }

    yield put(
      defectsSlice.actions.updateDefectStatusOptimistic({
        id: payload.id,
        status: payload.action,
      }),
    );

    const response: { data?: ReviewMutationResult } = yield call([apolloClient, apolloClient.mutate], {
      mutation: REVIEW_DEFECT_MUTATION,
      variables: {
        id: payload.id,
        action: toGraphQLStatus(payload.action),
        comment: payload.comment,
      },
    });

    const updated = response.data?.reviewDefect;
    if (!updated) {
      throw new Error('复核接口没有返回更新后的缺陷');
    }

    yield put(defectsSlice.actions.upsertDefect(normalizeDefect(updated)));
    yield put(reviewSlice.actions.submitReviewSucceeded({ id: payload.id }));
  } catch (error) {
    if (previousStatus) {
      yield put(
        defectsSlice.actions.rollbackDefectStatus({
          id: payload.id,
          previousStatus,
        }),
      );
    }
    yield put(
      reviewSlice.actions.submitReviewFailed({
        id: payload.id,
        error: error instanceof Error ? error.message : '复核提交失败',
      }),
    );
  }
}

export function* reviewSaga(): SagaIterator {
  yield takeEvery(reviewSlice.actions.submitReviewRequested.type, reviewDefectSaga);
}
