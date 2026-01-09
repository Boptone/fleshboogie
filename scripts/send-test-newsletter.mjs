import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { curateMorningEmail } from './curate-morning-email.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

// Curate content first
console.log('🎯 Curating newsletter content...');
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

// Build email HTML with dark mode fixes
function buildEmailHTML() {
  const { newsletter } = curated;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>The Boogie Blast - TEST</title>
  <style>
    /* Prevent dark mode from affecting email */
    :root {
      color-scheme: light only;
      supported-color-schemes: light;
    }
    
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #000000 !important;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff !important;
    }
    
    /* Force white background on all containers */
    * {
      background-color: inherit;
    }
    
    /* Prevent iOS/Android dark mode overrides */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      .header, .section, .footer, .splash, .story, .test-banner {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
    }
    .test-banner {
      background-color: #ff0000 !important;
      color: #ffffff !important;
      padding: 15px;
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
      border: 3px solid #000000;
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
      color: #000000 !important;
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
    .splash {
      margin: 30px 0;
      padding: 30px;
      background: #000000 !important;
      color: #ffffff !important;
    }
    .splash-headline {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.2;
      margin: 0;
      text-transform: uppercase;
      color: #ffffff !important;
    }
    .splash-headline a {
      color: #ffffff !important;
      text-decoration: none;
    }
    .curation-badge {
      display: inline-block;
      background: #ff0000 !important;
      color: #ffffff !important;
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
      color: #000000 !important;
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
      color: #000000 !important;
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
  <div class="test-banner">
    🧪 TEST EMAIL - Dark Mode Verification
  </div>

  <div class="header">
    <h1 class="logo">FLESHBOOGIE</h1>
    <p class="tagline">Music • Culture • News • Whatever</p>
  </div>

  <div class="date">${dateStr}</div>

  ${newsletter.leadStory ? `
  <div class="splash">
    <div class="curation-badge">🎯 LEAD STORY</div>
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
    <p class="unsubscribe">
      🧪 This is a TEST email to verify dark mode rendering.<br>
      Expected: White background with black text on iOS/Android dark mode.<br>
      You are not subscribed to the newsletter.
    </p>
  </div>
</body>
</html>
`;
}

// Send test email
async function sendTestNewsletter() {
  try {
    console.log('📧 Sending test newsletter to scottiediablo@icloud.com...\n');
    
    const emailHTML = buildEmailHTML();
    
    const { data, error } = await resend.emails.send({
      from: 'FLESHBOOGIE <hello@fleshboogie.com>',
      to: ['scottiediablo@icloud.com'],
      subject: `[TEST] The Boogie Blast – ${dateStr}`,
      html: emailHTML,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      process.exit(1);
    }

    console.log('✅ Test newsletter sent successfully!');
    console.log('📬 Email ID:', data.id);
    console.log('📧 Sent to: scottiediablo@icloud.com');
    console.log(`📅 Date: ${dateStr}`);
    console.log('');
    console.log('📱 DARK MODE TEST INSTRUCTIONS:');
    console.log('   1. Check email on iPhone with iOS Mail app in dark mode');
    console.log('   2. Check email on Android with Gmail app in dark mode');
    console.log('');
    console.log('✅ EXPECTED: White background with black text');
    console.log('❌ IF DARK: Report back and I\'ll add additional fixes');
    console.log('');
    console.log('💡 Look for the red "TEST EMAIL" banner at the top');
    
  } catch (err) {
    console.error('❌ Failed to send newsletter:', err.message || err);
    process.exit(1);
  }
}

sendTestNewsletter();
