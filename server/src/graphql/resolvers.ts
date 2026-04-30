import type { ReviewStatus, RiskLevel } from '@4c-console/shared';
import type { DefectRepo } from '../repo/defectRepo.js';

export const riskEnum = {
  LEVEL_1: '一级',
  LEVEL_2: '二级',
  LEVEL_3: '三级',
} satisfies Record<string, RiskLevel>;

export const statusEnum = {
  PENDING: '待复核',
  CONFIRMED: '已确认',
  FALSE_POSITIVE: '误检',
  RECHECK: '待复查',
  DISPATCHED: '已派单',
} satisfies Record<string, ReviewStatus>;

export const createResolvers = (repo: DefectRepo) => ({
  RiskLevel: riskEnum,
  ReviewStatus: statusEnum,
  Query: {
    defects: (
      _parent: unknown,
      args: { riskLevel?: RiskLevel; status?: ReviewStatus },
    ) => repo.listDefects(args),
    defect: (_parent: unknown, args: { id: string }) => repo.getDefect(args.id),
    dashboardStats: () => repo.dashboardStats(),
  },
  Mutation: {
    reviewDefect: (
      _parent: unknown,
      args: { id: string; action: ReviewStatus; comment?: string },
    ) => repo.reviewDefect(args.id, args.action, args.comment),
    dispatchDefect: (_parent: unknown, args: { id: string }) => repo.dispatchDefect(args.id),
  },
});
