import { describe, it, expect } from 'vitest';

describe('Cron Endpoints Authentication', () => {
  const CRON_SECRET = process.env.CRON_SECRET;
  const BASE_URL = 'http://localhost:3000';

  it('should have CRON_SECRET environment variable set', () => {
    expect(CRON_SECRET).toBeDefined();
    expect(CRON_SECRET).not.toBe('');
    expect(CRON_SECRET?.length).toBeGreaterThan(20);
  });

  it('should authenticate health check with valid secret', async () => {
    const response = await fetch(`${BASE_URL}/api/cron/health?secret=${CRON_SECRET}`, {
      method: 'GET',
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Cron system is healthy');
  });

  it('should reject health check with invalid secret', async () => {
    const response = await fetch(`${BASE_URL}/api/cron/health?secret=wrong-secret`, {
      method: 'GET',
    });

    expect(response.ok).toBe(false);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  it('should reject health check with missing secret', async () => {
    const response = await fetch(`${BASE_URL}/api/cron/health`, {
      method: 'GET',
    });

    expect(response.ok).toBe(false);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });
});
