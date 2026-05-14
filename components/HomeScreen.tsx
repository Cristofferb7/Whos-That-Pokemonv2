'use client';

import { useState } from 'react';
import { PokemonData, Screen } from '@/lib/types';
import { TypeBadge } from './TypeBadge';
import { DexMark, IconCamera, IconSearch, IconChat } from './icons';

const C = {
  red: '#E63946', ink: '#1D1D1F', inkSoft: '#6E6E73',
  bg: '#F7F4F2', white: '#FFFFFF', border: '#E8E5E3',
};

interface Props {
  onNav: (screen: Screen, payload?: PokemonData) => void;
  recents: PokemonData[];
}

export function HomeScreen({ onNav, recents }: Props) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      <div style={{ padding: '56px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DexMark size={32} />
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>
            PokéDex AI
          </div>
        </div>
        <div style={{ marginTop: 28, fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: -1.2, lineHeight: 1.05 }}>
          Who&apos;s that<br />Pokémon?
        </div>
        <div style={{ marginTop: 10, fontSize: 15, color: C.inkSoft, lineHeight: 1.45, maxWidth: 280 }}>
          Snap a photo, search by name, or describe one — we&apos;ll find a match.
        </div>
      </div>

      <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ActionButton primary icon={<IconCamera />} label="Take a photo" hint="Use your camera or upload" onClick={() => onNav('photo')} />
        <ActionButton icon={<IconSearch />} label="Search by name" hint="Type a Pokémon name" onClick={() => onNav('search')} />
        <ActionButton icon={<IconChat />} label="Describe it to AI" hint="Tell us what you saw" onClick={() => onNav('chat')} />
      </div>

      {recents.length > 0 && (
        <div style={{ padding: '32px 24px 40px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            Recent finds
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recents.map((p) => (
              <RecentRow key={p.id} pokemon={p} onClick={() => onNav('result', p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  primary, icon, label, hint, onClick,
}: {
  primary?: boolean; icon: React.ReactNode; label: string; hint: string; onClick: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const bg = primary ? C.red : C.white;
  const fg = primary ? '#fff' : C.ink;
  const sub = primary ? 'rgba(255,255,255,0.78)' : C.inkSoft;
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        background: bg, color: fg,
        padding: '18px', borderRadius: 18,
        border: primary ? 'none' : `1px solid ${C.border}`,
        boxShadow: primary
          ? '0 6px 18px rgba(230,57,70,0.32), inset 0 -2px 0 rgba(0,0,0,0.12)'
          : '0 1px 2px rgba(0,0,0,0.04)',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 80ms ease',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: primary ? 'rgba(255,255,255,0.18)' : '#FFF1F2',
        color: primary ? '#fff' : C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{label}</div>
        <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>{hint}</div>
      </div>
      <svg width="10" height="16" viewBox="0 0 10 16">
        <path d="M2 2l6 6-6 6" stroke={primary ? 'rgba(255,255,255,0.7)' : C.inkSoft}
              strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function RecentRow({ pokemon, onClick }: { pokemon: PokemonData; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
      background: C.white, padding: '10px 14px',
      borderRadius: 14, border: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: '#F1ECE8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden',
      }}>
        {pokemon.sprite && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pokemon.sprite} alt={pokemon.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: C.inkSoft, letterSpacing: 0.6 }}>
          #{String(pokemon.id).padStart(3, '0')}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{pokemon.name}</div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {pokemon.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </button>
  );
}
