import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET || 'change-me-in-production';

// Middleware to check cron secret
function authenticateCron(req: any, res: any, next: any) {
  const secret = req.headers['x-cron-secret'] || req.query.secret;
  
  if (!secret || secret !== CRON_SECRET) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing cron secret',
    });
  }
  
  next();
}

/**
 * Health check endpoint
 * GET /api/cron/health?secret=YOUR_SECRET
 */
router.get('/health', authenticateCron, (req, res) => {
  res.json({
    success: true,
    message: 'Cron system is healthy',
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
});

/**
 * Diagnostic endpoint to check production environment
 * GET /api/cron/diagnostic (public for troubleshooting)
 */
router.get('/diagnostic', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const cwd = process.cwd();
    const scriptsPath = path.join(cwd, 'scripts');
    const fetchFeedsPath = path.join(scriptsPath, 'fetch-feeds.mjs');
    
    const diagnostic: any = {
      cwd: cwd,
      nodeEnv: process.env.NODE_ENV,
      scriptsExists: fs.existsSync(scriptsPath),
      fetchFeedsExists: fs.existsSync(fetchFeedsPath),
      distExists: fs.existsSync(path.join(cwd, 'dist')),
      distPublicExists: fs.existsSync(path.join(cwd, 'dist', 'public')),
      distPublicDataExists: fs.existsSync(path.join(cwd, 'dist', 'public', 'data')),
    };
    
    // Try to read first 500 chars of fetch-feeds.mjs to check version
    if (diagnostic.fetchFeedsExists) {
      try {
        const content = fs.readFileSync(fetchFeedsPath, 'utf8');
        diagnostic.scriptVersion = content.includes('musicReleases') ? 'v2.0 (with musicReleases)' : 'v1.0 (old version)';
        diagnostic.scriptPreview = content.substring(0, 500);
      } catch (err: any) {
        diagnostic.scriptReadError = err.message;
      }
    }
    
    res.json({
      success: true,
      diagnostic,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Refresh RSS feeds
 * POST /api/cron/refresh-feeds
 * Header: X-Cron-Secret: YOUR_SECRET
 */
router.post('/refresh-feeds', authenticateCron, async (req, res) => {
  try {
    console.log('[Cron] Starting RSS feed refresh...');
    
    const { stdout, stderr } = await execAsync(
      'node scripts/fetch-feeds.mjs',
      { 
        cwd: process.cwd(), 
        timeout: 180000, // 3 minute timeout
        env: { ...process.env, NODE_ENV: 'production' } // Ensure production mode
      }
    );

    console.log('[Cron] RSS feed refresh completed');
    console.log(stdout);
    
    if (stderr) {
      console.error('[Cron] RSS feed refresh warnings:', stderr);
    }

    res.json({
      success: true,
      message: 'RSS feeds refreshed successfully',
      output: stdout.split('\n').slice(-10).join('\n'), // Last 10 lines
    });
  } catch (error: any) {
    console.error('[Cron] RSS feed refresh failed:', error);
    res.status(500).json({
      success: false,
      error: `Failed to refresh feeds: ${error.message}`,
    });
  }
});

/**
 * Send daily newsletter
 * POST /api/cron/send-daily-newsletter
 * Header: X-Cron-Secret: YOUR_SECRET
 */
router.post('/send-daily-newsletter', authenticateCron, async (req, res) => {
  try {
    console.log('[Cron] Starting daily newsletter send in background...');
    
    // Respond immediately to avoid timeout
    res.json({
      success: true,
      message: 'Daily newsletter job started in background',
      timestamp: new Date().toISOString(),
    });
    
    // Run newsletter script in background (don't await)
    execAsync(
      'npx tsx scripts/send-daily-newsletter.mjs',
      { cwd: process.cwd(), timeout: 300000 } // 5 minute timeout
    ).then(({ stdout, stderr }) => {
      console.log('[Cron] Daily newsletter send completed');
      console.log(stdout);
      if (stderr) {
        console.error('[Cron] Daily newsletter warnings:', stderr);
      }
    }).catch((error: any) => {
      console.error('[Cron] Daily newsletter send failed:', error);
    });
    
  } catch (error: any) {
    console.error('[Cron] Failed to start daily newsletter:', error);
    res.status(500).json({
      success: false,
      error: `Failed to start daily newsletter: ${error.message}`,
    });
  }
});

/**
 * Send weekly newsletter
 * POST /api/cron/send-weekly-newsletter
 * Header: X-Cron-Secret: YOUR_SECRET
 */
router.post('/send-weekly-newsletter', authenticateCron, async (req, res) => {
  try {
    console.log('[Cron] Starting weekly newsletter send in background...');
    
    // Respond immediately to avoid timeout
    res.json({
      success: true,
      message: 'Weekly newsletter job started in background',
      timestamp: new Date().toISOString(),
    });
    
    // Run newsletter script in background (don't await)
    execAsync(
      'npx tsx scripts/send-weekly-newsletter.mjs',
      { cwd: process.cwd(), timeout: 300000 } // 5 minute timeout
    ).then(({ stdout, stderr }) => {
      console.log('[Cron] Weekly newsletter send completed');
      console.log(stdout);
      if (stderr) {
        console.error('[Cron] Weekly newsletter warnings:', stderr);
      }
    }).catch((error: any) => {
      console.error('[Cron] Weekly newsletter send failed:', error);
    });
    
  } catch (error: any) {
    console.error('[Cron] Failed to start weekly newsletter:', error);
    res.status(500).json({
      success: false,
      error: `Failed to start weekly newsletter: ${error.message}`,
    });
  }
});

export default router;
