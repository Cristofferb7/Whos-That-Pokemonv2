import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

const PROMPT =
  "What Pokémon is shown in this image? Reply with ONLY the Pokémon's exact name (e.g. \"Pikachu\", \"Charizard\", \"Mr. Mime\"). If you cannot identify a Pokémon, reply with \"unknown\".";

async function identifyWithGemini(base64: string, mimeType: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    PROMPT,
  ]);
  return result.response.text().trim();
}

async function identifyWithClaude(
  base64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });
  return (message.content[0] as { type: string; text: string }).text.trim();
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mimeType = (file.type || 'image/jpeg') as
    | 'image/jpeg'
    | 'image/png'
    | 'image/gif'
    | 'image/webp';

  let raw: string;

  try {
    raw = await identifyWithGemini(base64, mimeType);
  } catch (geminiErr) {
    console.warn('Gemini identify failed, falling back to Claude:', geminiErr);
    try {
      raw = await identifyWithClaude(base64, mimeType);
    } catch (claudeErr) {
      console.error('Claude identify also failed:', claudeErr);
      return NextResponse.json({ error: 'AI identification failed' }, { status: 500 });
    }
  }

  // Strip punctuation/extra words
  const name = raw.replace(/[.!?,]/g, '').split('\n')[0].trim();
  return NextResponse.json({ name });
}
