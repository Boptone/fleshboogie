# GitHub Actions Setup Guide

This guide explains how to configure GitHub Actions to automate RSS feed refresh and newsletter sending for FLESHBOOGIE.

## Overview

Three GitHub Actions workflows have been created:

1. **Refresh RSS Feeds** - Runs every 60 minutes (hourly)
2. **Send Daily Newsletter** - Runs daily at 6 AM PST (14:00 UTC)
3. **Send Weekly Newsletter** - Runs every Sunday at 6 AM PST (14:00 UTC)

## Setup Instructions

### Step 1: Push Workflows to GitHub

The workflow files are located in `.github/workflows/`:
- `refresh-rss-feeds.yml`
- `send-daily-newsletter.yml`
- `send-weekly-newsletter.yml`

Push these files to your GitHub repository:

```bash
cd /home/ubuntu/fleshboogie
git add .github/workflows/
git commit -m "Add GitHub Actions workflows for automation"
git push origin main
```

### Step 2: Configure GitHub Secrets

GitHub Actions needs two secrets to authenticate with your API:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Secret 1: FLESHBOOGIE_URL
- **Name:** `FLESHBOOGIE_URL`
- **Value:** `https://fleshboogie.com` (or your deployed URL)
- Click **Add secret**

#### Secret 2: CRON_SECRET
- **Name:** `CRON_SECRET`
- **Value:** `a7f3e9d2c8b1f4a6e5d9c2b7f8a3e1d4c9b6f2a8e7d3c1b5f9a4e2d8c6b3f7a1`
- Click **Add secret**

### Step 3: Enable GitHub Actions

1. Go to your repository's **Actions** tab
2. If prompted, click **I understand my workflows, go ahead and enable them**
3. You should see three workflows listed:
   - Refresh RSS Feeds
   - Send Daily Newsletter
   - Send Weekly Newsletter

### Step 4: Test the Workflows

Before waiting for the scheduled runs, test each workflow manually:

1. Go to **Actions** tab
2. Click on a workflow (e.g., "Refresh RSS Feeds")
3. Click **Run workflow** → **Run workflow**
4. Wait for the workflow to complete
5. Check the logs to verify success

Repeat for all three workflows.

## Workflow Schedules

| Workflow | Schedule | Cron Expression | Description |
|----------|----------|----------------|-------------|
| Refresh RSS Feeds | Every 60 min | `0 * * * *` | Updates content.json with latest stories |
| Send Daily Newsletter | Daily 6 AM PST | `0 14 * * *` | Sends to daily subscribers |
| Send Weekly Newsletter | Sunday 6 AM PST | `0 14 * * 0` | Sends to weekly subscribers |

**Note:** GitHub Actions uses UTC time. 6 AM PST = 14:00 UTC (adjust for daylight saving time if needed).

## Monitoring

### View Workflow Runs
1. Go to **Actions** tab in your repository
2. Click on any workflow to see run history
3. Click on a specific run to view detailed logs

### Notifications
- GitHub will email you if a workflow fails
- Configure notification preferences in **Settings** → **Notifications**

### Troubleshooting

**Workflow not running:**
- Check that secrets are configured correctly
- Verify the repository has Actions enabled
- Check workflow syntax in YAML files

**API endpoint errors:**
- Verify `FLESHBOOGIE_URL` points to your deployed site
- Ensure `CRON_SECRET` matches the one in your environment variables
- Check that your site is accessible (not in maintenance mode)

**Newsletter not sending:**
- Verify you have subscribers in the database
- Check that `RESEND_API_KEY` is configured on your server
- Review workflow logs for detailed error messages

## Manual Triggers

All workflows can be triggered manually:

1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Choose the branch (usually `main`)
5. Click **Run workflow**

This is useful for:
- Testing after configuration changes
- Sending newsletters outside the regular schedule
- Refreshing feeds immediately after adding new sources

## Disabling Workflows

To temporarily disable a workflow:

1. Go to **Actions** tab
2. Click on the workflow
3. Click the **⋯** menu (top right)
4. Select **Disable workflow**

To re-enable, follow the same steps and select **Enable workflow**.

## Cost

GitHub Actions is free for public repositories and includes 2,000 minutes/month for private repositories on the free plan.

Each workflow run takes approximately:
- RSS Refresh: ~3 minutes
- Daily Newsletter: ~5 minutes
- Weekly Newsletter: ~5 minutes

**Monthly usage estimate:**
- RSS Refresh: 24 runs/day × 3 min = 72 min/day = ~2,160 min/month
- Daily Newsletter: 1 run/day × 5 min = 5 min/day = ~150 min/month
- Weekly Newsletter: 4 runs/month × 5 min = ~20 min/month
- **Total: ~2,330 minutes/month**

**Note:** This is within the free tier (2,000 minutes/month for private repos). Public repositories have unlimited minutes.

## Alternative: Further Reduce Frequency

If you need to reduce GitHub Actions usage further, edit the RSS refresh schedule:

**Every 2 hours:**
```yaml
schedule:
  - cron: '0 */2 * * *'  # Every 2 hours
```

**Every 3 hours:**
```yaml
schedule:
  - cron: '0 */3 * * *'  # Every 3 hours
```

This would reduce monthly usage to ~1,080-1,440 minutes.

## Your Secrets

**FLESHBOOGIE_URL:**
```
https://fleshboogie.com
```

**CRON_SECRET:**
```
a7f3e9d2c8b1f4a6e5d9c2b7f8a3e1d4c9b6f2a8e7d3c1b5f9a4e2d8c6b3f7a1
```

## Next Steps

1. ✅ Push workflow files to GitHub
2. ✅ Configure GitHub secrets (FLESHBOOGIE_URL, CRON_SECRET)
3. ✅ Enable GitHub Actions
4. ✅ Test each workflow manually
5. ✅ Monitor first scheduled runs
6. ✅ Adjust frequency if needed to stay within free tier

---

**Need help?** Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or review workflow logs for detailed error messages.
