import { fetch } from 'undici';

export const config = {
  runtime: 'edge',
  regions: ['sin1']
};

const SOURCE_URL = 'https://livecricketsl.cc.nf/proxy/fox.php';

// Store in memory (simplified - for production use Vercel KV)
let cachedContent = {
  timestamp: null,
  m3u8: null,
  txt: null
};

export default async function handler(request) {
  try {
    console.log(`[${new Date().toISOString()}] Starting update...`);
    
    // Fetch fresh stream
    const response = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://livecricketsl.cc.nf/',
        'Accept': 'application/x-mpegURL'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    
    if (!text.includes('#EXTM3U')) {
      throw new Error('Invalid M3U8 content');
    }

    // Create both versions
    const timestamp = new Date().toISOString();
    
    // 1. M3U8 version
    const m3u8Content = `# Updated: ${timestamp}\n# Format: .m3u8\n${text}`;
    
    // 2. TXT version (alternate.txt)
    const txtContent = `# Updated: ${timestamp}\n# Format: .txt\n${text}`;
    
    // Update cache
    cachedContent = {
      timestamp,
      m3u8: m3u8Content,
      txt: txtContent
    };

    console.log(`[${timestamp}] Updated: ${text.length} chars`);
    
    return new Response(JSON.stringify({
      success: true,
      timestamp,
      formats: ['m3u8', 'txt'],
      contentLength: text.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error(`Update failed: ${error.message}`);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
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
