import axios from 'axios';

let tokenManager: {
  accessToken: string;
  expiry: number;
} | null = null;

async function getNewToken() {
  try {
    const response = await axios.post('https://osu.ppy.sh/oauth/token', {
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'public'
    });

    return {
      accessToken: response.data.access_token,
      expiry: Date.now() + (response.data.expires_in * 1000 - 30000)
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to authenticate with osu! API');
  }
}

async function ensureValidToken() {
  if (!tokenManager || Date.now() >= tokenManager.expiry) {
    tokenManager = await getNewToken();
  }
  return tokenManager.accessToken;
}

export const osuApi = {
  async searchBeatmaps(query: string, options?: {
    mode?: 'osu' | 'taiko' | 'fruits' | 'mania';
    limit?: number;
  }) {
    const token = await ensureValidToken();
    const response = await axios.get('https://osu.ppy.sh/api/v2/beatmapsets/search', {
      params: {
        q: query,
        m: options?.mode,
        limit: options?.limit ?? 50
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getBeatmapsetDetails(setId: number) {
    const token = await ensureValidToken();
    const response = await axios.get(`https://osu.ppy.sh/api/v2/beatmapsets/${setId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

if (typeof process.env.OSU_CLIENT_ID === 'undefined' || 
    typeof process.env.OSU_CLIENT_SECRET === 'undefined') {
  throw new Error('Missing osu! API credentials in environment variables');
}