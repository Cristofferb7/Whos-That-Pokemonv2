import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROMPT =
  "What Pokémon is shown in this image? Reply with ONLY the Pokémon's exact name (e.g. \"Pikachu\", \"Charizard\", \"Mr. Mime\"). If you cannot identify a Pokémon, reply with \"unknown\".";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mimeType = file.type || 'image/jpeg';

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      PROMPT,
    ]);
    const raw = result.response.text().trim();
    const name = raw.replace(/[.!?,]/g, '').split('\n')[0].trim();
    return NextResponse.json({ name });
  } catch (err) {
    console.error('identify error:', err);
    return NextResponse.json({ error: 'Could not identify the Pokémon' }, { status: 500 });
  }
}
