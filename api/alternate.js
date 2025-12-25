import { fetch } from 'undici';

export const config = {
  runtime: 'edge',
  regions: ['sin1']
};

const SOURCE_URL = 'https://livecricketsl.cc.nf/proxy/fox.php';

export default async function handler(request) {
  try {
    // Fetch fresh stream (always fresh)
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
    
    // Create .txt version
    const txtContent = `# Auto-updated via Vercel: ${timestamp}\n# Format: alternate.txt\n# Source: ${SOURCE_URL}\n\n${text}`;

    return new Response(txtContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Stream error:', error);
    
    return new Response(`# Error: ${error.message}\n# Try again in a moment`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

export async function GET(request) {
  return handler(request);
}
