import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Defect, DefectFilters, ReviewStatus, RiskLevel } from '@4c-console/shared';

export type LoadStatus = 'idle' | 'loading' | 'error';

export interface DefectsState {
  list: Defect[];
  selectedId: string | null;
  filter: DefectFilters;
  status: LoadStatus;
  error: string | null;
  highlightedId: string | null;
}

export interface ReviewIntent {
  id: string;
  status: ReviewStatus;
  comment?: string;
}

const initialState: DefectsState = {
  list: [],
  selectedId: null,
  filter: {},
  status: 'idle',
  error: null,
  highlightedId: null,
};

const sortByDetectedAtDesc = (defects: Defect[]) =>
  [...defects].sort((left, right) => right.detectedAt.localeCompare(left.detectedAt));

const replaceDefect = (list: Defect[], defect: Defect) =>
  list.map((item) => (item.id === defect.id ? defect : item));

export const defectsSlice = createSlice({
  name: 'defects',
  initialState,
  reducers: {
    fetchRequested(state) {
      state.status = 'loading';
      state.error = null;
    },
    fetchSucceeded(state, action: PayloadAction<Defect[]>) {
      state.list = sortByDetectedAtDesc(action.payload);
      state.status = 'idle';
      state.error = null;
    },
    fetchFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    setSelectedId(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    setFilter(state, action: PayloadAction<DefectFilters>) {
      state.filter = { ...state.filter, ...action.payload };
      if ('riskLevel' in action.payload && !action.payload.riskLevel) {
        delete state.filter.riskLevel;
      }
      if ('status' in action.payload && !action.payload.status) {
        delete state.filter.status;
      }
      state.status = 'loading';
      state.error = null;
    },
    prependDefect(state, action: PayloadAction<Defect>) {
      const defect = action.payload;
      state.list = state.list.filter((item) => item.id !== defect.id);
      state.list = [defect, ...state.list];
      state.highlightedId = defect.id;
    },
    updateDefectStatusOptimistic(state, action: PayloadAction<{ id: string; status: ReviewStatus }>) {
      const { id, status } = action.payload;
      const existing = state.list.find((defect) => defect.id === id);
      if (existing) {
        existing.status = status;
      }
    },
    rollbackDefectStatus(
      state,
      action: PayloadAction<{ id: string; previousStatus: ReviewStatus }>,
    ) {
      const existing = state.list.find((defect) => defect.id === action.payload.id);
      if (existing) {
        existing.status = action.payload.previousStatus;
      }
    },
    upsertDefect(state, action: PayloadAction<Defect>) {
      const defect = action.payload;
      const exists = state.list.some((item) => item.id === defect.id);
      if (exists) {
        state.list = replaceDefect(state.list, defect);
        return;
      }
      state.list = sortByDetectedAtDesc([defect, ...state.list]);
    },
    clearFilters(state) {
      state.filter = {};
    },
    clearHighlightedId(state, action: PayloadAction<string | undefined>) {
      if (!action.payload || state.highlightedId === action.payload) {
        state.highlightedId = null;
      }
    },
  },
});

export const {
  clearFilters,
  clearHighlightedId,
  fetchFailed,
  fetchRequested,
  fetchSucceeded,
  prependDefect,
  rollbackDefectStatus,
  setFilter,
  setSelectedId,
  updateDefectStatusOptimistic,
  upsertDefect,
} = defectsSlice.actions;

export default defectsSlice.reducer;
