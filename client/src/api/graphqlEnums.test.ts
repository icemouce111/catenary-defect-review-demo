import { describe, expect, it } from 'vitest';
import {
  fromGraphQLRisk,
  fromGraphQLStatus,
  toGraphQLRisk,
  toGraphQLStatus,
} from './graphqlEnums';

describe('GraphQL enum adapters', () => {
  it('maps display risk levels to schema enum values and back', () => {
    expect(toGraphQLRisk('一级')).toBe('LEVEL_1');
    expect(toGraphQLRisk('二级')).toBe('LEVEL_2');
    expect(toGraphQLRisk('三级')).toBe('LEVEL_3');
    expect(fromGraphQLRisk('LEVEL_1')).toBe('一级');
  });

  it('maps review statuses to schema enum values and back', () => {
    expect(toGraphQLStatus('待复核')).toBe('PENDING');
    expect(toGraphQLStatus('已确认')).toBe('CONFIRMED');
    expect(toGraphQLStatus('误检')).toBe('FALSE_POSITIVE');
    expect(toGraphQLStatus('待复查')).toBe('RECHECK');
    expect(toGraphQLStatus('已派单')).toBe('DISPATCHED');
    expect(fromGraphQLStatus('FALSE_POSITIVE')).toBe('误检');
  });
});
