import { router, protectedProcedure } from "../_core/trpc";

/**
 * GitHub Sync Router
 * Handles pulling latest content from GitHub without git conflicts
 */
export const githubSyncRouter = router({
  /**
   * Pull latest RSS content files from GitHub
   * This avoids git conflicts by only updating specific content files
   */
  pullLatestContent: protectedProcedure.mutation(async () => {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Fetch latest from GitHub
      await execAsync('git fetch github main', { cwd: process.cwd(), timeout: 30000 });
      
      // Copy only the RSS content files from GitHub (avoids conflicts with code changes)
      const contentFiles = [
        'client/public/data/content.json',
        'client/public/data/archive.json',
        'client/public/rss.xml',
        'client/public/atom.xml',
        'client/public/sitemap.xml'
      ];
      
      let filesUpdated = 0;
      for (const file of contentFiles) {
        try {
          await execAsync(`git checkout github/main -- ${file}`, { 
            cwd: process.cwd(), 
            timeout: 10000 
          });
          filesUpdated++;
        } catch (e) {
          console.error(`[GitHub Sync] Failed to update ${file}:`, e);
        }
      }

      return {
        success: true,
        message: `✓ Pulled latest content from GitHub (${filesUpdated} files updated). Now save a checkpoint in Manus UI to deploy.`,
        timestamp: new Date().toISOString(),
        filesUpdated,
      };
    } catch (error: any) {
      console.error('[GitHub Sync] Pull failed:', error);
      throw new Error(`Failed to pull from GitHub: ${error.message}`);
    }
  }),
});
