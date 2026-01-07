import { Resend } from 'resend';
import { drizzle } from 'drizzle-orm/mysql2';
import { and, eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { newsletterSubscribers } from '../drizzle/schema.js';

// Initialize database connection
const db = drizzle(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);

// Read current content
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentPath = path.join(__dirname, '..', 'client', 'public', 'data', 'content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

// Format date
const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// Build email HTML template
function buildEmailHTML() {
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
    .badge {
      display: inline-block;
      background: #000;
      color: #fff;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 20px 0;
    }
    .date {
      font-size: 14px;
      color: #666;
      margin: 20px 0;
      text-align: center;
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
    .story-time {
      font-size: 12px;
      color: #999;
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
    <div class="badge">Weekly Digest</div>
  </div>

  <div class="date">${dateStr}</div>

  <div class="splash">
    <h2 class="splash-headline">
      <a href="${content.splash.url}">${content.splash.headline}</a>
    </h2>
  </div>

  <div class="section">
    <div class="section-title">This Week's Top Stories</div>
    ${content.mainColumn.slice(0, 10).map(story => `
      <div class="story">
        <h3 class="story-title">
          <a href="${story.url}">${story.title}</a>
        </h3>
        ${story.timestamp ? `<div class="story-time">${story.timestamp}</div>` : ''}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">More From This Week</div>
    ${content.automated.slice(0, 15).map(story => `
      <div class="story">
        <h3 class="story-title">
          <a href="${story.url}">${story.title}</a>
        </h3>
        ${story.timestamp ? `<div class="story-time">${story.timestamp}</div>` : ''}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p><strong>FLESHBOOGIE℠</strong></p>
    <p>Music, culture, and news – curated weekly</p>
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
    console.log('📧 Starting weekly newsletter send...');
    console.log(`📅 Date: ${dateStr}\n`);
    
    // Get all active weekly subscribers
    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .where(and(
        eq(newsletterSubscribers.isActive, 1),
        eq(newsletterSubscribers.frequency, 'weekly')
      ));
    
    if (subscribers.length === 0) {
      console.log('⚠️  No weekly subscribers found. Skipping send.');
      return;
    }
    
    console.log(`👥 Found ${subscribers.length} active weekly subscribers\n`);
    
    const emailHTML = buildEmailHTML();
    let successCount = 0;
    let errorCount = 0;
    
    // Send to each subscriber
    for (const subscriber of subscribers) {
      try {
        const personalizedHTML = emailHTML.replace('{{email}}', encodeURIComponent(subscriber.email));
        
        const { data, error } = await resend.emails.send({
          from: 'FLESHBOOGIE <hello@fleshboogie.com>',
          to: [subscriber.email],
          subject: `The Boogie Blast – Weekly Digest – ${dateStr}`,
          html: personalizedHTML,
        });

        if (error) {
          console.error(`❌ Failed to send to ${subscriber.email}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Sent to ${subscriber.email} (ID: ${data.id})`);
          successCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Error sending to ${subscriber.email}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Send Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📧 Total: ${subscribers.length}`);
    console.log('\n✅ Weekly newsletter send complete!');
    
  } catch (err) {
    console.error('❌ Failed to send weekly newsletter:', err);
    process.exit(1);
  }
}

sendWeeklyNewsletter();
