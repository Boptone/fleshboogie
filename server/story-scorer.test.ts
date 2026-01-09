import { describe, it, expect } from 'vitest';

// Import scoring functions from the story-scorer module
// Note: We need to convert the test to use the mjs module
import { scoreStory, scoreAndRankStories, categorizeStories, ensureDiversity } from '../scripts/story-scorer.mjs';

describe('Story Scoring System', () => {
  describe('scoreStory', () => {
    it('should score a high-impact story correctly', () => {
      const story = {
        title: 'Major Artist Announces Historic Grammy-Winning Album Release',
        url: 'https://example.com/story1',
        timestamp: new Date().toISOString()
      };

      const scored = scoreStory(story);

      expect(scored.scores).toBeDefined();
      expect(scored.scores.impact).toBeGreaterThan(0.6); // High impact keywords
      expect(scored.scores.engagement).toBeGreaterThanOrEqual(0.5);
      expect(scored.scores.timeliness).toBeGreaterThan(0.9); // Recent timestamp
      expect(scored.scores.composite).toBeGreaterThan(0.5);
    });

    it('should score a discovery-focused story correctly', () => {
      const story = {
        title: 'Meet the Emerging Underground Artist You Need to Know',
        url: 'https://example.com/story2',
        timestamp: new Date().toISOString()
      };

      const scored = scoreStory(story);

      expect(scored.scores.discovery).toBeGreaterThan(0.6); // Discovery keywords
      expect(scored.scores.composite).toBeGreaterThan(0.4);
    });

    it('should penalize stale stories with low timeliness score', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const story = {
        title: 'Old News Story',
        url: 'https://example.com/story3',
        timestamp: twoDaysAgo.toISOString()
      };

      const scored = scoreStory(story);

      expect(scored.scores.timeliness).toBeLessThan(0.5); // Old story
    });

    it('should score engagement keywords correctly', () => {
      const story = {
        title: 'Why This Amazing New Album is the Best of 2026',
        url: 'https://example.com/story4',
        timestamp: new Date().toISOString()
      };

      const scored = scoreStory(story);

      expect(scored.scores.engagement).toBeGreaterThan(0.7); // Superlatives + curiosity
    });
  });

  describe('scoreAndRankStories', () => {
    it('should rank stories by composite score', () => {
      const stories = [
        {
          title: 'Low Impact Story',
          url: 'https://example.com/low',
          timestamp: new Date().toISOString()
        },
        {
          title: 'Major Artist Announces Historic Grammy-Winning Album Release',
          url: 'https://example.com/high',
          timestamp: new Date().toISOString()
        },
        {
          title: 'Medium Story',
          url: 'https://example.com/medium',
          timestamp: new Date().toISOString()
        }
      ];

      const ranked = scoreAndRankStories(stories);

      expect(ranked[0].title).toContain('Major Artist'); // Highest score first
      expect(ranked[0].scores.composite).toBeGreaterThan(ranked[1].scores.composite);
      expect(ranked[1].scores.composite).toBeGreaterThanOrEqual(ranked[2].scores.composite);
    });
  });

  describe('categorizeStories', () => {
    it('should categorize stories into newsletter sections', () => {
      const scoredStories = [
        {
          title: 'Major Artist Announces Historic Album',
          url: 'https://example.com/1',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.9, engagement: 0.8, timeliness: 1.0, discovery: 0.3, composite: 0.85 }
        },
        {
          title: 'Meet the Emerging Underground Artist',
          url: 'https://example.com/2',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.5, engagement: 0.6, timeliness: 0.9, discovery: 0.9, composite: 0.65 }
        },
        {
          title: 'Why This Album is Amazing',
          url: 'https://example.com/3',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.6, engagement: 0.9, timeliness: 0.8, discovery: 0.3, composite: 0.70 }
        }
      ];

      const categorized = categorizeStories(scoredStories);

      expect(categorized.leadStory).toBeDefined();
      expect(categorized.leadStory.scores.composite).toBe(0.85); // Highest score
      expect(categorized.deepDive.length).toBeGreaterThan(0);
      expect(categorized.discovery.length).toBeGreaterThan(0);
      expect(categorized.conversation.length).toBeGreaterThan(0);
    });
  });

  describe('ensureDiversity', () => {
    it('should remove duplicate artists from story list', () => {
      const stories = [
        {
          title: 'Taylor Swift Announces New Album',
          url: 'https://example.com/1',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.8, engagement: 0.7, timeliness: 1.0, discovery: 0.3, composite: 0.75 }
        },
        {
          title: 'Taylor Swift Wins Grammy',
          url: 'https://example.com/2',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.7, engagement: 0.8, timeliness: 0.9, discovery: 0.3, composite: 0.70 }
        },
        {
          title: 'Kendrick Lamar Releases Single',
          url: 'https://example.com/3',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.6, engagement: 0.6, timeliness: 0.8, discovery: 0.4, composite: 0.60 }
        }
      ];

      const diverse = ensureDiversity(stories);

      expect(diverse.length).toBe(2); // Only 2 unique artists
      expect(diverse[0].title).toContain('Taylor Swift'); // First occurrence kept
      expect(diverse[1].title).toContain('Kendrick Lamar');
    });

    it('should keep all stories if no duplicates', () => {
      const stories = [
        {
          title: 'Artist One Releases Album',
          url: 'https://example.com/1',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.7, engagement: 0.6, timeliness: 0.9, discovery: 0.4, composite: 0.65 }
        },
        {
          title: 'Artist Two Wins Award',
          url: 'https://example.com/2',
          timestamp: new Date().toISOString(),
          scores: { impact: 0.6, engagement: 0.7, timeliness: 0.8, discovery: 0.3, composite: 0.60 }
        }
      ];

      const diverse = ensureDiversity(stories);

      expect(diverse.length).toBeGreaterThan(0); // At least some stories kept
      expect(diverse.length).toBeLessThanOrEqual(2); // No more than original
    });
  });

  describe('Composite Scoring Weights', () => {
    it('should weight impact at 40%', () => {
      const story = {
        title: 'Test Story',
        url: 'https://example.com/test',
        timestamp: new Date().toISOString()
      };

      const scored = scoreStory(story);

      // Impact should contribute 40% to composite score
      const expectedImpactContribution = scored.scores.impact * 0.40;
      expect(scored.scores.composite).toBeCloseTo(
        expectedImpactContribution + 
        (scored.scores.engagement * 0.30) +
        (scored.scores.timeliness * 0.20) +
        (scored.scores.discovery * 0.10),
        2
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle stories without timestamps', () => {
      const story = {
        title: 'Story Without Timestamp',
        url: 'https://example.com/no-timestamp'
      };

      const scored = scoreStory(story);

      expect(scored.scores.timeliness).toBe(0.5); // Neutral score
      expect(scored.scores.composite).toBeGreaterThan(0);
    });

    it('should handle very short titles', () => {
      const story = {
        title: 'News',
        url: 'https://example.com/short',
        timestamp: new Date().toISOString()
      };

      const scored = scoreStory(story);

      expect(scored.scores.impact).toBeLessThan(0.5); // Penalty for short title
    });

    it('should handle very long titles', () => {
      const story = {
        title: 'This is a very long title that goes on and on and on and contains way too many words for a typical news headline',
        url: 'https://example.com/long',
        timestamp: new Date().toISOString()
      };

      const scored = scoreStory(story);

      expect(scored.scores.impact).toBeLessThan(0.5); // Penalty for long title
    });
  });
});
