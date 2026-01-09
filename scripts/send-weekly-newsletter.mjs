import { Resend } from 'resend';
import { drizzle } from 'drizzle-orm/mysql2';
import { and, eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { newsletterSubscribers } from '../drizzle/schema.ts';
import { curateMorningEmail } from './curate-morning-email.mjs';

// Initialize database connection
const db = drizzle(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);

// Check if newsletter is paused
const NEWSLETTER_PAUSED = process.env.NEWSLETTER_PAUSED === 'true';

if (NEWSLETTER_PAUSED) {
  console.log('⏸️  Newsletter is currently paused (NEWSLETTER_PAUSED=true)');
  console.log('   To resume, set NEWSLETTER_PAUSED=false in Settings → Secrets');
  process.exit(0);
}

// Read current content
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Curate content before sending
console.log('🎯 Curating weekly digest content...');
await curateMorningEmail();

// Load curated content
const curatedPath = path.join(__dirname, '..', 'client', 'public', 'data', 'curated-morning.json');
const curated = JSON.parse(fs.readFileSync(curatedPath, 'utf-8'));

// Format date
const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// Build email HTML template with curated content
function buildEmailHTML() {
  const { newsletter, stories } = curated;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Boogie Blast - Weekly Digest</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #000;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 48px;
      font-weight: 900;
      letter-spacing: -2px;
      margin: 0;
      color: #000;
    }
    .tagline {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 10px 0 0 0;
      color: #666;
    }
    .date {
      font-size: 14px;
      color: #666;
      margin: 20px 0;
      text-align: center;
    }
    .weekly-badge {
      display: inline-block;
      background: #000;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 16px;
      margin: 20px auto;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .splash {
      margin: 30px 0;
      padding: 30px;
      background: #000;
      color: #fff;
    }
    .splash-headline {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.2;
      margin: 0;
      text-transform: uppercase;
    }
    .splash-headline a {
      color: #fff;
      text-decoration: none;
    }
    .curation-badge {
      display: inline-block;
      background: #ff0000;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .section {
      margin: 40px 0;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .story {
      margin: 20px 0;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }
    .story:last-child {
      border-bottom: none;
    }
    .story-title {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 5px 0;
    }
    .story-title a {
      color: #000;
      text-decoration: none;
    }
    .story-title a:hover {
      text-decoration: underline;
    }
    .story-meta {
      font-size: 11px;
      color: #999;
      margin-top: 5px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #000;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #000;
      text-decoration: none;
    }
    .unsubscribe {
      margin-top: 20px;
      font-size: 11px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="logo">FLESHBOOGIE</h1>
    <p class="tagline">Music • Culture • News • Whatever</p>
    <div class="weekly-badge">📅 WEEKLY DIGEST</div>
  </div>

  <div class="date">${dateStr}</div>

  ${newsletter.leadStory ? `
  <div class="splash">
    <div class="curation-badge">🎯 STORY OF THE WEEK</div>
    <h2 class="splash-headline">
      <a href="${newsletter.leadStory.url}">${newsletter.leadStory.title}</a>
    </h2>
  </div>
  ` : ''}

  ${newsletter.deepDive && newsletter.deepDive.length > 0 ? `
  <div class="section">
    <div class="section-title">📚 Deep Dive</div>
    ${newsletter.deepDive.map(story => `
      <div class="story">
        <h3 class="story-title">
          <a href="${story.url}">${story.title}</a>
        </h3>
        <div class="story-meta">
          Impact: ${(story.scores.impact * 100).toFixed(0)}% | 
          Engagement: ${(story.scores.engagement * 100).toFixed(0)}%
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${newsletter.discovery && newsletter.discovery.length > 0 ? `
  <div class="section">
    <div class="section-title">✨ Discovery</div>
    ${newsletter.discovery.map(story => `
      <div class="story">
        <h3 class="story-title">
          <a href="${story.url}">${story.title}</a>
        </h3>
        <div class="story-meta">
          Discovery: ${(story.scores.discovery * 100).toFixed(0)}%
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${newsletter.conversation && newsletter.conversation.length > 0 ? `
  <div class="section">
    <div class="section-title">💬 Conversation</div>
    ${newsletter.conversation.map(story => `
      <div class="story">
        <h3 class="story-title">
          <a href="${story.url}">${story.title}</a>
        </h3>
        <div class="story-meta">
          Engagement: ${(story.scores.engagement * 100).toFixed(0)}%
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${newsletter.wildcard && newsletter.wildcard.length > 0 ? `
  <div class="section">
    <div class="section-title">🎲 Wildcard</div>
    ${newsletter.wildcard.map(story => `
      <div class="story">
        <h3 class="story-title">
          <a href="${story.url}">${story.title}</a>
        </h3>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>FLESHBOOGIE℠</strong></p>
    <p>Curated by Quantum Curation v1.0</p>
    <p><a href="https://fleshboogie.com">Visit fleshboogie.com</a></p>
    <p><a href="https://x.com/fleshboogie">Follow @fleshboogie on X</a></p>
    <p><a href="https://fleshboogie.com/preferences">Manage your preferences</a></p>
    <p class="unsubscribe">
      You're receiving this because you subscribed to The Boogie Blast (Weekly).<br>
      <a href="https://fleshboogie.com/unsubscribe?email={{email}}">Unsubscribe</a> | <a href="https://fleshboogie.com/privacy">Privacy Policy</a>
    </p>
  </div>
</body>
</html>
`;
}

// Send newsletter to all weekly subscribers
async function sendWeeklyNewsletter() {
  try {
    // Get all weekly subscribers
    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.frequency, 'weekly'),
          eq(newsletterSubscribers.active, true)
        )
      );

    console.log(`📧 Sending weekly newsletter to ${subscribers.length} subscribers...`);

    if (subscribers.length === 0) {
      console.log('✅ No weekly subscribers found');
      return;
    }

    const emailHTML = buildEmailHTML();

    // Send emails with delay to avoid rate limiting (Resend allows 2 req/sec)
    for (const subscriber of subscribers) {
      try {
        const result = await resend.emails.send({
          from: 'FLESHBOOGIE <hello@fleshboogie.com>',
          to: subscriber.email,
          subject: `The Boogie Blast - Weekly Digest (${dateStr})`,
          html: emailHTML.replace('{{email}}', subscriber.email)
        });

        console.log(`✅ Sent to ${subscriber.email} (ID: ${result.id})`);

        // Delay 600ms between sends (allows ~2 emails/second, within Resend rate limit)
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
      }
    }

    console.log('🎉 Weekly newsletter sent successfully!');
  } catch (error) {
    console.error('❌ Error sending weekly newsletter:', error);
    throw error;
  }
}

// Run the script
sendWeeklyNewsletter();
