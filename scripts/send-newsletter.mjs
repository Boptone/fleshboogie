#!/usr/bin/env node
/**
 * The Boogie Blast Newsletter Sender
 * Sends daily newsletter via Resend API
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'onboarding@resend.dev';
const FROM_NAME = 'FLESHBOOGIE';

async function loadContent() {
  const contentPath = path.join(__dirname, '../client/public/data/content.json');
  const content = await fs.readFile(contentPath, 'utf-8');
  return JSON.parse(content);
}

async function loadTemplate() {
  const templatePath = path.join(__dirname, 'email-template.html');
  return await fs.readFile(templatePath, 'utf-8');
}

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timestamp) {
  if (!timestamp) return '[--:--]';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '[--:--]';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `[${hours}:${minutes}]`;
}

function generateStoriesHTML(stories) {
  if (!stories || stories.length === 0) {
    return '<p class="story">No stories available.</p>';
  }
  
  return stories.slice(0, 10).map(story => `
    <div class="story">
      <p class="story-time">${formatTime(story.timestamp)}</p>
      <a href="${story.url}" target="_blank" class="story-link">${story.title}</a>
    </div>
  `.trim()).join('\n');
}

async function buildEmailHTML(content) {
  let template = await loadTemplate();
  const date = formatDate();
  
  const splashHeadline = content.splash?.headline || 'No headline available';
  const splashUrl = content.splash?.url || 'https://fleshboogie.com';
  
  template = template.replace('{{SPLASH_HEADLINE}}', splashHeadline);
  template = template.replace('{{SPLASH_URL}}', splashUrl);
  template = template.replace(/{{DATE}}/g, date);
  
  const allStories = [];
  if (content.mainColumn) {
    content.mainColumn.forEach(story => {
      if (story.title && story.url) allStories.push(story);
    });
  }
  if (content.automated) {
    content.automated.forEach(story => {
      if (story.title && story.url) allStories.push(story);
    });
  }
  
  const storiesHTML = generateStoriesHTML(allStories);
  template = template.replace('{{MAIN_STORIES}}', storiesHTML);
  template = template.replace('{{UNSUBSCRIBE_URL}}', 'https://fleshboogie.com/unsubscribe');
  
  return template;
}

async function sendEmail(toEmail, htmlContent, subject) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }
  
  const resend = new Resend(RESEND_API_KEY);
  
  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [toEmail],
    subject: subject,
    html: htmlContent,
  });
  
  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
  
  return data;
}

async function main() {
  console.log('📧 The Boogie Blast Newsletter Sender\n');
  
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error('❌ Error: No email address provided');
    console.log('Usage: node scripts/send-newsletter.mjs test@email.com');
    process.exit(1);
  }
  
  console.log(`📬 Sending to: ${testEmail}\n`);
  
  const content = await loadContent();
  console.log(`✓ Loaded ${content.automated?.length || 0} stories`);
  
  const htmlContent = await buildEmailHTML(content);
  console.log(`✓ Email HTML generated (${htmlContent.length} characters)`);
  
  const date = formatDate();
  const subject = `The Boogie Blast - ${date}`;
  console.log(`📝 Subject: ${subject}\n`);
  
  if (!RESEND_API_KEY) {
    console.log('⚠️  DRY RUN MODE (no API key)');
    const previewPath = path.join(__dirname, '../newsletter-preview.html');
    await fs.writeFile(previewPath, htmlContent);
    console.log(`✓ Preview saved to: ${previewPath}`);
    return;
  }
  
  console.log('🚀 Sending via Resend...');
  const result = await sendEmail(testEmail, htmlContent, subject);
  
  console.log(`✓ Email sent successfully!`);
  console.log(`  Email ID: ${result.id}`);
  console.log(`  Recipient: ${testEmail}\n`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
