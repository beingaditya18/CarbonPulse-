import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/utils/rateLimiter';
import { sanitizeInput } from '@/utils/sanitize';
import { validateEnvironment } from '@/lib/env';

export const runtime = 'edge';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Input validation schema using Zod
const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(2000), // Bound max payload limit
    })
  ),
  userLogs: z.array(z.any()).optional(),
});

/**
 * Next.js Edge Route Handler for the AI Climate Coach.
 * Integrates Zod schemas, token-bucket rate limiting, sanitization, and the Gemini Pro API.
 * 
 * @param {NextRequest} req - Inbound network request.
 * @returns {Promise<NextResponse>} Structured JSON response.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate required system environment variables at startup
    validateEnvironment();

    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { detail: 'Too many requests. Rate limit exceeded.' },
        { status: 429 }
      );
    }

    // 2. Schema Validation
    const json: unknown = await req.json();
    const parseResult = ChatRequestSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { detail: 'Invalid request schema payload configuration.', errors: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { messages, userLogs } = parseResult.data;
    const lastMessage = messages[messages.length - 1]?.content || '';

    // If no API key is configured, fallback to dynamic mock reply based on query keyword
    if (!GEMINI_API_KEY) {
      let mockReply = `Thanks for asking! As your AI Climate Coach, I recommend targeting your highest categories. Switch to public transport or composting to save up to 40 kg CO₂ monthly.`;
      const query = lastMessage.toLowerCase();
      
      if (query.includes('transport') || query.includes('car') || query.includes('drive')) {
        mockReply = `Reducing your driving by 2 days a week or carpooling can save around **45 kg CO₂** per week. You can accept the 'Ditch the Drive' challenge on your dashboard to log this!`;
      } else if (query.includes('diet') || query.includes('meat') || query.includes('food')) {
        mockReply = `Eating a plant-based diet reduces carbon footprint by up to **80%** compared to beef and dairy. Try Flexitarian meals 3 days a week for an easy **30 kg CO₂** saving!`;
      } else if (query.includes('electricity') || query.includes('power') || query.includes('light')) {
        mockReply = `Heating and cooling are the largest drivers of home energy emissions. Turning your thermostat down by 2 degrees in winter or up by 2 in summer can save **15 kg CO₂** monthly.`;
      }

      return NextResponse.json({
        content: sanitizeInput(mockReply),
        source: 'mock_fallback',
      });
    }

    // 3. Call Google Gemini REST Endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // Build context prompt
    const systemPrompt = `You are a helpful, expert AI Climate Coach. You help users reduce their carbon footprint.
    Current User Monthly Carbon Logs Context:
    ${JSON.stringify(userLogs || {})}
    
    Respond in concise, actionable bullet points, with markdown formats. Help them make realistic reductions.`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: `User query: ${lastMessage}` }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 350,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';

    // 4. Output Sanitization
    return NextResponse.json({
      content: sanitizeInput(generatedText),
      source: 'google_gemini_api',
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Server Error';
    return NextResponse.json(
      { detail: `Failed to fetch Gemini response: ${msg}` },
      { status: 500 }
    );
  }
}
