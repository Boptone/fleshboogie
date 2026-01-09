# Newsletter Status & Content Freshness Issue

## Current Status: ⏸️ PAUSED

The morning newsletter sends have been **temporarily paused** as of January 8, 2026.

### What's Working
- ✅ Email signup form on website (still collecting subscribers)
- ✅ Welcome emails to new subscribers
- ✅ Subscriber database and preferences management
- ✅ Newsletter template and formatting

### What's Paused
- ⏸️ Daily newsletter sends (6 AM PST)
- ⏸️ Weekly newsletter sends (Sunday 6 AM PST)

---

## Root Cause: Outdated Content

The newsletter that was sent this morning contained **outdated content** because:

1. **Content Source**: Newsletters pull from `/client/public/data/content.json`
2. **Last Update**: January 7, 2026 at 11:43 AM (over 30 hours ago)
3. **Expected Update Frequency**: Every 30-60 minutes via RSS refresh cron job

### Why RSS Refresh is Failing

The `scripts/fetch-feeds.mjs` script is **hanging** on certain RSS feeds:
- Script has 10-second timeout per feed
- Some feeds (e.g., dummymag.com) are not responding within timeout
- Script appears to hang indefinitely despite timeout logic
- This prevents content.json from being updated

---

## How Newsletter Pause Works

### Environment Variable
```
NEWSLETTER_PAUSED=true
```

When set to `true`:
- Daily and weekly newsletter scripts exit immediately
- No emails are sent
- Email signups continue to work normally
- Subscribers are not affected (they just don't receive emails)

### Code Implementation
Both `send-daily-newsletter.mjs` and `send-weekly-newsletter.mjs` check this variable:

```javascript
if (process.env.NEWSLETTER_PAUSED === 'true') {
  console.log('⏸️  Newsletter is currently PAUSED');
  console.log('ℹ️  Email signups are still active, but sends are disabled');
  return;
}
```

---

## How to Resume Newsletter

### Step 1: Fix RSS Refresh Issue

**Option A: Remove Problematic Feeds**
Edit `scripts/fetch-feeds.mjs` and comment out feeds that are timing out:
```javascript
// 'https://www.dummymag.com/feed/',  // DISABLED: Times out
```

**Option B: Increase Timeout**
Change line 442 in `fetch-feeds.mjs`:
```javascript
request.setTimeout(30000, () => {  // Increase from 10000 to 30000 (30 seconds)
```

**Option C: Add Better Error Handling**
Wrap the entire fetch loop in a try-catch with overall timeout

### Step 2: Manually Refresh Content
```bash
cd /home/ubuntu/fleshboogie
node scripts/fetch-feeds.mjs
```

Verify `content.json` was updated:
```bash
stat client/public/data/content.json | grep Modify
```

### Step 3: Verify Fresh Content
Check the homepage at https://fleshboogie.com to ensure articles are recent (within last 24 hours)

### Step 4: Test Newsletter
Send a test newsletter to yourself:
```bash
node scripts/send-test-newsletter.mjs your-email@example.com
```

### Step 5: Re-enable Newsletter
Go to **Settings → Secrets** in the Management UI and change:
```
NEWSLETTER_PAUSED=false
```

Or use `webdev_edit_secrets` tool to set it programmatically.

---

## Monitoring

### Check Content Freshness
```bash
# Check when content.json was last updated
stat /home/ubuntu/fleshboogie/client/public/data/content.json | grep Modify

# Should be within last 1-2 hours
```

### Check Cron Job Status
The RSS refresh cron job should be running every 30-60 minutes. Check your cron service logs (GitHub Actions, Vercel Cron, or external cron service) to see if jobs are completing successfully.

### Manual RSS Refresh
If cron is failing, you can manually refresh:
```bash
cd /home/ubuntu/fleshboogie
node scripts/fetch-feeds.mjs
```

---

## Recommended Next Steps

1. **Identify problematic RSS feeds** by running fetch-feeds.mjs with verbose logging
2. **Remove or replace** feeds that consistently timeout
3. **Add overall timeout** to the main fetch loop (e.g., 3 minutes max)
4. **Set up monitoring** to alert when content.json hasn't been updated in 2+ hours
5. **Test newsletter** with fresh content before re-enabling
6. **Set NEWSLETTER_PAUSED=false** to resume sends

---

## Contact

For questions or issues, contact the site owner or check the Management UI → Settings → Secrets to manage the NEWSLETTER_PAUSED flag.
