/**
 * FLESHBOOGIE Story Scoring System
 * Based on Quantum Curation Framework
 * 
 * Scores stories on 4 dimensions:
 * 1. Impact (40%) - Industry significance, cultural relevance
 * 2. Engagement (30%) - Social velocity, shareability potential
 * 3. Timeliness (20%) - Morning relevance, today utility
 * 4. Discovery (10%) - New artists, surprising insights
 */

// ============================================================================
// SCORING WEIGHTS (total = 100%)
// ============================================================================
const WEIGHTS = {
  impact: 0.40,
  engagement: 0.30,
  timeliness: 0.20,
  discovery: 0.10
};

// ============================================================================
// IMPACT SCORING (40%)
// ============================================================================

// High-impact keywords indicate industry significance
const IMPACT_KEYWORDS = {
  high: [
    // Major announcements
    'announces', 'launches', 'releases', 'debuts', 'unveils', 'drops',
    // Industry events
    'grammy', 'oscar', 'festival', 'tour', 'album', 'record deal',
    // Cultural moments
    'breakthrough', 'historic', 'first-ever', 'landmark', 'milestone',
    // Major publications/platforms
    'billboard', 'pitchfork', 'rolling stone', 'spotify', 'apple music'
  ],
  medium: [
    'premiere', 'interview', 'profile', 'feature', 'review', 'analysis',
    'collaboration', 'partnership', 'signs', 'joins'
  ],
  low: [
    'rumor', 'speculation', 'might', 'could', 'possibly', 'reportedly'
  ]
};

/**
 * Calculate impact score (0.0 - 1.0)
 * @param {Object} story - Story object with title, url, timestamp
 * @returns {number} Impact score
 */
function calculateImpactScore(story) {
  const title = story.title.toLowerCase();
  let score = 0.5; // baseline
  
  // Check for high-impact keywords (+0.3)
  const highMatches = IMPACT_KEYWORDS.high.filter(kw => title.includes(kw)).length;
  score += Math.min(highMatches * 0.1, 0.3);
  
  // Check for medium-impact keywords (+0.15)
  const mediumMatches = IMPACT_KEYWORDS.medium.filter(kw => title.includes(kw)).length;
  score += Math.min(mediumMatches * 0.05, 0.15);
  
  // Check for low-impact keywords (-0.2)
  const lowMatches = IMPACT_KEYWORDS.low.filter(kw => title.includes(kw)).length;
  score -= Math.min(lowMatches * 0.1, 0.2);
  
  // Title length penalty (clickbait tends to be short or very long)
  const wordCount = story.title.split(' ').length;
  if (wordCount < 5 || wordCount > 20) {
    score -= 0.1;
  }
  
  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// ENGAGEMENT SCORING (30%)
// ============================================================================

// Engagement keywords predict shareability
const ENGAGEMENT_KEYWORDS = {
  high: [
    // Emotional triggers
    'amazing', 'incredible', 'stunning', 'brilliant', 'powerful', 'beautiful',
    // Controversy/debate
    'controversial', 'debate', 'backlash', 'response', 'defends', 'criticizes',
    // Curiosity gaps
    'why', 'how', 'what', 'secret', 'behind', 'truth', 'reveals',
    // Superlatives
    'best', 'worst', 'greatest', 'most', 'never', 'always'
  ],
  medium: [
    'new', 'latest', 'exclusive', 'first', 'watch', 'listen', 'stream',
    'shares', 'talks', 'discusses', 'explains'
  ]
};

/**
 * Calculate engagement score (0.0 - 1.0)
 * @param {Object} story - Story object
 * @returns {number} Engagement score
 */
function calculateEngagementScore(story) {
  const title = story.title.toLowerCase();
  let score = 0.5; // baseline
  
  // Check for high-engagement keywords (+0.3)
  const highMatches = ENGAGEMENT_KEYWORDS.high.filter(kw => title.includes(kw)).length;
  score += Math.min(highMatches * 0.1, 0.3);
  
  // Check for medium-engagement keywords (+0.2)
  const mediumMatches = ENGAGEMENT_KEYWORDS.medium.filter(kw => title.includes(kw)).length;
  score += Math.min(mediumMatches * 0.05, 0.2);
  
  // Numbers in headlines increase engagement
  if (/\d+/.test(title)) {
    score += 0.1;
  }
  
  // Questions increase engagement
  if (title.includes('?')) {
    score += 0.1;
  }
  
  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// TIMELINESS SCORING (20%)
// ============================================================================

/**
 * Calculate timeliness score (0.0 - 1.0)
 * Stories published in last 24h score higher
 * @param {Object} story - Story object with timestamp
 * @returns {number} Timeliness score
 */
function calculateTimelinessScore(story) {
  if (!story.timestamp) {
    return 0.5; // neutral if no timestamp
  }
  
  const now = Date.now();
  const storyTime = new Date(story.timestamp).getTime();
  const ageHours = (now - storyTime) / (1000 * 60 * 60);
  
  // Scoring curve:
  // 0-6 hours: 1.0 (perfect freshness)
  // 6-12 hours: 0.9 (very fresh)
  // 12-24 hours: 0.7 (fresh)
  // 24-48 hours: 0.4 (stale)
  // 48+ hours: 0.2 (very stale)
  
  if (ageHours < 6) return 1.0;
  if (ageHours < 12) return 0.9;
  if (ageHours < 24) return 0.7;
  if (ageHours < 48) return 0.4;
  return 0.2;
}

// ============================================================================
// DISCOVERY SCORING (10%)
// ============================================================================

// Discovery keywords indicate emerging/underground content
const DISCOVERY_KEYWORDS = [
  'emerging', 'rising', 'new artist', 'debut', 'introduces', 'meet',
  'underground', 'independent', 'unsigned', 'diy', 'bedroom',
  'experimental', 'avant-garde', 'innovative', 'unique', 'fresh',
  'discover', 'hidden gem', 'you need to know', 'ones to watch'
];

/**
 * Calculate discovery score (0.0 - 1.0)
 * @param {Object} story - Story object
 * @returns {number} Discovery score
 */
function calculateDiscoveryScore(story) {
  const title = story.title.toLowerCase();
  let score = 0.3; // baseline (most stories are not discovery-focused)
  
  // Check for discovery keywords
  const matches = DISCOVERY_KEYWORDS.filter(kw => title.includes(kw)).length;
  score += Math.min(matches * 0.2, 0.7);
  
  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// COMPOSITE SCORING
// ============================================================================

/**
 * Calculate composite score for a story
 * @param {Object} story - Story object with title, url, timestamp
 * @returns {Object} Story with added scores
 */
export function scoreStory(story) {
  const impact = calculateImpactScore(story);
  const engagement = calculateEngagementScore(story);
  const timeliness = calculateTimelinessScore(story);
  const discovery = calculateDiscoveryScore(story);
  
  // Weighted composite score
  const compositeScore = 
    (impact * WEIGHTS.impact) +
    (engagement * WEIGHTS.engagement) +
    (timeliness * WEIGHTS.timeliness) +
    (discovery * WEIGHTS.discovery);
  
  return {
    ...story,
    scores: {
      impact,
      engagement,
      timeliness,
      discovery,
      composite: compositeScore
    }
  };
}

/**
 * Score multiple stories and sort by composite score
 * @param {Array} stories - Array of story objects
 * @returns {Array} Sorted stories with scores
 */
export function scoreAndRankStories(stories) {
  const scoredStories = stories.map(scoreStory);
  
  // Sort by composite score (descending)
  return scoredStories.sort((a, b) => 
    b.scores.composite - a.scores.composite
  );
}

/**
 * Categorize stories by type for newsletter structure
 * @param {Array} scoredStories - Stories with scores
 * @returns {Object} Categorized stories
 */
export function categorizeStories(scoredStories) {
  return {
    // Lead Story: Highest composite score
    leadStory: scoredStories[0] || null,
    
    // Deep Dive: High impact + high engagement (2-3 stories)
    deepDive: scoredStories
      .filter(s => s.scores.impact > 0.7 && s.scores.engagement > 0.6)
      .slice(0, 3),
    
    // Discovery: High discovery score (2-3 stories)
    discovery: scoredStories
      .filter(s => s.scores.discovery > 0.6)
      .slice(0, 3),
    
    // Conversation: High engagement (2 stories)
    conversation: scoredStories
      .filter(s => s.scores.engagement > 0.7)
      .slice(0, 2),
    
    // Wildcard: Interesting but doesn't fit other categories (1-2 stories)
    wildcard: scoredStories
      .filter(s => 
        s.scores.composite > 0.5 && 
        s.scores.composite < 0.7
      )
      .slice(0, 2)
  };
}

// ============================================================================
// DIVERSITY FILTER
// ============================================================================

/**
 * Ensure diversity in story selection (no duplicate artists/topics)
 * @param {Array} stories - Selected stories
 * @returns {Array} Deduplicated stories
 */
export function ensureDiversity(stories) {
  const seen = new Set();
  const diverse = [];
  
  for (const story of stories) {
    // Extract potential artist names (capitalized words)
    const words = story.title.split(' ');
    const entities = words.filter(w => /^[A-Z]/.test(w));
    
    // Check if we've seen this entity before
    const isDuplicate = entities.some(entity => seen.has(entity.toLowerCase()));
    
    if (!isDuplicate) {
      diverse.push(story);
      entities.forEach(entity => seen.add(entity.toLowerCase()));
    }
  }
  
  return diverse;
}
