// @ts-ignore - No type definitions available
import mailchimp from '@mailchimp/mailchimp_marketing';

// Initialize Mailchimp client
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_KEY?.split('-')[1] || 'us13', // Extract server prefix from API key
});

const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || '';

/**
 * Add a subscriber to the Mailchimp audience
 */
export async function addSubscriberToMailchimp(email: string, timezone?: string) {
  try {
    const response = await mailchimp.lists.addListMember(AUDIENCE_ID, {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        TIMEZONE: timezone || 'Unknown',
      },
    });
    
    return { success: true, data: response };
  } catch (error: any) {
    // Handle "already subscribed" case gracefully
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      return { success: true, alreadySubscribed: true };
    }
    
    console.error('Mailchimp error:', error.response?.body || error.message);
    throw new Error(error.response?.body?.detail || 'Failed to subscribe to newsletter');
  }
}

/**
 * Update subscriber information
 */
export async function updateSubscriber(email: string, updates: any) {
  try {
    const crypto = await import('crypto');
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');
    
    const response = await mailchimp.lists.updateListMember(
      AUDIENCE_ID,
      subscriberHash,
      updates
    );
    
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Mailchimp update error:', error.response?.body || error.message);
    throw new Error('Failed to update subscriber');
  }
}

/**
 * Test Mailchimp connection
 */
export async function testMailchimpConnection() {
  try {
    const response = await mailchimp.ping.get();
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Mailchimp connection test failed:', error);
    return { success: false, error: error.message };
  }
}
