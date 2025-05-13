const beatmapLimiter: Record<string, Record<string, number[]>> = {};

const BEATMAP_LIMIT = 3;
const TIME_WINDOW_MS = 10 * 60 * 1000;

export function checkRateLimit(ip: string, beatmapId: string): { isLimited: boolean; message?: string } {
  const now = Date.now();
  
  cleanupOldEntries(beatmapId, ip, now);
  
  if (!beatmapLimiter[beatmapId]) {
    beatmapLimiter[beatmapId] = {};
  }
  
  if (!beatmapLimiter[beatmapId][ip]) {
    beatmapLimiter[beatmapId][ip] = [];
  }
  
  const beatmapCount = beatmapLimiter[beatmapId][ip].length;
  
  if (beatmapCount >= BEATMAP_LIMIT) {
    return {
      isLimited: true,
      message: `You've downloaded this beatmap too many times. Maximum ${BEATMAP_LIMIT} downloads per beatmap allowed in a 10-minute window.`
    };
  }
  
  return { isLimited: false };
}

export function recordDownload(ip: string, beatmapId: string): void {
  const now = Date.now();
  
  if (!beatmapLimiter[beatmapId]) {
    beatmapLimiter[beatmapId] = {};
  }
  
  if (!beatmapLimiter[beatmapId][ip]) {
    beatmapLimiter[beatmapId][ip] = [];
  }
  
  beatmapLimiter[beatmapId][ip].push(now);
}

function cleanupOldEntries(beatmapId: string, ip: string, now: number): void {
  if (!beatmapLimiter[beatmapId]) return;
  
  if (!beatmapLimiter[beatmapId][ip]) return;
  
  beatmapLimiter[beatmapId][ip] = beatmapLimiter[beatmapId][ip].filter(timestamp => {
    return now - timestamp < TIME_WINDOW_MS;
  });
  
  if (beatmapLimiter[beatmapId][ip].length === 0) {
    delete beatmapLimiter[beatmapId][ip];
  }
  
  if (Object.keys(beatmapLimiter[beatmapId]).length === 0) {
    delete beatmapLimiter[beatmapId];
  }
}

export function getRateLimiterStats() {
  const beatmapCount = Object.keys(beatmapLimiter).length;
  
  let ipEntryCount = 0;
  Object.values(beatmapLimiter).forEach(ips => {
    ipEntryCount += Object.keys(ips).length;
  });
  
  let timestampCount = 0;
  Object.values(beatmapLimiter).forEach(ips => {
    Object.values(ips).forEach(timestamps => {
      timestampCount += timestamps.length;
    });
  });
  
  return {
    trackedBeatmaps: beatmapCount,
    trackedIpEntries: ipEntryCount,
    totalRecordedDownloads: timestampCount,
    beatmapLimit: BEATMAP_LIMIT,
    timeWindowMinutes: TIME_WINDOW_MS / (60 * 1000)
  };
} 