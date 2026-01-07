import { describe, it, expect } from 'vitest';
import { sendWelcomeEmail } from './newsletter';

describe('Welcome Email', () => {
  it('should send welcome email successfully', async () => {
    const testEmail = 'scottiediablo@icloud.com';
    
    const result = await sendWelcomeEmail(testEmail, 'daily');
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    console.log(`✓ Welcome email sent successfully (ID: ${result.id})`);
  }, 30000); // 30 second timeout

  it('should send welcome email with weekly frequency', async () => {
    const testEmail = 'scottiediablo@icloud.com';
    
    const result = await sendWelcomeEmail(testEmail, 'weekly');
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    console.log(`✓ Weekly welcome email sent successfully (ID: ${result.id})`);
  }, 30000);
});
