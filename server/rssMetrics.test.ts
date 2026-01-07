import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("RSS Metrics System", () => {
  describe("Database Functions", () => {
    it("should retrieve RSS source metrics", async () => {
      const metrics = await db.getRSSSourceMetrics();
      
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
      
      // Check structure of first metric
      if (metrics.length > 0) {
        const firstMetric = metrics[0];
        expect(firstMetric).toHaveProperty('source_name');
        expect(firstMetric).toHaveProperty('source_url');
        expect(firstMetric).toHaveProperty('category');
        expect(firstMetric).toHaveProperty('is_enabled');
        expect(firstMetric).toHaveProperty('total_fetches');
        expect(firstMetric).toHaveProperty('success_rate');
        expect(firstMetric).toHaveProperty('average_quality_score');
      }
    });

    it("should filter sources by category", async () => {
      const allMetrics = await db.getRSSSourceMetrics();
      
      const musicSources = allMetrics.filter(m => m.category === 'music');
      const techSources = allMetrics.filter(m => m.category === 'tech');
      const entertainmentSources = allMetrics.filter(m => m.category === 'entertainment');
      const cultureSources = allMetrics.filter(m => m.category === 'culture');
      
      expect(musicSources.length).toBeGreaterThan(0);
      expect(techSources.length).toBeGreaterThan(0);
      expect(entertainmentSources.length).toBeGreaterThan(0);
      expect(cultureSources.length).toBeGreaterThan(0);
      
      console.log(`Category breakdown: Music=${musicSources.length}, Tech=${techSources.length}, Entertainment=${entertainmentSources.length}, Culture=${cultureSources.length}`);
    });

    it("should toggle RSS source enabled status", async () => {
      const metrics = await db.getRSSSourceMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      
      const testSource = metrics[0];
      const originalStatus = testSource.is_enabled;
      
      // Toggle to opposite status
      await db.toggleRSSSource(testSource.source_url, originalStatus === 0);
      
      // Verify the change
      const updatedMetrics = await db.getRSSSourceMetrics();
      const updatedSource = updatedMetrics.find(m => m.source_url === testSource.source_url);
      
      expect(updatedSource).toBeDefined();
      expect(updatedSource!.is_enabled).toBe(originalStatus === 0 ? 1 : 0);
      
      // Toggle back to original status
      await db.toggleRSSSource(testSource.source_url, originalStatus === 1);
      
      // Verify restored
      const restoredMetrics = await db.getRSSSourceMetrics();
      const restoredSource = restoredMetrics.find(m => m.source_url === testSource.source_url);
      
      expect(restoredSource).toBeDefined();
      expect(restoredSource!.is_enabled).toBe(originalStatus);
    });

    it("should retrieve detailed metrics for a specific source", async () => {
      const metrics = await db.getRSSSourceMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      
      const testSource = metrics[0];
      const details = await db.getRSSSourceDetails(testSource.source_url);
      
      expect(details).toBeDefined();
      expect(details).toHaveProperty('config');
      expect(details).toHaveProperty('recentMetrics');
      
      expect(details!.config).toBeDefined();
      expect(details!.config!.sourceUrl).toBe(testSource.source_url);
      expect(details!.config!.sourceName).toBe(testSource.source_name);
      
      expect(Array.isArray(details!.recentMetrics)).toBe(true);
    });

    it("should have all 84 RSS sources initialized", async () => {
      const metrics = await db.getRSSSourceMetrics();
      
      expect(metrics.length).toBe(84);
      
      // Verify all sources are enabled by default
      const enabledSources = metrics.filter(m => m.is_enabled === 1);
      expect(enabledSources.length).toBe(84);
      
      // Verify all have initial quality score of 0 (not yet tracked)
      const allHaveZeroQuality = metrics.every(m => m.average_quality_score === 0);
      expect(allHaveZeroQuality).toBe(true);
    });

    it("should have proper category distribution", async () => {
      const metrics = await db.getRSSSourceMetrics();
      
      const categoryCounts = metrics.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Verify we have all expected categories
      expect(categoryCounts).toHaveProperty('music');
      expect(categoryCounts).toHaveProperty('tech');
      expect(categoryCounts).toHaveProperty('entertainment');
      expect(categoryCounts).toHaveProperty('culture');
      
      // Music should be the largest category (it's the primary focus)
      expect(categoryCounts.music).toBeGreaterThan(categoryCounts.tech);
      expect(categoryCounts.music).toBeGreaterThan(categoryCounts.entertainment);
      expect(categoryCounts.music).toBeGreaterThan(categoryCounts.culture);
      
      console.log('Category distribution:', categoryCounts);
    });
  });

  describe("RSS Source Configuration", () => {
    it("should have valid URLs for all sources", async () => {
      const metrics = await db.getRSSSourceMetrics();
      
      for (const metric of metrics) {
        expect(metric.source_url).toMatch(/^https?:\/\/.+/);
      }
    });

    it("should have unique source URLs", async () => {
      const metrics = await db.getRSSSourceMetrics();
      const urls = metrics.map(m => m.source_url);
      const uniqueUrls = new Set(urls);
      
      expect(uniqueUrls.size).toBe(urls.length);
    });

    it("should have non-empty source names", async () => {
      const metrics = await db.getRSSSourceMetrics();
      
      for (const metric of metrics) {
        expect(metric.source_name).toBeTruthy();
        expect(metric.source_name.length).toBeGreaterThan(0);
      }
    });
  });
});
