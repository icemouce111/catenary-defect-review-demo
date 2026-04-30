import { describe, expect, it } from 'vitest';
import type { Defect, ReviewLog } from '@4c-console/shared';
import {
  createMemoryDefectRepo,
  getDashboardStatsFromDefects,
} from './defectRepo.js';

const logs: ReviewLog[] = [
  {
    id: 'log-1',
    defectId: 'defect-1',
    reviewer: '复核员 张工',
    action: '待复核',
    timestamp: '2026-04-18T02:23:00.000Z',
  },
];

const defects: Defect[] = [
  {
    id: 'defect-1',
    line: '沪昆线',
    section: 'K124+300',
    poleNumber: '23#杆',
    component: '定位器线夹',
    defectType: '松脱/偏移',
    confidence: 92.6,
    riskLevel: '一级',
    status: '待复核',
    detectedAt: '2026-04-18T02:23:00.000Z',
    imageUrl: '/images/sample-1.svg',
    bbox: { x: 0.5, y: 0.31, w: 0.16, h: 0.27 },
    reviewLogs: logs,
  },
  {
    id: 'defect-2',
    line: '青藏线',
    section: 'K88+110',
    poleNumber: '08#杆',
    component: '吊弦线夹',
    defectType: '裂纹/损伤',
    confidence: 81.4,
    riskLevel: '二级',
    status: '已确认',
    detectedAt: '2026-04-18T02:28:00.000Z',
    imageUrl: '/images/sample-1.svg',
    bbox: { x: 0.16, y: 0.45, w: 0.1, h: 0.18 },
    reviewLogs: [],
  },
  {
    id: 'defect-3',
    line: '昆明南联络线',
    section: 'K13+050',
    poleNumber: '16#杆',
    component: '绝缘子',
    defectType: '污闪/破损',
    confidence: 70.8,
    riskLevel: '三级',
    status: '误检',
    detectedAt: '2026-04-18T02:35:00.000Z',
    imageUrl: '/images/sample-2.svg',
    bbox: { x: 0.37, y: 0.62, w: 0.08, h: 0.13 },
    reviewLogs: [],
  },
];

describe('defect repository', () => {
  it('filters defects by risk level and keeps review logs on each item', async () => {
    const repo = createMemoryDefectRepo(defects, logs);

    const result = await repo.listDefects({ riskLevel: '一级' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('defect-1');
    expect(result[0].reviewLogs).toEqual(logs);
  });

  it('updates review status and appends a review log', async () => {
    const repo = createMemoryDefectRepo(defects, logs);

    const updated = await repo.reviewDefect('defect-1', '已确认', '现场复核确认缺陷');

    expect(updated.status).toBe('已确认');
    expect(updated.reviewLogs.at(-1)).toMatchObject({
      defectId: 'defect-1',
      reviewer: '复核员 张工',
      action: '已确认',
      comment: '现场复核确认缺陷',
    });
  });

  it('computes dashboard statistics from current defect state', () => {
    const stats = getDashboardStatsFromDefects(defects);

    expect(stats).toEqual({
      totalDetected: 3,
      pendingReview: 1,
      confirmed: 1,
      falsePositive: 1,
      falsePositiveRate: 1 / 3,
      riskDistribution: [
        { level: '一级', count: 1 },
        { level: '二级', count: 1 },
        { level: '三级', count: 1 },
      ],
    });
  });
});
