'use client';

import { useEffect, useRef, useState } from 'react';
import { PokemonData } from '@/lib/types';
import { fetchPokemon } from '@/lib/pokeapi';
import { TypeBadge } from './TypeBadge';
import { DexMark, IconBack, IconSend } from './icons';

const C = {
  red: '#E63946', ink: '#1D1D1F', inkSoft: '#6E6E73',
  bg: '#F7F4F2', white: '#FFFFFF', border: '#E8E5E3',
};

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Match {
  pokemon: PokemonData;
  confidence: number;
}

interface Props {
  onBack: () => void;
  onView: (pokemon: PokemonData) => void;
}

const STARTERS = [
  'Small yellow mouse with red cheeks',
  'Big fire-breathing dragon',
  'Purple ghost with big hands',
];

export function ChatScreen({ onBack, onView }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! Describe a Pokémon and I'll help you identify it. What does it look like?" },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking, match]);

  async function send(text: string) {
    if (!text.trim() || thinking) return;
    const next: Message[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      const parsed = parseJson(data.text);
      const reply = parsed?.message ?? "Tell me more — what color is it, and is it big or small?";
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);

      if (parsed?.action === 'match' && parsed?.match_name) {
        try {
          const pokemon = await fetchPokemon(parsed.match_name);
          setMatch({ pokemon, confidence: parsed.confidence ?? 80 });
        } catch {
          // silently ignore — Claude might have slightly wrong name
        }
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: "Sorry, lost signal for a second. Could you say that again?" }]);
    } finally {
      setThinking(false);
    }
  }

  function reset() {
    setMessages([{ role: 'assistant', text: "Hi! Describe a Pokémon and I'll help you identify it. What does it look like?" }]);
    setMatch(null);
    setInput('');
  }

  const showStarters = messages.length <= 1 && !match;

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{
        paddingTop: 54, background: C.white, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 12, padding: '54px 16px 14px',
      }}>
        <button onClick={onBack} style={{
          all: 'unset', cursor: 'pointer',
          width: 36, height: 36, borderRadius: 18,
          background: '#F1ECE8', color: C.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><IconBack /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 1.2, textTransform: 'uppercase' }}>Describe it</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: -0.3 }}>AI Identifier</div>
        </div>
        <DexMark size={28} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => <Bubble key={i} role={m.role} text={m.text} />)}
        {thinking && <ThinkingBubble />}
        {match && (
          <MatchCard
            pokemon={match.pokemon}
            confidence={match.confidence}
            onView={() => onView(match.pokemon)}
            onReset={reset}
          />
        )}
        {showStarters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} style={{
                all: 'unset', cursor: 'pointer',
                fontSize: 13, padding: '8px 12px',
                background: C.white, color: C.ink,
                border: `1px solid ${C.border}`, borderRadius: 999,
              }}>{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 12px 24px', borderTop: `1px solid ${C.border}`,
        background: C.white, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder={match ? 'Describe another…' : 'Describe the Pokémon…'}
          style={{
            flex: 1, minWidth: 0, background: '#F1ECE8', border: 'none', outline: 'none',
            borderRadius: 22, padding: '12px 16px', fontSize: 15, color: C.ink, fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
          style={{
            all: 'unset', cursor: input.trim() && !thinking ? 'pointer' : 'default',
            width: 42, height: 42, borderRadius: 21,
            background: input.trim() && !thinking ? C.red : '#E8E5E3',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 150ms',
          }}
        ><IconSend /></button>
      </div>
    </div>
  );
}

function Bubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '78%',
        background: isUser ? C.red : C.white,
        color: isUser ? '#fff' : C.ink,
        border: isUser ? 'none' : `1px solid ${C.border}`,
        padding: '10px 14px', borderRadius: 18,
        borderTopRightRadius: isUser ? 6 : 18,
        borderTopLeftRadius: isUser ? 18 : 6,
        fontSize: 15, lineHeight: 1.4,
        boxShadow: isUser ? '0 2px 6px rgba(230,57,70,0.25)' : '0 1px 2px rgba(0,0,0,0.03)',
        whiteSpace: 'pre-wrap',
      }}>{text}</div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        padding: '12px 16px', borderRadius: 18, borderTopLeftRadius: 6,
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 150, 300].map((d) => (
          <span key={d} style={{
            width: 6, height: 6, borderRadius: 3, background: '#6E6E73',
            display: 'inline-block',
            animation: `cdBlink 1.2s ${d}ms infinite`,
          }} />
        ))}
        <style>{`@keyframes cdBlink { 0%,80%,100%{opacity:0.25} 40%{opacity:1} }`}</style>
      </div>
    </div>
  );
}

function MatchCard({ pokemon, confidence, onView, onReset }: {
  pokemon: PokemonData; confidence: number;
  onView: () => void; onReset: () => void;
}) {
  return (
    <div style={{
      marginTop: 6, background: C.white,
      border: `2px solid ${C.red}`, borderRadius: 20,
      padding: 14, position: 'relative',
      boxShadow: '0 10px 28px rgba(230,57,70,0.18)',
    }}>
      <div style={{
        position: 'absolute', top: -10, left: 14,
        background: C.red, color: '#fff',
        fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
        padding: '3px 8px', borderRadius: 6,
      }}>MATCH · {confidence}%</div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16, background: '#F1ECE8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {pokemon.sprite && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pokemon.sprite} alt={pokemon.name} style={{ width: 68, height: 68, objectFit: 'contain' }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.inkSoft, letterSpacing: 0.6 }}>
            #{String(pokemon.id).padStart(3, '0')}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>{pokemon.name}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {pokemon.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={onView} style={{
          all: 'unset', cursor: 'pointer', flex: 1,
          background: C.red, color: '#fff',
          padding: '12px 16px', borderRadius: 14,
          fontSize: 15, fontWeight: 700, textAlign: 'center',
          boxShadow: '0 4px 12px rgba(230,57,70,0.3), inset 0 -2px 0 rgba(0,0,0,0.12)',
        }}>View full details</button>
        <button onClick={onReset} style={{
          all: 'unset', cursor: 'pointer',
          background: '#F1ECE8', color: C.ink,
          padding: '12px 16px', borderRadius: 14,
          fontSize: 15, fontWeight: 600, textAlign: 'center',
        }}>Try another</button>
      </div>
    </div>
  );
}

function parseJson(raw: string) {
  if (!raw) return null;
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned); } catch { /* empty */ }
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* empty */ } }
  return null;
}
