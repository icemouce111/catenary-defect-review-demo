import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ReviewStatus } from '@4c-console/shared';

export interface ReviewDraft {
  action: ReviewStatus;
  comment: string;
}

export interface ReviewSubmitPayload {
  id: string;
  action: ReviewStatus;
  comment?: string;
}

export interface ReviewState {
  drafts: Record<string, ReviewDraft>;
  submitting: Record<string, boolean>;
  errors: Record<string, string | undefined>;
}

const initialState: ReviewState = {
  drafts: {},
  submitting: {},
  errors: {},
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    reviewDraftChanged(state, action: PayloadAction<{ id: string } & ReviewDraft>) {
      const { id, action: nextAction, comment } = action.payload;
      state.drafts[id] = { action: nextAction, comment };
    },
    submitReviewRequested(state, action: PayloadAction<ReviewSubmitPayload>) {
      state.submitting[action.payload.id] = true;
      state.errors[action.payload.id] = undefined;
    },
    submitReviewSucceeded(state, action: PayloadAction<{ id: string }>) {
      delete state.submitting[action.payload.id];
      delete state.errors[action.payload.id];
      delete state.drafts[action.payload.id];
    },
    submitReviewFailed(state, action: PayloadAction<{ id: string; error: string }>) {
      delete state.submitting[action.payload.id];
      state.errors[action.payload.id] = action.payload.error;
    },
  },
});

export const {
  reviewDraftChanged,
  submitReviewFailed,
  submitReviewRequested,
  submitReviewSucceeded,
} = reviewSlice.actions;

export default reviewSlice.reducer;
