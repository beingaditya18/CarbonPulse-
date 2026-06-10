import { NextRequest, NextResponse } from 'next/server';
import { calculateSHAPExplanations, SHAPExplanation } from '@/lib/shapEngine';
import { checkRateLimit } from '@/utils/rateLimiter';
import { validateEnvironment } from '@/lib/env';

export const runtime = 'edge';

/**
 * Next.js Edge Route Handler returning SHAP AI explanations.
 * Matches API response contracts for /carbon/insights.
 * 
 * @param {NextRequest} req - Inbound network request.
 * @returns {Promise<NextResponse>} Structured JSON response.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate required system environment variables
    validateEnvironment();

    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { detail: 'Too many requests. Rate limit exceeded.' },
        { status: 429 }
      );
    }

    // Default mock logs context for testing
    const defaultLogs = [
      { id: '1', category: 'transportation' as const, emission_amount: 95.2, source: 'manual' as const, description: 'Fuel', logged_date: new Date().toISOString() },
      { id: '2', category: 'electricity' as const, emission_amount: 110.0, source: 'manual' as const, description: 'Utility bill', logged_date: new Date().toISOString() },
      { id: '3', category: 'food' as const, emission_amount: 32.5, source: 'manual' as const, description: 'Meat meals', logged_date: new Date().toISOString() },
      { id: '4', category: 'shopping' as const, emission_amount: 18.0, source: 'manual' as const, description: 'Packages', logged_date: new Date().toISOString() },
      { id: '5', category: 'waste' as const, emission_amount: 8.5, source: 'manual' as const, description: 'Trash bin', logged_date: new Date().toISOString() },
    ];

    const data = calculateSHAPExplanations(defaultLogs);

    return NextResponse.json({
      predicted_emission: data.predictedEmissions,
      target_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      explanations: data.explanations.map((exp: SHAPExplanation) => ({
        feature: exp.feature,
        impact: exp.impact,
        description: exp.description,
      })),
      base_value: data.baseValue,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Server Error';
    return NextResponse.json({ detail: `Insights failed: ${msg}` }, { status: 500 });
  }
}
