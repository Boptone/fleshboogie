# FLESHBOOGIE Cron Job Setup Guide

This guide explains how to set up automated tasks for FLESHBOOGIE using external cron services.

## Overview

FLESHBOOGIE has three automated tasks that need to run on a schedule:

1. **RSS Feed Refresh** - Updates content every 30-60 minutes
2. **Daily Newsletter** - Sends to daily subscribers at 6 AM PST (14:00 UTC)
3. **Weekly Newsletter** - Sends to weekly subscribers on Sundays at 6 AM PST (14:00 UTC)

## API Endpoints

All endpoints require authentication using the `CRON_SECRET` environment variable.

### 1. RSS Feed Refresh
```
POST https://fleshboogie.com/api/cron/refresh-feeds
Header: X-Cron-Secret: YOUR_CRON_SECRET
```

**Recommended schedule:** Every 30-60 minutes  
**Example:** `*/30 * * * *` (every 30 minutes)

### 2. Daily Newsletter
```
POST https://fleshboogie.com/api/cron/send-daily-newsletter
Header: X-Cron-Secret: YOUR_CRON_SECRET
```

**Recommended schedule:** Daily at 6 AM PST (14:00 UTC)  
**Cron expression:** `0 14 * * *`

### 3. Weekly Newsletter
```
POST https://fleshboogie.com/api/cron/send-weekly-newsletter
Header: X-Cron-Secret: YOUR_CRON_SECRET
```

**Recommended schedule:** Sundays at 6 AM PST (14:00 UTC)  
**Cron expression:** `0 14 * * 0`

## Setup Instructions

### Option 1: cron-job.org (Recommended - Free)

1. Go to https://cron-job.org and create a free account
2. Click "Create cronjob"
3. For **RSS Feed Refresh**:
   - Title: "FLESHBOOGIE RSS Refresh"
   - URL: `https://fleshboogie.com/api/cron/refresh-feeds`
   - Schedule: Every 30 minutes
   - Request method: POST
   - Headers: Add `X-Cron-Secret` with your secret value
   - Save

4. Repeat for **Daily Newsletter**:
   - Title: "FLESHBOOGIE Daily Newsletter"
   - URL: `https://fleshboogie.com/api/cron/send-daily-newsletter`
   - Schedule: Daily at 14:00 (UTC)
   - Request method: POST
   - Headers: Add `X-Cron-Secret` with your secret value
   - Save

5. Repeat for **Weekly Newsletter**:
   - Title: "FLESHBOOGIE Weekly Newsletter"
   - URL: `https://fleshboogie.com/api/cron/send-weekly-newsletter`
   - Schedule: Weekly on Sunday at 14:00 (UTC)
   - Request method: POST
   - Headers: Add `X-Cron-Secret` with your secret value
   - Save

### Option 2: EasyCron (Alternative)

1. Go to https://www.easycron.com and create account
2. Click "Add Cron Job"
3. Enter URL and set schedule using cron expression
4. Add custom header: `X-Cron-Secret: YOUR_SECRET`
5. Save and enable

### Option 3: UptimeRobot (For RSS Refresh Only)

UptimeRobot can be used for RSS refresh but doesn't support custom headers, so you'll need to use query parameter authentication:

1. Go to https://uptimerobot.com
2. Create HTTP(s) monitor
3. URL: `https://fleshboogie.com/api/cron/refresh-feeds?secret=YOUR_SECRET`
4. Monitoring interval: 30 minutes
5. Save

**Note:** For newsletters, use cron-job.org or EasyCron since they support custom headers.

## Testing

### Test Health Check
```bash
curl "https://fleshboogie.com/api/cron/health?secret=YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "message": "Cron system is healthy",
  "timestamp": "2026-01-07T15:00:00.000Z"
}
```

### Test RSS Refresh
```bash
curl -X POST "https://fleshboogie.com/api/cron/refresh-feeds" \
  -H "X-Cron-Secret: YOUR_CRON_SECRET"
```

### Test Daily Newsletter
```bash
curl -X POST "https://fleshboogie.com/api/cron/send-daily-newsletter" \
  -H "X-Cron-Secret: YOUR_CRON_SECRET"
```

## Security

- **Keep your CRON_SECRET private** - Never commit it to git or share publicly
- The secret is stored in your environment variables on the server
- All endpoints return 401 Unauthorized if the secret is missing or incorrect
- You can regenerate the secret anytime by updating the `CRON_SECRET` environment variable

## Troubleshooting

### Endpoint returns 401 Unauthorized
- Check that your CRON_SECRET matches the one in your environment variables
- Verify the header name is exactly `X-Cron-Secret` (case-sensitive)
- For query parameter auth, use `?secret=YOUR_SECRET`

### RSS feeds not updating
- Check the cron job execution logs in your cron service
- Verify the endpoint URL is correct (no typos)
- Test manually using curl to see the actual error message

### Newsletter not sending
- Check that you have daily/weekly subscribers in your database
- Verify RESEND_API_KEY is set correctly
- Check server logs for detailed error messages
- Test manually first to ensure the script works

## Your CRON_SECRET

```
a7f3e9d2c8b1f4a6e5d9c2b7f8a3e1d4c9b6f2a8e7d3c1b5f9a4e2d8c6b3f7a1
```

**Important:** Store this securely! You'll need it when setting up your cron jobs.

## Recommended Schedule Summary

| Task | Frequency | Cron Expression | UTC Time |
|------|-----------|----------------|----------|
| RSS Refresh | Every 30 min | `*/30 * * * *` | Every :00 and :30 |
| Daily Newsletter | Daily 6 AM PST | `0 14 * * *` | 14:00 |
| Weekly Newsletter | Sunday 6 AM PST | `0 14 * * 0` | Sunday 14:00 |

## Next Steps

1. Choose a cron service (cron-job.org recommended)
2. Create accounts and set up the three cron jobs
3. Test each endpoint manually first
4. Monitor the first few executions to ensure they work correctly
5. Check your email to confirm newsletters are being delivered

---

**Need help?** The endpoints are already deployed and ready to use. Just set up the cron jobs and you're done!
