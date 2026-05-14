import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const SYSTEM_INSTRUCTION = `You are PokéDex AI, an expert at identifying Pokémon from user descriptions.
Ask focused follow-up questions to narrow down which Pokémon the user is describing.
When you are at least 70% confident, make a match.

Always respond with a single valid JSON object and nothing else:
{
  "action": "ask" | "match",
  "message": "<your reply, 1-2 sentences, friendly and concise>",
  "match_name": "<exact Pokémon name as in the National Pokédex, or null>",
  "confidence": <0-100>
}

Rules:
- action "ask": ask ONE focused question (color, size, habitat, generation, evolution stage, moves, ability…)
- action "match": set match_name to the exact Pokémon name (e.g. "Pikachu", "Mr. Mime", "Ho-Oh")
- Never reveal you are using JSON or mention the format
- Keep messages short — this is a mobile chat`;

async function chatWithGemini(messages: Message[]): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  // Build Gemini history (all messages except the last user message)
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: m.text }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.text);
  return result.response.text().trim();
}

async function chatWithClaude(messages: Message[]): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: SYSTEM_INSTRUCTION,
    messages: messages.map((m) => ({ role: m.role, content: m.text })),
  });
  return (response.content[0] as { type: string; text: string }).text;
}

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: Message[] };

  if (!messages?.length) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  let text: string;

  try {
    text = await chatWithGemini(messages);
  } catch (geminiErr) {
    console.warn('Gemini chat failed, falling back to Claude:', geminiErr);
    try {
      text = await chatWithClaude(messages);
    } catch (claudeErr) {
      console.error('Claude chat also failed:', claudeErr);
      return NextResponse.json({ error: 'AI chat failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ text });
}
