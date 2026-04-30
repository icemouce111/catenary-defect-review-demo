import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface StreamState {
  isActive: boolean;
  isConnecting: boolean;
  receivedCount: number;
  error: string | null;
  connectedAt: string | null;
}

const initialState: StreamState = {
  isActive: false,
  isConnecting: false,
  receivedCount: 0,
  error: null,
  connectedAt: null,
};

const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    streamStarted(state) {
      state.isActive = true;
      state.isConnecting = true;
      state.error = null;
      state.receivedCount = 0;
    },
    streamReady(state, action: PayloadAction<{ connectedAt: string }>) {
      state.isActive = true;
      state.isConnecting = false;
      state.connectedAt = action.payload.connectedAt;
      state.error = null;
    },
    streamStopped(state) {
      state.isActive = false;
      state.isConnecting = false;
      state.connectedAt = null;
    },
    streamDefectReceived(state) {
      state.receivedCount += 1;
      state.error = null;
    },
    streamFailed(state, action: PayloadAction<string>) {
      state.isConnecting = false;
      state.error = action.payload;
    },
  },
});

export const { streamDefectReceived, streamFailed, streamReady, streamStarted, streamStopped } =
  streamSlice.actions;

export default streamSlice.reducer;
