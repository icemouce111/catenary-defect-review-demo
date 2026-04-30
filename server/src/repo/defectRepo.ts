import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import type {
  DashboardStats,
  Defect,
  DefectFilters,
  ReviewLog,
  ReviewStatus,
  RiskLevel,
} from '@4c-console/shared';

export interface DefectRepo {
  listDefects(filters?: DefectFilters): Promise<Defect[]>;
  getDefect(id: string): Promise<Defect | null>;
  addDefect(defect: Defect): Promise<Defect>;
  reviewDefect(id: string, action: ReviewStatus, comment?: string): Promise<Defect>;
  dispatchDefect(id: string): Promise<Defect>;
  dashboardStats(): Promise<DashboardStats>;
}

const riskLevels: RiskLevel[] = ['一级', '二级', '三级'];

const cloneDefect = (defect: Defect): Defect => ({
  ...defect,
  bbox: { ...defect.bbox },
  reviewLogs: defect.reviewLogs.map((log) => ({ ...log })),
});

const withLogs = (defects: Defect[], logs: ReviewLog[]) =>
  defects.map((defect) => ({
    ...defect,
    reviewLogs: logs.filter((log) => log.defectId === defect.id),
  }));

const applyFilters = (defects: Defect[], filters: DefectFilters = {}) =>
  defects.filter((defect) => {
    if (filters.riskLevel && defect.riskLevel !== filters.riskLevel) {
      return false;
    }
    if (filters.status && defect.status !== filters.status) {
      return false;
    }
    return true;
  });

const appendReviewLog = (
  logs: ReviewLog[],
  defectId: string,
  action: ReviewStatus,
  comment?: string,
) => [
  ...logs,
  {
    id: `LOG-${nanoid(8)}`,
    defectId,
    reviewer: '复核员 张工',
    action,
    comment,
    timestamp: new Date().toISOString(),
  },
];

export const getDashboardStatsFromDefects = (defects: Defect[]): DashboardStats => {
  const totalDetected = defects.length;
  const falsePositive = defects.filter((defect) => defect.status === '误检').length;

  return {
    totalDetected,
    pendingReview: defects.filter((defect) => defect.status === '待复核').length,
    confirmed: defects.filter((defect) => defect.status === '已确认').length,
    falsePositive,
    falsePositiveRate: totalDetected === 0 ? 0 : falsePositive / totalDetected,
    riskDistribution: riskLevels.map((level) => ({
      level,
      count: defects.filter((defect) => defect.riskLevel === level).length,
    })),
  };
};

export const createMemoryDefectRepo = (
  initialDefects: Defect[],
  initialLogs: ReviewLog[] = [],
): DefectRepo => {
  let defects = initialDefects.map(cloneDefect);
  let logs = initialLogs.map((log) => ({ ...log }));

  const listDefects = async (filters: DefectFilters = {}) =>
    applyFilters(withLogs(defects, logs), filters).map(cloneDefect);

  const getDefect = async (id: string) =>
    (await listDefects()).find((defect) => defect.id === id) ?? null;

  const replaceStatus = async (id: string, status: ReviewStatus, comment?: string) => {
    const index = defects.findIndex((defect) => defect.id === id);
    if (index === -1) {
      throw new Error(`Defect ${id} not found`);
    }

    defects = defects.map((defect) => (defect.id === id ? { ...defect, status } : defect));
    logs = appendReviewLog(logs, id, status, comment);

    const updated = await getDefect(id);
    if (!updated) {
      throw new Error(`Defect ${id} not found after update`);
    }
    return updated;
  };

  return {
    listDefects,
    getDefect,
    addDefect: async (defect) => {
      defects = [cloneDefect(defect), ...defects.filter((item) => item.id !== defect.id)];
      const added = await getDefect(defect.id);
      if (!added) {
        throw new Error(`Defect ${defect.id} not found after insert`);
      }
      return added;
    },
    reviewDefect: replaceStatus,
    dispatchDefect: (id) => replaceStatus(id, '已派单', '缺陷已进入派单处理流程'),
    dashboardStats: async () => getDashboardStatsFromDefects(defects),
  };
};

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');
const defaultDefectsPath = path.join(dataDir, 'defects.json');
const defaultLogsPath = path.join(dataDir, 'reviewLogs.json');

const readJson = async <T>(filePath: string): Promise<T> => {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
};

export const createFileDefectRepo = (
  defectsPath = defaultDefectsPath,
  logsPath = defaultLogsPath,
): DefectRepo => {
  const load = async () => ({
    defects: await readJson<Defect[]>(defectsPath),
    logs: await readJson<ReviewLog[]>(logsPath),
  });

  const persistDefects = (defects: Defect[]) =>
    writeFile(defectsPath, `${JSON.stringify(defects, null, 2)}\n`, 'utf8');

  const persistLogs = (logs: ReviewLog[]) =>
    writeFile(logsPath, `${JSON.stringify(logs, null, 2)}\n`, 'utf8');

  const listDefects = async (filters: DefectFilters = {}) => {
    const { defects, logs } = await load();
    return applyFilters(withLogs(defects, logs), filters).map(cloneDefect);
  };

  const getDefect = async (id: string) =>
    (await listDefects()).find((defect) => defect.id === id) ?? null;

  const updateStatus = async (id: string, status: ReviewStatus, comment?: string) => {
    const { defects, logs } = await load();
    if (!defects.some((defect) => defect.id === id)) {
      throw new Error(`Defect ${id} not found`);
    }

    await persistDefects(
      defects.map((defect) => (defect.id === id ? { ...defect, status } : defect)),
    );
    await persistLogs(appendReviewLog(logs, id, status, comment));

    const updated = await getDefect(id);
    if (!updated) {
      throw new Error(`Defect ${id} not found after update`);
    }
    return updated;
  };

  return {
    listDefects,
    getDefect,
    addDefect: async (defect) => {
      const { defects } = await load();
      await persistDefects([defect, ...defects.filter((item) => item.id !== defect.id)]);
      const added = await getDefect(defect.id);
      if (!added) {
        throw new Error(`Defect ${defect.id} not found after insert`);
      }
      return added;
    },
    reviewDefect: updateStatus,
    dispatchDefect: (id) => updateStatus(id, '已派单', '缺陷已进入派单处理流程'),
    dashboardStats: async () => {
      const { defects } = await load();
      return getDashboardStatsFromDefects(defects);
    },
  };
};
