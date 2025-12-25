import { fetch } from 'undici';

export const config = {
  runtime: 'edge',
  regions: ['sin1']
};

const SOURCE_URL = 'https://livecricketsl.cc.nf/proxy/fox.php';

export default async function handler(request) {
  try {
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
    const timestamp = new Date().toISOString();
    
    const m3u8Content = `# Auto-updated via Vercel: ${timestamp}\n# Format: .m3u8\n# Source: ${SOURCE_URL}\n\n${text}`;

    return new Response(m3u8Content, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Stream error:', error);
    
    return new Response(`#EXTM3U\n# Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl'
      }
    });
  }
}
