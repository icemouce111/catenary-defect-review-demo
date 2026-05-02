import { describe, expect, it } from 'vitest';
import type { Defect } from '@4c-console/shared';
import reducer, { defectsSlice } from './slice';

const makeDefect = (id: string, status: Defect['status'] = '待复核'): Defect => ({
  id,
  line: '沪昆线',
  section: 'K124+300',
  poleNumber: '23#杆',
  component: '定位器线夹',
  defectType: '松脱/偏移',
  confidence: 92.6,
  riskLevel: '一级',
  status,
  detectedAt: '2026-04-18T02:23:00.000Z',
  imageUrl: '/images/sample-1.svg',
  bbox: { x: 0.49, y: 0.27, w: 0.16, h: 0.32 },
  reviewLogs: [],
});

describe('defects slice', () => {
  it('prepends streamed defects, marks the newest id, and avoids duplicates', () => {
    const initial = reducer(undefined, defectsSlice.actions.fetchSucceeded([makeDefect('DEF-001')]));

    const withNew = reducer(initial, defectsSlice.actions.prependDefect(makeDefect('DEF-002')));
    expect(withNew.list.map((defect) => defect.id)).toEqual(['DEF-002', 'DEF-001']);
    expect(withNew.highlightedId).toBe('DEF-002');

    const withDuplicate = reducer(withNew, defectsSlice.actions.prependDefect(makeDefect('DEF-002')));
    expect(withDuplicate.list.map((defect) => defect.id)).toEqual(['DEF-002', 'DEF-001']);
  });

  it('keeps list data while updating filters', () => {
    const initial = reducer(undefined, defectsSlice.actions.fetchSucceeded([makeDefect('DEF-001')]));
    const next = reducer(initial, defectsSlice.actions.setFilter({ riskLevel: '一级' }));

    expect(next.filter).toEqual({ riskLevel: '一级' });
    expect(next.list).toHaveLength(1);
    expect(next.status).toBe('loading');
  });

  it('rolls back an optimistic review to the prior status', () => {
    const initial = reducer(undefined, defectsSlice.actions.fetchSucceeded([makeDefect('DEF-001')]));
    const optimistic = reducer(
      initial,
      defectsSlice.actions.updateDefectStatusOptimistic({ id: 'DEF-001', status: '已确认' }),
    );

    expect(optimistic.list[0]?.status).toBe('已确认');

    const rolledBack = reducer(
      optimistic,
      defectsSlice.actions.rollbackDefectStatus({ id: 'DEF-001', previousStatus: '待复核' }),
    );
    expect(rolledBack.list[0]?.status).toBe('待复核');
  });

  it('replaces optimistic data with committed server data', () => {
    const initial = reducer(undefined, defectsSlice.actions.fetchSucceeded([makeDefect('DEF-001')]));
    const optimistic = reducer(
      initial,
      defectsSlice.actions.updateDefectStatusOptimistic({ id: 'DEF-001', status: '已确认' }),
    );
    const committedDefect = makeDefect('DEF-001', '已确认');
    committedDefect.reviewLogs = [
      {
        id: 'LOG-1',
        defectId: 'DEF-001',
        reviewer: '复核员 张工',
        action: '已确认',
        comment: '可见裂损',
        timestamp: '2026-04-30T02:00:00.000Z',
      },
    ];

    const committed = reducer(optimistic, defectsSlice.actions.upsertDefect(committedDefect));
    expect(committed.list[0]?.reviewLogs).toHaveLength(1);
    expect(committed.list[0]?.status).toBe('已确认');
  });
});
