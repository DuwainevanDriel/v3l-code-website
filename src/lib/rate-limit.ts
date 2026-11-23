type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Best-effort in-memory limiter. State is per server instance, so it slows
 * bursts but is not a hard global limit; Turnstile is the primary bot defence.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now: number,
): boolean {
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function resetRateLimits() {
  buckets.clear();
}
