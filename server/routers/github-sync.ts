import { router, protectedProcedure } from "../_core/trpc";
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * GitHub Sync Router
 * Handles pulling latest content from GitHub without git conflicts
 * Uses GitHub CLI (gh) to fetch files directly from repository
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

      // Files to pull from GitHub
      const contentFiles = [
        'client/public/data/content.json',
        'client/public/data/archive.json',
        'client/public/rss.xml',
        'client/public/atom.xml',
        'client/public/sitemap.xml'
      ];
      
      let filesUpdated = 0;
      const errors: string[] = [];
      
      for (const file of contentFiles) {
        try {
          // Use GitHub CLI to fetch file content from main branch
          const { stdout } = await execAsync(
            `gh api repos/Boptone/fleshboogie/contents/${file} --jq '.content' | base64 -d`,
            { 
              cwd: process.cwd(), 
              timeout: 15000,
              maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large files
            }
          );
          
          // Write the file to local filesystem
          const localPath = join(process.cwd(), file);
          await writeFile(localPath, stdout, 'utf8');
          filesUpdated++;
          console.log(`[GitHub Sync] Updated ${file}`);
        } catch (e: any) {
          const errorMsg = `Failed to update ${file}: ${e.message}`;
          console.error(`[GitHub Sync] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      if (filesUpdated === 0) {
        throw new Error(`No files were updated. Errors: ${errors.join(', ')}`);
      }

      return {
        success: true,
        message: `✓ Pulled latest content from GitHub (${filesUpdated}/${contentFiles.length} files updated). Now save a checkpoint in Manus UI to deploy.`,
        timestamp: new Date().toISOString(),
        filesUpdated,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      console.error('[GitHub Sync] Pull failed:', error);
      throw new Error(`Failed to pull from GitHub: ${error.message}`);
    }
  }),
});
