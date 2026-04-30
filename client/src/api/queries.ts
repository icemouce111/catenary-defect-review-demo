import { gql } from '@apollo/client';
import type { BBox, DashboardStats, Defect, ReviewLog } from '@4c-console/shared';
import {
  type GraphQLReviewStatus,
  type GraphQLRiskLevel,
  fromGraphQLRisk,
  fromGraphQLStatus,
  normalizeReviewLogAction,
} from './graphqlEnums';

interface GraphQLReviewLog extends Omit<ReviewLog, 'action'> {
  action: string;
}

export interface GraphQLDefect extends Omit<Defect, 'riskLevel' | 'status' | 'reviewLogs'> {
  riskLevel: GraphQLRiskLevel;
  status: GraphQLReviewStatus;
  bbox: BBox;
  reviewLogs: GraphQLReviewLog[];
}

export interface GraphQLRiskCount {
  level: GraphQLRiskLevel;
  count: number;
}

export interface GraphQLDashboardStats
  extends Omit<DashboardStats, 'riskDistribution'> {
  riskDistribution: GraphQLRiskCount[];
}

export const DEFECT_FIELDS = gql`
  fragment DefectFields on Defect {
    id
    line
    section
    poleNumber
    component
    defectType
    confidence
    riskLevel
    status
    detectedAt
    imageUrl
    bbox {
      x
      y
      w
      h
    }
    reviewLogs {
      id
      defectId
      reviewer
      action
      comment
      timestamp
    }
  }
`;

export const DEFECTS_QUERY = gql`
  ${DEFECT_FIELDS}
  query Defects($riskLevel: RiskLevel, $status: ReviewStatus) {
    defects(riskLevel: $riskLevel, status: $status) {
      ...DefectFields
    }
  }
`;

export const DEFECT_QUERY = gql`
  ${DEFECT_FIELDS}
  query Defect($id: ID!) {
    defect(id: $id) {
      ...DefectFields
    }
  }
`;

export const REVIEW_DEFECT_MUTATION = gql`
  ${DEFECT_FIELDS}
  mutation ReviewDefect($id: ID!, $action: ReviewStatus!, $comment: String) {
    reviewDefect(id: $id, action: $action, comment: $comment) {
      ...DefectFields
    }
  }
`;

export const DISPATCH_DEFECT_MUTATION = gql`
  ${DEFECT_FIELDS}
  mutation DispatchDefect($id: ID!) {
    dispatchDefect(id: $id) {
      ...DefectFields
    }
  }
`;

export const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalDetected
      pendingReview
      confirmed
      falsePositive
      falsePositiveRate
      riskDistribution {
        level
        count
      }
    }
  }
`;

export const normalizeDefect = (defect: GraphQLDefect): Defect => ({
  ...defect,
  riskLevel: fromGraphQLRisk(defect.riskLevel),
  status: fromGraphQLStatus(defect.status),
  reviewLogs: defect.reviewLogs.map((log) => ({
    ...log,
    action: normalizeReviewLogAction(log.action),
  })),
});

export const normalizeDashboardStats = (stats: GraphQLDashboardStats): DashboardStats => ({
  ...stats,
  riskDistribution: stats.riskDistribution.map((item) => ({
    level: fromGraphQLRisk(item.level),
    count: item.count,
  })),
});
