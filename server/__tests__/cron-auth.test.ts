import { describe, it, expect } from 'vitest';

describe('Cron Authentication', () => {
  it('should access public diagnostic endpoint', async () => {
    // Test the diagnostic endpoint (which is public)
    const response = await fetch('http://localhost:3000/api/cron/diagnostic');
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.diagnostic).toBeDefined();
  });
  
  it('should reject requests without valid CRON_SECRET', async () => {
    // Test authenticated endpoint with wrong secret
    const response = await fetch('http://localhost:3000/api/cron/refresh-feeds', {
      method: 'POST',
      headers: {
        'X-Cron-Secret': 'wrong-secret'
      }
    });
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid or missing cron secret');
  });
  
  it('should have CRON_SECRET environment variable set correctly', () => {
    const cronSecret = process.env.CRON_SECRET;
    expect(cronSecret).toBeDefined();
    expect(cronSecret).toBe('fleshboogie-cron-2026-secure-key');
  });
});
