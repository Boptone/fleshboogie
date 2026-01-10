# Daily Publishing Workflow for Fleshboogie

## Overview

Your Fleshboogie site uses **GitHub Actions** to automatically fetch fresh RSS content every hour and commit it to your GitHub repository. However, to deploy those updates to your live production site, you need to manually pull the changes into Manus and publish them.

This document explains the streamlined 2-step daily workflow to keep your site updated.

---

## The Complete System

### 1. Automatic Content Updates (GitHub Actions)
- **Frequency:** Every hour (on the hour)
- **What it does:** 
  - Fetches latest articles from 68 RSS sources
  - Filters content based on your keywords
  - Updates `content.json`, `archive.json`, `rss.xml`, `atom.xml`, and `sitemap.xml`
  - Commits changes to GitHub repository
- **Status:** ✅ **Already working** (no action needed)

### 2. Manual Deployment (You)
- **Frequency:** Once daily (or as often as you want fresh content on production)
- **What you do:**
  1. Pull latest content from GitHub into Manus
  2. Save a checkpoint
  3. Publish to production

---

## Daily Workflow (2 Steps)

### Step 1: Pull Latest Content from GitHub

1. Open your Fleshboogie project in Manus
2. Navigate to `/admin` page
3. Click the **"PULL FROM GITHUB"** button (blue button, top-right of Analytics section)
4. Wait for the green success message: *"✓ Pulled latest content from GitHub (5 files updated). Now save a checkpoint in Manus UI to deploy."*

**What this does:**
- Fetches the latest hourly RSS updates from your GitHub repository
- Updates your Manus sandbox with fresh content
- **Does NOT** deploy to production yet

---

### Step 2: Save Checkpoint & Publish

1. In the Manus UI, click the **checkpoint icon** (or use the Management UI)
2. Save a checkpoint with a description like: *"Daily content update - [date]"*
3. Once the checkpoint is saved, a **"Publish"** button will appear on the checkpoint card
4. Click **"Publish"** to deploy the updated content to your live site at fleshboogie.manus.space

**What this does:**
- Creates a snapshot of your updated content
- Deploys the changes to your production site
- Makes the fresh RSS content visible to your visitors

---

## Timing Recommendations

### Option A: Daily Morning Update (Recommended)
- **When:** 6-9 AM PST (your timezone)
- **Why:** Gives you fresh overnight content for the day
- **Time required:** ~2 minutes

### Option B: Multiple Updates Per Day
- **When:** Morning + Evening (or more)
- **Why:** Keeps your site ultra-fresh throughout the day
- **Time required:** ~2 minutes per update

### Option C: Weekly Update
- **When:** Once per week (e.g., Monday mornings)
- **Why:** Less frequent but still keeps content reasonably fresh
- **Time required:** ~2 minutes per week

---

## Troubleshooting

### "No changes detected" when saving checkpoint
**Cause:** You haven't pulled new content from GitHub yet, or GitHub Actions hasn't run since your last pull.

**Solution:** 
1. Check the timestamp on the "PULL FROM GITHUB" success message
2. Wait for the next hourly GitHub Actions run
3. Pull again and save checkpoint

---

### Content not updating on production site
**Cause:** You pulled from GitHub but forgot to publish.

**Solution:**
1. Save a checkpoint (if you haven't already)
2. Click the "Publish" button in the Manus UI

---

### GitHub Actions not running
**Cause:** GitHub secrets might be missing or workflow might be disabled.

**Solution:**
1. Check GitHub Actions tab in your repository
2. Verify `FLESHBOOGIE_URL` and `CRON_SECRET` secrets are configured
3. See `docs/GITHUB_ACTIONS_SETUP.md` for full setup instructions

---

## Summary

**Your daily routine:**
1. Open Manus → Fleshboogie project
2. Go to /admin → Click "PULL FROM GITHUB"
3. Save checkpoint → Click "Publish"
4. Done! ✅

**Total time:** ~2 minutes

---

## Future Automation Ideas

If you want to eliminate even these manual steps in the future, here are some options:

1. **Manus API Integration:** Contact Manus support to ask if they have an API for triggering deployments programmatically
2. **GitHub Pages:** Switch to GitHub Pages for fully automatic deployment (but lose Manus hosting features)
3. **Custom Webhook:** Set up a webhook that triggers Manus deployment when GitHub Actions completes

For now, the 2-step manual workflow is the most reliable and straightforward approach.

---

**Last Updated:** January 10, 2026
