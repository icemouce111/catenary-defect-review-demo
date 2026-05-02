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

export const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    start(state) {
      state.isActive = true;
      state.isConnecting = true;
      state.error = null;
      state.receivedCount = 0;
    },
    stop(state) {
      state.isActive = false;
      state.isConnecting = false;
    },
    connected(state) {
      state.isActive = true;
      state.isConnecting = false;
      state.connectedAt = new Date().toISOString();
      state.error = null;
    },
    disconnected(state) {
      state.isActive = false;
      state.isConnecting = false;
      state.connectedAt = null;
    },
    increment(state) {
      state.receivedCount += 1;
      state.error = null;
    },
    failed(state, action: PayloadAction<string>) {
      state.isConnecting = false;
      state.error = action.payload;
    },
  },
});

export const { connected, disconnected, failed, increment, start, stop } = streamSlice.actions;

export default streamSlice.reducer;
