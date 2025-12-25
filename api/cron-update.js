import { fetch } from 'undici';

export const config = {
  runtime: 'edge',
  regions: ['sin1']
};

// Your source URL
const SOURCE_URL = 'https://livecricketsl.cc.nf/proxy/fox.php';

// Simple in-memory cache (Vercel Edge Functions can use this)
let cachedData = {
  timestamp: null,
  content: null
};

export default async function handler(request) {
  try {
    // === SECURITY CHECK ===
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (!expectedToken) {
      return new Response(
        JSON.stringify({ error: 'CRON_SECRET not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } 
      );
    }
    
    console.log(`[${new Date().toISOString()}] Starting cron update...`);
    
    // === FETCH STREAM ===
    const response = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://livecricketsl.cc.nf/',
        'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, */*'
      },
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    
    if (!text.includes('#EXTM3U')) {
      throw new Error('Invalid M3U8 content received');
    }

    // === CREATE BOTH FORMATS ===
    const timestamp = new Date().toISOString();
    
    // For TXT format
    const txtContent = `# Updated via cron-job.org: ${timestamp}\n# Source: ${SOURCE_URL}\n\n${text}`;
    
    // For M3U8 format  
    const m3u8Content = `#EXTM3U\n# Updated: ${timestamp}\n${text}`;
    
    // Update cache
    cachedData = {
      timestamp,
      txt: txtContent,
      m3u8: m3u8Content
    };

    console.log(`[${timestamp}] Update successful: ${text.length} chars`);
    
    return new Response(JSON.stringify({
      success: true,
      timestamp,
      contentLength: text.length,
      formats: ['txt', 'm3u8']
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cron failed:`, error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function GET(request) {
  return handler(request);
}
