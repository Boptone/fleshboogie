# The Boogie Blast Newsletter - Setup Guide

## Current Status

The newsletter subscription infrastructure is **fully built and ready**, but email delivery is **not yet activated**. The site is currently collecting subscriber emails and timezone preferences in the database.

---

## What's Already Built

✅ **Database Schema**
- `newsletter_subscribers` table stores email, timezone, subscription status, and unsubscribe tokens
- Supports timezone-aware delivery (each subscriber gets emails at their local 9am)

✅ **Subscription Form**
- Live on the homepage footer
- Automatically detects user's timezone via browser
- Validates email addresses
- Prevents duplicate subscriptions

✅ **Backend API**
- `trpc.newsletter.subscribe` - handles new subscriptions
- `trpc.newsletter.unsubscribe` - handles unsubscribe requests
- Database helper functions for querying subscribers by timezone

---

## What's Missing (To Activate Email Delivery)

To start sending "The Boogie Blast" daily emails, you need to:

### 1. Choose an Email Service Provider

Recommended options:

| Service | Free Tier | Best For | Setup Difficulty |
|---------|-----------|----------|------------------|
| **Resend** | 3,000 emails/month | Modern developers, great DX | Easy |
| **SendGrid** | 100 emails/day | Enterprise reliability | Medium |
| **Mailgun** | 5,000 emails/month (first 3 months) | High deliverability | Medium |

**Recommendation:** Start with **Resend**. It has the best developer experience and a generous free tier.

### 2. Sign Up and Get API Key

1. Go to [resend.com](https://resend.com) (or your chosen provider)
2. Create an account
3. Verify your domain (or use their test domain for development)
4. Generate an API key

### 3. Add API Key to Manus

1. Open the **Settings → Secrets** panel in the Manus Management UI
2. Add a new secret:
   - Key: `RESEND_API_KEY` (or `SENDGRID_API_KEY`, etc.)
   - Value: Your API key from step 2

### 4. Request Implementation

Once you have the API key configured, let me know and I will:

1. **Build the email template** - HTML email with The Boogie Blast branding
2. **Implement content selection** - Logic to pick the top 5-7 links from your curated content
3. **Create the scheduling system** - Automated job that sends emails at 9am local time for each timezone
4. **Add unsubscribe links** - One-click unsubscribe functionality
5. **Test the full flow** - Send test emails and verify delivery

---

## Current Subscriber Data

You can view your subscribers at any time by querying the database via the Management UI:

```sql
SELECT email, timezone, subscribed_at 
FROM newsletter_subscribers 
WHERE is_active = 1
ORDER BY subscribed_at DESC;
```

This will show you everyone who has signed up and is waiting for The Boogie Blast to launch.

---

## Architecture Notes

### Timezone-Aware Delivery

The system is designed to send emails at **9am local time** for each subscriber. This means:

- A subscriber in New York gets their email at 9am EST
- A subscriber in Los Angeles gets their email at 9am PST (3 hours later)
- A subscriber in London gets their email at 9am GMT

The scheduling system will:
1. Group subscribers by timezone
2. Calculate when it's 9am in each timezone
3. Send batch emails to each timezone group at the correct time

### Content Selection

The daily email will automatically pull from your curated content in `content.json`:
- The **splash headline** (main story)
- Top 3-5 links from the **main column**
- 1-2 interesting picks from the **three-column grid**

You maintain full editorial control—the email simply reflects what you've already curated on the site.

---

## Cost Estimate

Assuming you grow to **1,000 subscribers**:
- **Resend:** Free (under 3,000 emails/month)
- **SendGrid:** Free (under 100 emails/day = 3,000/month)
- **Mailgun:** Free for first 3 months, then ~$5/month

The newsletter feature is designed to be **extremely cost-effective** while you build your audience.

---

## Next Steps

1. **Let subscribers accumulate** - The form is live, people can sign up
2. **Choose your email provider** when you're ready to launch
3. **Add the API key** to Manus
4. **Request activation** - I'll implement the email delivery system in ~30 minutes

The infrastructure is ready. You're just one API key away from launching The Boogie Blast.
