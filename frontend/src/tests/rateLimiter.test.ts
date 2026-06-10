import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { checkRateLimit } from '@/utils/rateLimiter';

describe('Edge API Rate Limiter', () => {
  it('allows requests within capacity boundaries and throttles when exhausted', () => {
    const testIp = '192.168.1.50';
    
    // Consume 10 initial tokens
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(testIp)).toBe(true);
    }

    // 11th request must exceed bounds and return false
    expect(checkRateLimit(testIp)).toBe(false);
  });

  describe('Token refill branch', () => {
    let nowSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      nowSpy = vi.spyOn(Date, 'now');
    });

    afterEach(() => {
      nowSpy.mockRestore();
    });

    it('refills tokens after REFILL_RATE_MS elapses (line 38-40 branch)', () => {
      const refillIp = '10.0.0.99';
      const t0 = 1_000_000;

      // Drain all 10 tokens at t0
      nowSpy.mockReturnValue(t0);
      for (let i = 0; i < 10; i++) {
        checkRateLimit(refillIp);
      }
      expect(checkRateLimit(refillIp)).toBe(false);

      // Advance time by 61 seconds (> 60000ms REFILL_RATE_MS) so 1 token refills
      nowSpy.mockReturnValue(t0 + 61_000);
      expect(checkRateLimit(refillIp)).toBe(true);
      // Immediately after refill is consumed, should be false again
      expect(checkRateLimit(refillIp)).toBe(false);
    });
  });
});

