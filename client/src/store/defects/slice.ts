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
  optimisticById: Record<string, Defect>;
}

export interface ReviewIntent {
  id: string;
  action: ReviewStatus;
  comment?: string;
}

const initialState: DefectsState = {
  list: [],
  selectedId: null,
  filter: {},
  status: 'idle',
  error: null,
  highlightedId: null,
  optimisticById: {},
};

const sortByDetectedAtDesc = (defects: Defect[]) =>
  [...defects].sort((left, right) => right.detectedAt.localeCompare(left.detectedAt));

const replaceDefect = (list: Defect[], defect: Defect) =>
  list.map((item) => (item.id === defect.id ? defect : item));

const matchesFilter = (defect: Defect, filter: DefectFilters) => {
  if (filter.riskLevel && defect.riskLevel !== filter.riskLevel) {
    return false;
  }
  if (filter.status && defect.status !== filter.status) {
    return false;
  }
  return true;
};

const defectsSlice = createSlice({
  name: 'defects',
  initialState,
  reducers: {
    defectsFetchRequested(state) {
      state.status = 'loading';
      state.error = null;
    },
    defectsFetchStarted(state) {
      state.status = 'loading';
      state.error = null;
    },
    defectsLoaded(state, action: PayloadAction<Defect[]>) {
      state.list = sortByDetectedAtDesc(action.payload);
      state.status = 'idle';
      state.error = null;
    },
    defectsFetchFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    defectStreamReceived(state, action: PayloadAction<Defect>) {
      const defect = action.payload;
      state.list = state.list.filter((item) => item.id !== defect.id);
      if (matchesFilter(defect, state.filter)) {
        state.list = [defect, ...state.list];
        state.highlightedId = defect.id;
      }
    },
    clearHighlightedId(state, action: PayloadAction<string | undefined>) {
      if (!action.payload || state.highlightedId === action.payload) {
        state.highlightedId = null;
      }
    },
    setRiskFilter(state, action: PayloadAction<RiskLevel | undefined>) {
      if (action.payload) {
        state.filter.riskLevel = action.payload;
      } else {
        delete state.filter.riskLevel;
      }
    },
    setStatusFilter(state, action: PayloadAction<ReviewStatus | undefined>) {
      if (action.payload) {
        state.filter.status = action.payload;
      } else {
        delete state.filter.status;
      }
    },
    clearFilters(state) {
      state.filter = {};
    },
    setSelectedId(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    defectReviewOptimistic(state, action: PayloadAction<ReviewIntent>) {
      const { id, action: nextStatus } = action.payload;
      const existing = state.list.find((defect) => defect.id === id);
      if (!existing) {
        return;
      }
      if (!state.optimisticById[id]) {
        state.optimisticById[id] = existing;
      }
      state.list = replaceDefect(state.list, { ...existing, status: nextStatus });
    },
    defectReviewCommitted(state, action: PayloadAction<Defect>) {
      const defect = action.payload;
      delete state.optimisticById[defect.id];
      state.list = replaceDefect(state.list, defect);
    },
    defectReviewRollback(state, action: PayloadAction<{ id: string }>) {
      const previous = state.optimisticById[action.payload.id];
      if (!previous) {
        return;
      }
      state.list = replaceDefect(state.list, previous);
      delete state.optimisticById[action.payload.id];
    },
  },
});

export const {
  clearFilters,
  clearHighlightedId,
  defectReviewCommitted,
  defectReviewOptimistic,
  defectReviewRollback,
  defectStreamReceived,
  defectsFetchFailed,
  defectsFetchRequested,
  defectsFetchStarted,
  defectsLoaded,
  setRiskFilter,
  setSelectedId,
  setStatusFilter,
} = defectsSlice.actions;

export default defectsSlice.reducer;
