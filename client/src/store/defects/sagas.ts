import { call, put, select, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { apolloClient } from '../../api/apolloClient';
import {
  DEFECT_QUERY,
  DEFECTS_QUERY,
  type GraphQLDefect,
  normalizeDefect,
} from '../../api/queries';
import { toGraphQLRisk, toGraphQLStatus } from '../../api/graphqlEnums';
import { defectsSlice } from './slice';
import type { RootState } from '..';

interface DefectsQueryResult {
  defects: GraphQLDefect[];
}

interface DefectQueryResult {
  defect: GraphQLDefect | null;
}

const selectDefectFilter = (state: RootState) => state.defects.filter;

export function* fetchDefectsSaga(action?: { type: string }): SagaIterator {
  try {
    const filter: ReturnType<typeof selectDefectFilter> = yield select(selectDefectFilter);
    const response: { data?: DefectsQueryResult } = yield call([apolloClient, apolloClient.query], {
      query: DEFECTS_QUERY,
      variables: {
        riskLevel: toGraphQLRisk(filter.riskLevel),
        status: toGraphQLStatus(filter.status),
      },
      fetchPolicy: 'network-only',
    });

    yield put(defectsSlice.actions.fetchSucceeded((response.data?.defects ?? []).map(normalizeDefect)));
  } catch (error) {
    yield put(
      defectsSlice.actions.fetchFailed(error instanceof Error ? error.message : '缺陷列表加载失败'),
    );
  }
}

export function* fetchDefectById(id: string): SagaIterator {
  const response: { data?: DefectQueryResult } = yield call([apolloClient, apolloClient.query], {
    query: DEFECT_QUERY,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  return response.data?.defect ? normalizeDefect(response.data.defect) : null;
}

export function* defectsSaga(): SagaIterator {
  yield takeLatest(defectsSlice.actions.fetchRequested.type, fetchDefectsSaga);
  yield takeLatest(defectsSlice.actions.setFilter.type, fetchDefectsSaga);
}
