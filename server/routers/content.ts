import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, "../../client/public/data/content.json");

const LinkSchema = z.object({
  title: z.string(),
  url: z.string(),
  timestamp: z.string().optional(),
});

const ContentSchema = z.object({
  splash: z.object({
    headline: z.string(),
    url: z.string(),
    image: z.string().optional(),
  }),
  mainColumn: z.array(LinkSchema),
  column1: z.array(LinkSchema),
  column2: z.array(LinkSchema),
  column3: z.array(LinkSchema),
});

export const contentRouter = router({
  get: publicProcedure.query(async () => {
    try {
      const data = await fs.readFile(contentPath, "utf-8");
      const content = JSON.parse(data);
      return ContentSchema.parse(content);
    } catch (error) {
      // Return default structure if file doesn't exist or is invalid
      return {
        splash: { headline: "", url: "", image: "" },
        mainColumn: [],
        column1: [],
        column2: [],
        column3: [],
      };
    }
  }),

  update: adminProcedure
    .input(ContentSchema)
    .mutation(async ({ input }) => {
      try {
        // Read existing content to preserve automated section
        let existingContent: any = {};
        try {
          const data = await fs.readFile(contentPath, "utf-8");
          existingContent = JSON.parse(data);
        } catch (error) {
          // File doesn't exist yet, that's okay
        }

        // Merge manual content with automated feeds
        const updatedContent = {
          ...input,
          automated: existingContent.automated || [],
          lastUpdated: new Date().toISOString(),
        };

        await fs.writeFile(
          contentPath,
          JSON.stringify(updatedContent, null, 2),
          "utf-8"
        );

        return { success: true };
      } catch (error) {
        throw new Error("Failed to save content");
      }
    }),
});
