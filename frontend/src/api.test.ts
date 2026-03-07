import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from './api';
import { Priority } from '@todo-app/shared';

(globalThis as any).fetch = vi.fn();

describe('API URL parameter generation', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve([]),
    } as Response);
  });

  it('should call fetch with correct URL for no filters', async () => {
    await api.getTodos();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items?'));
  });

  it('should call fetch with correct URL for name filter', async () => {
    await api.getTodos({ name: 'test' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('search=test'));
  });

  it('should call fetch with correct URL for category filter', async () => {
    await api.getTodos({ categoryId: 1 });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('categories=1'));
  });

  it('should call fetch with correct URL for priority filter', async () => {
    await api.getTodos({ priority: Priority.HIGH });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('priority=7'));
  });

  it('should call fetch with multiple filters', async () => {
    await api.getTodos({ name: 'test', categoryId: 1, priority: Priority.LOW });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain('search=test');
    expect(url).toContain('categories=1');
    expect(url).toContain('priority=3');
  });
});
