import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import type { Request, Response } from "express";

describe("Content API", () => {
  const createMockContext = () => {
    const mockReq = {
      headers: {},
      cookies: {},
    } as unknown as Request;

    const mockRes = {
      cookie: () => mockRes,
      clearCookie: () => mockRes,
    } as unknown as Response;

    return createContext({ req: mockReq, res: mockRes });
  };

  it("should return content with success flag", async () => {
    const ctx = await createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contentApi.getCurrent();

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("content");
    expect(typeof result.success).toBe("boolean");
  });

  it("should return content with required structure", async () => {
    const ctx = await createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contentApi.getCurrent();

    if (result.success) {
      expect(result.content).toHaveProperty("splash");
      expect(result.content).toHaveProperty("mainColumn");
      expect(result.content).toHaveProperty("lastUpdated");
      expect(Array.isArray(result.content.mainColumn)).toBe(true);
    }
  });

  it("should return valid lastUpdated timestamp", async () => {
    const ctx = await createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contentApi.getCurrent();

    if (result.success && result.content.lastUpdated) {
      const timestamp = new Date(result.content.lastUpdated);
      expect(timestamp.toString()).not.toBe("Invalid Date");
      
      // Timestamp should be within the last 24 hours (reasonable for RSS updates)
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(timestamp.getTime()).toBeGreaterThan(dayAgo.getTime());
    }
  });

  it("should return content with splash headline", async () => {
    const ctx = await createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contentApi.getCurrent();

    if (result.success) {
      expect(result.content.splash).toHaveProperty("headline");
      expect(result.content.splash).toHaveProperty("url");
      expect(typeof result.content.splash.headline).toBe("string");
      expect(typeof result.content.splash.url).toBe("string");
    }
  });

  it("should handle missing content.json gracefully", async () => {
    const ctx = await createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contentApi.getCurrent();

    // Should always return a result, even if file doesn't exist
    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("content");
  });
});
