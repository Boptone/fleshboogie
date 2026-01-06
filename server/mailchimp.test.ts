import { describe, it, expect } from 'vitest';
import { testMailchimpConnection, addSubscriberToMailchimp } from './mailchimp';

describe('Mailchimp Integration', () => {
  it('should successfully connect to Mailchimp API', async () => {
    const result = await testMailchimpConnection();
    expect(result.success).toBe(true);
  }, 10000); // 10 second timeout for API call

  it('should add a test subscriber to Mailchimp', async () => {
    const testEmail = `test+${Date.now()}@fleshboogie.com`;
    const result = await addSubscriberToMailchimp(testEmail, 'America/Los_Angeles');
    
    expect(result.success).toBe(true);
    expect(result.data || result.alreadySubscribed).toBeTruthy();
  }, 10000);
});
