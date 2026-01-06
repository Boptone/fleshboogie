# Fleshboogie Content Management Guide

## Overview

Fleshboogie is a hybrid manual/automated music and culture aggregator. The site updates automatically every hour with fresh RSS feeds, while you maintain full editorial control over the top stories.

---

## Content Structure

Your content lives in a single JSON file: `client/public/data/content.json`

### File Structure

```json
{
  "splash": {
    "headline": "YOUR MAIN HEADLINE IN ALL CAPS",
    "url": "https://link-to-article.com",
    "image": ""
  },
  "mainColumn": [
    {
      "title": "Story title",
      "url": "https://link.com",
      "timestamp": "14:32"
    }
  ],
  "column1": [...],
  "column2": [...],
  "column3": [...],
  "automated": [...],  // Auto-populated by RSS feeds
  "lastUpdated": "2026-01-06T15:00:00Z"
}
```

---

## How to Update Content

### Option 1: Edit via Manus Management UI

1. Open the **Code** panel in the Management UI
2. Navigate to `client/public/data/content.json`
3. Edit the file directly in the browser
4. Changes deploy automatically

### Option 2: Edit Locally (Advanced)

1. Clone your GitHub repository
2. Edit `client/public/data/content.json`
3. Commit and push changes
4. Site updates automatically via deployment

---

## Content Sections Explained

### 1. Splash Headline
**Purpose:** The most important story of the moment  
**Location:** Top of the page, massive Helvetica font  
**Best Practice:** Use all caps, keep it punchy and urgent

### 2. Main Column
**Purpose:** Top 5-7 stories you're hand-curating  
**Location:** Directly below splash, with timestamps  
**Best Practice:** Update throughout the day as news breaks

### 3. Three Columns (column1, column2, column3)
**Purpose:** Secondary stories, organized by your editorial judgment  
**Location:** Three-column grid below main content  
**Best Practice:** No fixed themes—arrange by importance and flow

### 4. Automated Feed ("Latest from the Wire")
**Purpose:** Fresh links pulled from RSS feeds every hour  
**Location:** Between main column and three-column grid  
**Management:** Fully automatic—no action needed from you

---

## Automated RSS System

### How It Works

1. Every hour, a GitHub Action runs `scripts/fetch-feeds.mjs`
2. The script fetches the latest headlines from:
   - Pitchfork
   - Consequence of Sound
   - (Other feeds can be added)
3. The top 20 most recent items are saved to `content.json` under `"automated"`
4. Your site automatically rebuilds and deploys

### Current RSS Sources

Edit `scripts/fetch-feeds.mjs` to add or remove feeds:

```javascript
const FEEDS = [
  'https://pitchfork.com/rss/news/',
  'https://consequenceofsound.net/feed/',
  // Add more here
];
```

### To Add New RSS Feeds

1. Find the RSS feed URL (usually `/feed` or `/rss`)
2. Add it to the `FEEDS` array in `scripts/fetch-feeds.mjs`
3. Commit and push the change
4. The next hourly update will include the new source

---

## Daily Workflow Recommendation

### Morning (9-10 AM)
- Review the automated "Latest from the Wire" section
- Promote the best 1-2 stories to your **Main Column**
- Set a strong **Splash Headline** for the day

### Midday (12-2 PM)
- Check for breaking news
- Update the **Splash** if a bigger story emerges
- Refresh the **Main Column** with new links

### Evening (5-7 PM)
- Final update for the day
- Ensure the **Three Columns** have fresh, interesting content
- Let the automated system handle overnight updates

---

## SEO & Discoverability

Your site is already optimized for:
- **Google Search** (sitemap submitted hourly)
- **Bing** (robots.txt allows all crawlers)
- **AI/LLMs** (JSON-LD structured data for GPT, Claude, Perplexity)

### What This Means
- Your curated links will appear in search results
- AI assistants can reference your site as a music news source
- The hourly update frequency signals "freshness" to search engines

---

## Domain Connection

To connect your `fleshboogie.com` domain:

1. Go to your domain registrar (where you bought the domain)
2. Find the **DNS Settings** or **Nameservers** section
3. You'll receive specific nameserver values from the Manus deployment
4. Update your domain's nameservers to point to the Manus hosting
5. DNS propagation takes 1-24 hours

**Note:** Detailed nameserver values will be provided after you click "Publish" in the Management UI.

---

## Troubleshooting

### Site not updating after I edit content.json?
- Check that your changes were committed to the GitHub repository
- The deployment happens automatically within 1-2 minutes

### Automated feeds not working?
- Check the GitHub Actions tab in your repository
- The workflow runs every hour at `:00` minutes
- Manual trigger: Go to Actions → "Update RSS Feeds" → "Run workflow"

### Want to disable automated feeds temporarily?
- Edit `content.json` and set `"automated": []`
- The section will disappear from the site

---

## Next Steps

1. **Customize the RSS sources** to match your taste
2. **Start curating** your first day of content
3. **Connect your domain** via the Manus Management UI
4. **Share the site** and build your audience

---

**Remember:** The site is designed to run itself 24/7. Your job is to be the tastemaker—elevate the best stories, set the tone, and let the automation handle the rest.
