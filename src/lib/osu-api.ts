const OSU_API_V2_BASE = 'https://osu.ppy.sh/api/v2';
const OSU_API_V1_BASE = 'https://osu.ppy.sh/api';
const TOKEN_URL = 'https://osu.ppy.sh/oauth/token';

const clientId = process.env.OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;
const legacyApiKey = process.env.OSU_LEGACY_KEY;

let tokenInfo = {
    accessToken: '' as string,
    expiresAt: 0 as number,
};

export async function getAccessToken(): Promise<string> {
    const now = Date.now();
    if (tokenInfo.accessToken && now < tokenInfo.expiresAt) {
        return tokenInfo.accessToken;
    }

    if (!clientId || !clientSecret) {
        throw new Error('Missing osu! API v2 credentials in environment variables.');
    }
    
    try {
        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: parseInt(clientId, 10),
                client_secret: clientSecret,
                grant_type: 'client_credentials',
                scope: 'public',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('osu! API v2 token error:', errorData);
            throw new Error(`Failed to fetch osu! API v2 token: ${response.statusText}`);
        }

        const data = await response.json();
        tokenInfo = {
            accessToken: data.access_token,
            expiresAt: now + (data.expires_in - 60) * 1000,
        };
        return tokenInfo.accessToken;
    } catch (error) {
        console.error('Error fetching osu! API v2 token:', error);
        throw error;
    }
}

// --- API v2 Functions --- 

export async function searchBeatmapsets(query: string, mode?: string, status?: string, extra?: string, nsfw: boolean = false): Promise<BeatmapsetSearchResponse> {
    const accessToken = await getAccessToken();
    const params = new URLSearchParams({
        q: query,
        n: nsfw ? '1' : '0',
    });
    if (mode) params.append('m', mode);
    if (status) params.append('s', status);
    if (extra) params.append('e', extra);

    const url = `${OSU_API_V2_BASE}/beatmapsets/search?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`osu! API v2 search error (${response.status}):`, errorData);
            throw new Error(`Failed to search beatmapsets: ${response.statusText}`);
        }

        return await response.json() as BeatmapsetSearchResponse;
    } catch (error) {
        console.error('Error searching beatmapsets:', error);
        throw error;
    }
}

export async function getBeatmapset(beatmapsetId: number | string): Promise<Beatmapset | null> {
    const accessToken = await getAccessToken();
    const url = `${OSU_API_V2_BASE}/beatmapsets/${beatmapsetId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
             if (response.status === 404) {
                return null;
            }
            const errorData = await response.text();
            console.error(`osu! API v2 get beatmapset error (${response.status}):`, errorData);
            throw new Error(`Failed to get beatmapset ${beatmapsetId}: ${response.statusText}`);
        }

        return await response.json() as Beatmapset;
    } catch (error) {
        console.error(`Error getting beatmapset ${beatmapsetId}:`, error);
        throw error;
    }
}

// --- API v1 Functions (Use sparingly) --- 

export async function getBeatmapV1(beatmapId: number | string): Promise<any | null> {
    if (!legacyApiKey) {
        console.warn('Missing osu! API v1 key. Skipping v1 request.');
        return null;
    }
    const url = `${OSU_API_V1_BASE}/get_beatmaps?k=${legacyApiKey}&b=${beatmapId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) return null;
            console.error(`osu! API v1 get beatmap error (${response.status}):`, await response.text());
            throw new Error(`Failed to get beatmap (v1) ${beatmapId}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error(`Error getting beatmap (v1) ${beatmapId}:`, error);
        return null;
    }
}

export interface Beatmapset {
    id: number;
    title: string;
    artist: string;
    creator: string;
    user_id: number;
    status: string;
    submitted_date: string;
    last_updated: string;
    ranked_date: string | null;
    beatmaps?: Beatmap[];
    covers: {
        cover: string;
        'cover@2x': string;
        card: string;
        'card@2x': string;
        list: string;
        'list@2x': string;
        slimcover: string;
        'slimcover@2x': string;
    };
    source?: string;
    tags?: string;
    play_count?: number;
    favourite_count?: number;
}

export interface Beatmap {
    id: number;
    beatmapset_id: number;
    difficulty_rating: number;
    mode: string;
    status: string;
    total_length: number;
    version: string;
    accuracy: number;
    ar: number;
    bpm: number;
    cs: number;
    drain: number;
    hit_length: number;
    passcount: number;
    playcount: number;
    url: string;
}

export interface BeatmapsetSearchResponse {
    beatmapsets: Beatmapset[];
    total: number;
    cursor_string: string | null;
} 