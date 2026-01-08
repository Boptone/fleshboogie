import { publicProcedure, router } from "../_core/trpc";
import fs from "fs";
import path from "path";

/**
 * Content API Router
 * Serves content.json dynamically so frontend always gets latest RSS updates
 * without requiring republish
 */
export const contentApiRouter = router({
  /**
   * Get current content (splash, main column, automated feeds)
   * This endpoint reads the content.json file that gets updated by RSS refresh
   */
  getCurrent: publicProcedure.query(async () => {
    const contentPath = path.resolve(
      process.cwd(),
      "dist",
      "public",
      "data",
      "content.json"
    );

    try {
      const contentData = await fs.promises.readFile(contentPath, "utf-8");
      const content = JSON.parse(contentData);
      return {
        success: true,
        content,
      };
    } catch (error) {
      console.error("[Content API] Failed to read content.json:", error);
      
      // Return empty structure if file doesn't exist
      return {
        success: false,
        content: {
          splash: { headline: "", url: "", image: "", pinned: false },
          mainColumn: [],
          column1: [],
          column2: [],
          column3: [],
          musicReleases: [],
          automated: [],
          lastUpdated: new Date().toISOString(),
        },
      };
    }
  }),
});
