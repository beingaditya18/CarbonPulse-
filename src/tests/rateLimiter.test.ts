import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { checkRateLimit } from '@/utils/rateLimiter';

describe('Edge API Rate Limiter (10 Tests)', () => {
  let nowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    nowSpy = vi.spyOn(Date, 'now');
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('1. allows requests within capacity boundaries and throttles when exhausted', () => {
    const testIp = '192.168.1.50';
    nowSpy.mockReturnValue(10000);
    
    // Consume 10 initial tokens
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(testIp)).toBe(true);
    }

    // 11th request must exceed bounds and return false
    expect(checkRateLimit(testIp)).toBe(false);
  });

  it('2. refills tokens after REFILL_RATE_MS elapses', () => {
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

  it('3. isolates rate limits between different IPs', () => {
    const ipA = '1.1.1.1';
    const ipB = '2.2.2.2';
    nowSpy.mockReturnValue(10000);

    // Drain A
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ipA);
    }
    expect(checkRateLimit(ipA)).toBe(false);

    // B should still be allowed
    expect(checkRateLimit(ipB)).toBe(true);
  });

  it('4. handles empty string IP gracefully', () => {
    nowSpy.mockReturnValue(10000);
    expect(checkRateLimit('')).toBe(true);
  });

  it('5. does not exceed bucket capacity (10) even after a very long delay', () => {
    const ip = '3.3.3.3';
    const t0 = 1_000_000;

    nowSpy.mockReturnValue(t0);
    expect(checkRateLimit(ip)).toBe(true);

    // Wait 1 hour (3600000ms)
    nowSpy.mockReturnValue(t0 + 3_600_000);
    
    // We should be able to consume exactly 10 tokens, not more
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
    expect(checkRateLimit(ip)).toBe(false);
  });

  it('6. refills multiple tokens for longer elapsed times', () => {
    const ip = '4.4.4.4';
    const t0 = 1_000_000;

    nowSpy.mockReturnValue(t0);
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip)).toBe(false);

    // Advance 125 seconds (should refill 2 tokens)
    nowSpy.mockReturnValue(t0 + 125_000);
    expect(checkRateLimit(ip)).toBe(true);
    expect(checkRateLimit(ip)).toBe(true);
    expect(checkRateLimit(ip)).toBe(false);
  });

  it('7. refills exactly 5 tokens after 300 seconds when partially empty', () => {
    const ip = '5.5.5.5';
    const t0 = 1_000_000;

    nowSpy.mockReturnValue(t0);
    for (let i = 0; i < 8; i++) {
      checkRateLimit(ip); // Leaves 2 tokens
    }

    // Wait 305 seconds (refills 5 tokens -> should have 7 tokens)
    nowSpy.mockReturnValue(t0 + 305_000);
    for (let i = 0; i < 7; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
    expect(checkRateLimit(ip)).toBe(false);
  });

  it('8. rejects requests immediately once tokens hit 0', () => {
    const ip = '6.6.6.6';
    nowSpy.mockReturnValue(10000);

    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip)).toBe(false);
    expect(checkRateLimit(ip)).toBe(false);
  });

  it('9. refills tokens up to capacity when partially drained and long delay occurs', () => {
    const ip = '7.7.7.7';
    const t0 = 1_000_000;

    nowSpy.mockReturnValue(t0);
    checkRateLimit(ip); // leaves 9 tokens

    // Advance 2 hours
    nowSpy.mockReturnValue(t0 + 7_200_000);
    // Should top up to exactly 10 tokens
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
    expect(checkRateLimit(ip)).toBe(false);
  });

  it('10. only refills integer multiples of refill duration', () => {
    const ip = '8.8.8.8';
    const t0 = 1_000_000;

    nowSpy.mockReturnValue(t0);
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip)).toBe(false);

    // Advance by 59 seconds (slightly less than 60s REFILL_RATE_MS)
    nowSpy.mockReturnValue(t0 + 59_000);
    expect(checkRateLimit(ip)).toBe(false);
  });
});
