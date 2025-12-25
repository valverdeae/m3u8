import { fetch } from 'undici';

export const config = {
  runtime: 'edge',
  regions: ['sin1']
};

const SOURCE_URL = 'https://livecricketsl.cc.nf/proxy/fox.php';

export default async function handler() {
  try {
    const response = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://livecricketsl.cc.nf/',
        'Accept': 'application/x-mpegURL'
      }
    });

    const text = await response.text();
    const timestamp = new Date().toISOString();
    
    return new Response(`#EXTM3U\n# Updated: ${timestamp}\n${text}`, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    return new Response(`#EXTM3U\n# Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'application/vnd.apple.mpegurl' }
    });
  }
}
