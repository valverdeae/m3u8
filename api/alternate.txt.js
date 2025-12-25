import { fetch } from 'undici';

export const config = {
  runtime: 'edge',
  regions: ['sin1']
};

const SOURCE_URL = 'https://livecricketsl.cc.nf/proxy/fox.php';

export default async function handler() {
  try {
    // Always fetch fresh
    const response = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://livecricketsl.cc.nf/',
        'Accept': 'application/x-mpegURL'
      }
    });

    const text = await response.text();
    const timestamp = new Date().toISOString();
    
    return new Response(`# Updated: ${timestamp}\n${text}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    return new Response(`# Error: ${error.message}\n# Try again`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
