#!/usr/bin/env node
/**
 * FLESHBOOGIE Morning Email Curation Script
 * 
 * Curates the best stories for morning newsletter delivery based on:
 * - Impact (40%): Industry significance, cultural relevance
 * - Engagement (30%): Social velocity, shareability potential
 * - Timeliness (20%): Morning relevance, today utility
 * - Discovery (10%): New artists, surprising insights
 * 
 * Usage: node scripts/curate-morning-email.mjs
 * Output: client/public/data/curated-morning.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scoreAndRankStories, categorizeStories, ensureDiversity } from './story-scorer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Input: Latest RSS content
  contentPath: path.join(__dirname, '..', 'client', 'public', 'data', 'content.json'),
  
  // Output: Curated morning selection
  outputPath: path.join(__dirname, '..', 'client', 'public', 'data', 'curated-morning.json'),
  
  // Newsletter structure (10 total stories)
  selection: {
    leadStory: 1,      // Most significant development
    deepDive: 3,       // Best analysis/context
    discovery: 3,      // Emerging talent/innovations
    conversation: 2,   // What experts are discussing
    wildcard: 1        // Unexpected but valuable
  }
};

// ============================================================================
// MAIN CURATION LOGIC
// ============================================================================

/**
 * Load and parse content.json
 */
function loadContent() {
  try {
    const content = JSON.parse(fs.readFileSync(CONFIG.contentPath, 'utf-8'));
    return content;
  } catch (error) {
    console.error('❌ Failed to load content.json:', error.message);
    process.exit(1);
  }
}

/**
 * Collect all stories from content.json
 */
function collectAllStories(content) {
  const stories = [];
  
  // Add splash headline
  if (content.splash && content.splash.headline) {
    stories.push({
      title: content.splash.headline,
      url: content.splash.url,
      timestamp: content.lastUpdated,
      source: 'splash'
    });
  }
  
  // Add main column stories
  if (content.mainColumn && Array.isArray(content.mainColumn)) {
    content.mainColumn.forEach(item => {
      stories.push({
        title: item.title,
        url: item.url,
        timestamp: item.timestamp || content.lastUpdated,
        source: 'mainColumn'
      });
    });
  }
  
  // Add automated stories (limit to last 50 for performance)
  if (content.automated && Array.isArray(content.automated)) {
    content.automated.slice(0, 50).forEach(item => {
      stories.push({
        title: item.title,
        url: item.url,
        timestamp: item.timestamp || content.lastUpdated,
        source: 'automated'
      });
    });
  }
  
  // Add music news stories
  if (content.musicReleases && Array.isArray(content.musicReleases)) {
    content.musicReleases.forEach(item => {
      stories.push({
        title: item.title,
        url: item.url,
        timestamp: item.timestamp || content.lastUpdated,
        source: 'musicReleases'
      });
    });
  }
  
  return stories;
}

/**
 * Select top stories for newsletter
 */
function selectTopStories(scoredStories) {
  // Remove duplicates by URL FIRST (before categorization)
  const uniqueStories = [];
  const seenUrls = new Set();
  
  for (const story of scoredStories) {
    if (!seenUrls.has(story.url)) {
      uniqueStories.push(story);
      seenUrls.add(story.url);
    }
  }
  
  console.log(`   Deduplicated: ${scoredStories.length} → ${uniqueStories.length} unique stories`);
  
  // Ensure diversity (no duplicate artists/topics)
  const diverseStories = ensureDiversity(uniqueStories);
  console.log(`   After diversity filter: ${diverseStories.length} stories`);
  
  // Categorize stories
  const categorized = categorizeStories(diverseStories);
  
  // Build newsletter structure
  const newsletter = {
    leadStory: categorized.leadStory,
    deepDive: categorized.deepDive.slice(0, CONFIG.selection.deepDive),
    discovery: categorized.discovery.slice(0, CONFIG.selection.discovery),
    conversation: categorized.conversation.slice(0, CONFIG.selection.conversation),
    wildcard: categorized.wildcard.slice(0, CONFIG.selection.wildcard)
  };
  
  // Flatten to single array for email template
  let selectedStories = [
    newsletter.leadStory,
    ...newsletter.deepDive,
    ...newsletter.discovery,
    ...newsletter.conversation,
    ...newsletter.wildcard
  ].filter(Boolean); // Remove nulls
  
  // Final deduplication pass (in case categories overlap)
  const finalUrls = new Set();
  selectedStories = selectedStories.filter(story => {
    if (finalUrls.has(story.url)) return false;
    finalUrls.add(story.url);
    return true;
  });
  
  return {
    newsletter,
    selectedStories: selectedStories.slice(0, 10) // Ensure max 10 stories
  };
}

/**
 * Generate curation report
 */
function generateReport(allStories, scoredStories, selectedStories) {
  console.log('\n📊 MORNING EMAIL CURATION REPORT');
  console.log('='.repeat(60));
  console.log(`Total stories analyzed: ${allStories.length}`);
  console.log(`Stories after scoring: ${scoredStories.length}`);
  console.log(`Stories selected: ${selectedStories.length}`);
  console.log('');
  
  console.log('📰 SELECTED STORIES:');
  console.log('-'.repeat(60));
  
  selectedStories.forEach((story, index) => {
    const scores = story.scores;
    console.log(`\n${index + 1}. ${story.title}`);
    console.log(`   Composite: ${scores.composite.toFixed(2)} | Impact: ${scores.impact.toFixed(2)} | Engagement: ${scores.engagement.toFixed(2)} | Timeliness: ${scores.timeliness.toFixed(2)} | Discovery: ${scores.discovery.toFixed(2)}`);
    console.log(`   Source: ${story.source} | URL: ${story.url.substring(0, 60)}...`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Curation complete!\n');
}

/**
 * Save curated content to JSON file
 */
function saveCuratedContent(newsletter, selectedStories, metadata) {
  const output = {
    curatedAt: new Date().toISOString(),
    totalAnalyzed: metadata.totalAnalyzed,
    totalSelected: selectedStories.length,
    newsletter,
    stories: selectedStories,
    metadata: {
      algorithm: 'Quantum Curation v1.0',
      weights: {
        impact: 0.40,
        engagement: 0.30,
        timeliness: 0.20,
        discovery: 0.10
      }
    }
  };
  
  try {
    fs.writeFileSync(CONFIG.outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`💾 Curated content saved to: ${CONFIG.outputPath}`);
  } catch (error) {
    console.error('❌ Failed to save curated content:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('🚀 Starting morning email curation...\n');
  
  // Load content
  const content = loadContent();
  console.log('✅ Loaded content.json');
  
  // Collect all stories
  const allStories = collectAllStories(content);
  console.log(`✅ Collected ${allStories.length} stories`);
  
  // Score and rank stories
  const scoredStories = scoreAndRankStories(allStories);
  console.log(`✅ Scored and ranked ${scoredStories.length} stories`);
  
  // Select top stories
  const { newsletter, selectedStories } = selectTopStories(scoredStories);
  console.log(`✅ Selected ${selectedStories.length} stories for newsletter`);
  
  // Generate report
  generateReport(allStories, scoredStories, selectedStories);
  
  // Save curated content
  saveCuratedContent(newsletter, selectedStories, {
    totalAnalyzed: allStories.length
  });
  
  console.log('🎉 Morning email curation complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as curateMorningEmail };
