import type { ReviewLog, ReviewStatus, RiskLevel } from '@4c-console/shared';

export type GraphQLRiskLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
export type GraphQLReviewStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'FALSE_POSITIVE'
  | 'RECHECK'
  | 'DISPATCHED';

const riskToGraphQL = {
  一级: 'LEVEL_1',
  二级: 'LEVEL_2',
  三级: 'LEVEL_3',
} satisfies Record<RiskLevel, GraphQLRiskLevel>;

const riskFromGraphQL = {
  LEVEL_1: '一级',
  LEVEL_2: '二级',
  LEVEL_3: '三级',
} satisfies Record<GraphQLRiskLevel, RiskLevel>;

const statusToGraphQL = {
  待复核: 'PENDING',
  已确认: 'CONFIRMED',
  误检: 'FALSE_POSITIVE',
  待复查: 'RECHECK',
  已派单: 'DISPATCHED',
} satisfies Record<ReviewStatus, GraphQLReviewStatus>;

const statusFromGraphQL = {
  PENDING: '待复核',
  CONFIRMED: '已确认',
  FALSE_POSITIVE: '误检',
  RECHECK: '待复查',
  DISPATCHED: '已派单',
} satisfies Record<GraphQLReviewStatus, ReviewStatus>;

export const toGraphQLRisk = (riskLevel?: RiskLevel) =>
  riskLevel ? riskToGraphQL[riskLevel] : undefined;

export const fromGraphQLRisk = (riskLevel: GraphQLRiskLevel) => riskFromGraphQL[riskLevel];

export const toGraphQLStatus = (status?: ReviewStatus) =>
  status ? statusToGraphQL[status] : undefined;

export const fromGraphQLStatus = (status: GraphQLReviewStatus) => statusFromGraphQL[status];

export const isGraphQLStatus = (value: string): value is GraphQLReviewStatus =>
  value in statusFromGraphQL;

export const normalizeReviewLogAction = (action: string): ReviewLog['action'] =>
  isGraphQLStatus(action) ? fromGraphQLStatus(action) : (action as ReviewLog['action']);
