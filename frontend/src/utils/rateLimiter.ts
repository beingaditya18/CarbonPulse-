/**
 * In-memory client tracking structure.
 */
interface ClientBucket {
  tokens: number;
  lastRefill: number;
}

const clientBuckets = new Map<string, ClientBucket>();

// Rate limit parameters (Token Bucket Algorithm)
const BUCKET_CAPACITY = 10;
const REFILL_RATE_MS = 60000; // Refill 1 token per 60 seconds
const REFILL_AMOUNT = 1;

/**
 * Check if the requested client IP has exceeded their API rate limits.
 * Uses a token-bucket rate limiter that is safe and compatible with serverless/edge runtimes.
 * 
 * @param {string} ip - The unique client IP address.
 * @returns {boolean} True if the request is permitted, false if rate-limited.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let bucket = clientBuckets.get(ip);

  if (!bucket) {
    bucket = {
      tokens: BUCKET_CAPACITY,
      lastRefill: now,
    };
    clientBuckets.set(ip, bucket);
  }

  // Refill tokens based on time elapsed
  const timeElapsed = now - bucket.lastRefill;
  if (timeElapsed > REFILL_RATE_MS) {
    const refillTokens = Math.floor(timeElapsed / REFILL_RATE_MS) * REFILL_AMOUNT;
    bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + refillTokens);
    bucket.lastRefill = now;
  }

  // Consume a token
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}
