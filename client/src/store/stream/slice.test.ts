import { describe, expect, it } from 'vitest';
import reducer, { streamSlice } from './slice';

describe('stream slice', () => {
  it('marks stream inactive when the connection fails', () => {
    const active = reducer(undefined, streamSlice.actions.connected());
    const failed = reducer(active, streamSlice.actions.failed('stream closed'));

    expect(failed.isActive).toBe(false);
    expect(failed.isConnecting).toBe(false);
    expect(failed.connectedAt).toBeNull();
    expect(failed.error).toBe('stream closed');
  });
});
