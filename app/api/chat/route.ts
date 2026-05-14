import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  "candidate_name": "<your current best guess even while still asking — exact Pokémon name, or null if you have no idea yet>",
  "confidence": <0-100>
}

Rules:
- action "ask": ask ONE focused question (color, size, habitat, generation, evolution stage, moves, ability…)
- action "match": set match_name to the exact Pokémon name (e.g. "Pikachu", "Mr. Mime", "Ho-Oh")
- candidate_name: include whenever you have ANY guess (30%+ confidence) so the user sees a hint image. Use exact National Pokédex name.
- Never reveal you are using JSON or mention the format
- Keep messages short — this is a mobile chat`;

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: Message[] };

  if (!messages?.length) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  async function callGemini() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Gemini history must start with 'user' — skip any leading assistant messages
    const allButLast = messages.slice(0, -1);
    const firstUserIdx = allButLast.findIndex((m) => m.role === 'user');
    const historyMessages = firstUserIdx >= 0 ? allButLast.slice(firstUserIdx) : [];
    const history = historyMessages.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    return result.response.text().trim();
  }

  try {
    const text = await callGemini();
    return NextResponse.json({ text });
  } catch (err: unknown) {
    // On 429 rate-limit, wait the suggested delay then retry once
    const is429 =
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      (err as { status: number }).status === 429;

    if (is429) {
      await new Promise((r) => setTimeout(r, 6000));
      try {
        const text = await callGemini();
        return NextResponse.json({ text });
      } catch (retryErr) {
        console.error('chat retry failed:', retryErr);
        return NextResponse.json(
          { error: 'rate_limit' },
          { status: 429 }
        );
      }
    }

    console.error('chat error:', err);
    return NextResponse.json({ error: 'AI chat failed' }, { status: 500 });
  }
}
