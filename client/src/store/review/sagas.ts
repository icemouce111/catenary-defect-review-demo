import { call, put, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { apolloClient } from '../../api/apolloClient';
import { toGraphQLStatus } from '../../api/graphqlEnums';
import {
  REVIEW_DEFECT_MUTATION,
  type GraphQLDefect,
  normalizeDefect,
} from '../../api/queries';
import {
  defectReviewCommitted,
  defectReviewOptimistic,
  defectReviewRollback,
} from '../defects/slice';
import { reviewFailed, reviewSubmitted, reviewSucceeded } from './slice';
import type { ReviewSubmitPayload } from './slice';

interface ReviewMutationResult {
  reviewDefect: GraphQLDefect;
}

export function* reviewDefectSaga(action: ReturnType<typeof reviewSubmitted>): SagaIterator {
  const payload: ReviewSubmitPayload = action.payload;
  try {
    yield put(defectReviewOptimistic(payload));

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

    yield put(defectReviewCommitted(normalizeDefect(updated)));
    yield put(reviewSucceeded({ id: payload.id }));
  } catch (error) {
    yield put(defectReviewRollback({ id: payload.id }));
    yield put(
      reviewFailed({
        id: payload.id,
        error: error instanceof Error ? error.message : '复核提交失败',
      }),
    );
  }
}

export function* reviewSaga(): SagaIterator {
  yield takeEvery(reviewSubmitted.type, reviewDefectSaga);
}
