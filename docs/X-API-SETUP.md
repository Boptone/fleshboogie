# X (Twitter) API Setup Guide

This guide explains how to set up X API credentials for automated posting from FLESHBOOGIE.

## Overview

The auto-posting system posts top stories from FLESHBOOGIE to X (Twitter) automatically:
- **Frequency**: Every 3-4 hours (6-8 posts/day)
- **Selection**: Prioritizes splash headline, then main column, then automated stories
- **Format**: `[Headline] [URL] #music #culture`
- **Duplicate prevention**: Tracks posted stories to avoid reposting

## Step 1: Create X Developer Account

1. Go to [developer.x.com](https://developer.x.com)
2. Click "Sign up" or "Apply" for a developer account
3. Log in with your X account (@fleshboogie or your account)
4. Complete the application:
   - **Use case**: "Building a news aggregator bot"
   - **Description**: "Automated posting of curated music and culture news links"
   - **Will you make X content available to government entities?**: No
5. Accept the Developer Agreement
6. Verify your email address

**Note**: X offers a **Free tier** that allows **1,500 posts per month** (50/day), which is more than enough for 6-8 posts/day.

## Step 2: Create a Project and App

1. In the [X Developer Portal](https://developer.x.com/en/portal/dashboard), click "Create Project"
2. **Project name**: "FLESHBOOGIE Auto-Poster"
3. **Use case**: "Making a bot"
4. **Project description**: "Automated news aggregator posting curated music and culture stories"
5. Click "Next" and create an App:
   - **App name**: "fleshboogie-bot" (must be unique)
   - **Environment**: "Production"
6. Save your **API Key** and **API Secret** (you'll need these!)

## Step 3: Generate Access Tokens

1. In your App settings, go to the "Keys and tokens" tab
2. Under "Authentication Tokens", click "Generate" for **Access Token and Secret**
3. **App permissions**: Select "Read and Write" (required for posting)
4. Click "Generate"
5. Save your **Access Token** and **Access Token Secret** (you'll need these!)

**Important**: Save all 4 credentials securely. You won't be able to see them again!

## Step 4: Add Credentials to Environment Variables

You need to add 4 environment variables:

```bash
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_SECRET=your_access_token_secret_here
```

**How to add them:**

### Option A: Using Manus Management UI (Recommended)
1. Open the Manus Management UI (right panel)
2. Go to **Settings** → **Secrets**
3. Click "Add Secret" for each of the 4 variables:
   - Key: `X_API_KEY`, Value: (paste your API key)
   - Key: `X_API_SECRET`, Value: (paste your API secret)
   - Key: `X_ACCESS_TOKEN`, Value: (paste your access token)
   - Key: `X_ACCESS_SECRET`, Value: (paste your access token secret)

### Option B: Using .env file (Local development)
1. Create or edit `/home/ubuntu/fleshboogie/.env`
2. Add the 4 variables (see format above)
3. Restart the server

## Step 5: Test the Posting Script

Run the script manually to test:

```bash
cd /home/ubuntu/fleshboogie
node scripts/post-to-x.mjs
```

**Expected output (without credentials):**
```
🐦 FLESHBOOGIE X Auto-Posting Script
=====================================

📖 Loading content...
🎯 Selecting story to post...
✓ Selected: "MTV REWIND FAN SITE LAUNCHES WITH 27,000 CLASSIC VIDEOS..."
  Source: splash
  URL: https://...

📝 Tweet preview:
─────────────────────────────────────
MTV REWIND FAN SITE LAUNCHES WITH 27,000 CLASSIC VIDEOS... https://... #music #culture
─────────────────────────────────────
Length: 123/280 characters

⚠️  DRY RUN MODE (no X API credentials configured)
ℹ  Tweet formatted successfully but not posted.
```

**Expected output (with credentials):**
```
🚀 Posting to X...
✓ Posted successfully! Tweet ID: 1234567890
✓ Marked story as posted.
```

## Step 6: Schedule Automatic Posting

The posting script is already scheduled to run every 3 hours. No additional setup needed!

**Schedule**: Posts at 12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm (8 times/day)

## Troubleshooting

### Error: "X API credentials not configured"
- Make sure all 4 environment variables are set correctly
- Check for typos in variable names
- Restart the server after adding credentials

### Error: "403 Forbidden"
- Check that your App permissions are set to "Read and Write"
- Regenerate Access Token with correct permissions

### Error: "429 Too Many Requests"
- You've hit the rate limit (1,500 posts/month on free tier)
- Wait until the next month or upgrade to a paid plan

### Error: "twitter-api-v2 package not installed"
- Run: `pnpm add twitter-api-v2`

## API Limits (Free Tier)

- **Posts per month**: 1,500 (50/day average)
- **FLESHBOOGIE usage**: ~240/month (8/day)
- **Headroom**: Plenty! You're using only 16% of your quota

## Support

If you need help:
- X Developer Docs: [developer.x.com/en/docs](https://developer.x.com/en/docs)
- X API Support: [developer.x.com/en/support](https://developer.x.com/en/support)
- FLESHBOOGIE: hello@fleshboogie.com
