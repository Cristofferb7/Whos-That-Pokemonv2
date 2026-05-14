'use client';

import { PokemonData } from '@/lib/types';
import { TypeBadge } from './TypeBadge';
import { IconBack, IconShare } from './icons';

const C = {
  red: '#E63946', ink: '#1D1D1F', inkSoft: '#6E6E73',
  bg: '#F7F4F2', white: '#FFFFFF', border: '#E8E5E3',
};

interface Props {
  pokemon: PokemonData;
  onBack: () => void;
}

export function ResultScreen({ pokemon, onBack }: Props) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Red header */}
      <div style={{ background: C.red, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -8, height: 8, background: C.ink }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 16px 20px' }}>
          <button onClick={onBack} style={{
            all: 'unset', cursor: 'pointer',
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><IconBack /></button>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Identified
          </div>
          <button
            onClick={() => navigator.share?.({ title: pokemon.name, text: `I found ${pokemon.name}!` })}
            style={{
              all: 'unset', cursor: 'pointer',
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          ><IconShare /></button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero card */}
        <div style={{ background: C.red, paddingBottom: 28, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: C.ink }} />
          <div style={{
            margin: '24px 24px 0', background: C.white, borderRadius: 24,
            padding: '12px 16px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 14, left: 16, fontFamily: 'monospace', fontSize: 12, color: C.inkSoft, letterSpacing: 0.8 }}>
              #{String(pokemon.id).padStart(3, '0')}
            </div>
            <CornerTicks />
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 8px' }}>
              {pokemon.sprite && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  style={{ width: 200, height: 200, objectFit: 'contain' }}
                />
              )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: -0.8, textAlign: 'center' }}>
              {pokemon.name}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
              {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 14, fontSize: 13, color: C.inkSoft }}>
            <MetaItem label="Height" value={pokemon.height} />
            <div style={{ width: 1, background: C.border }} />
            <MetaItem label="Weight" value={pokemon.weight} />
            <div style={{ width: 1, background: C.border }} />
            <MetaItem label="ID" value={`#${String(pokemon.id).padStart(3, '0')}`} />
          </div>
          {pokemon.flavor && (
            <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{pokemon.flavor}</div>
          )}
        </div>

        {/* Weak against */}
        {pokemon.weaknesses.length > 0 && (
          <Section title="Weak against">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pokemon.weaknesses.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </Section>
        )}

        {/* Top moves */}
        {pokemon.moves.length > 0 && (
          <Section title="Top moves">
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {pokemon.moves.map((m, i) => (
                <MoveRow key={m.name} move={m} last={i === pokemon.moves.length - 1} />
              ))}
            </div>
          </Section>
        )}

        {/* Base stats */}
        {Object.keys(pokemon.stats).length > 0 && (
          <Section title="Base stats">
            <div style={{
              background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
              padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {Object.entries(pokemon.stats).map(([k, v]) => (
                <StatBar key={k} label={k} value={v} />
              ))}
              <div style={{
                borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4,
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, fontWeight: 700, color: C.ink,
              }}>
                <span>Total</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {Object.values(pokemon.stats).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          </Section>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}

function CornerTicks() {
  const stroke = `2px solid ${C.inkSoft}`;
  const base: React.CSSProperties = { position: 'absolute', width: 14, height: 14 };
  return (
    <>
      <div style={{ ...base, top: 8, left: 8, borderTop: stroke, borderLeft: stroke, opacity: 0.4 }} />
      <div style={{ ...base, top: 8, right: 8, borderTop: stroke, borderRight: stroke, opacity: 0.4 }} />
      <div style={{ ...base, bottom: 8, left: 8, borderBottom: stroke, borderLeft: stroke, opacity: 0.4 }} />
      <div style={{ ...base, bottom: 8, right: 8, borderBottom: stroke, borderRight: stroke, opacity: 0.4 }} />
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: 1.0, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, color: C.ink, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '22px 24px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function MoveRow({ move, last }: { move: { name: string; type: string; power: number }; last: boolean }) {
  const isStatus = move.power === 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
      <TypeBadge type={move.type} size="sm" />
      <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: C.ink }}>{move.name}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, color: isStatus ? C.inkSoft : C.ink, fontWeight: 700 }}>
        {isStatus ? '—' : `PWR ${move.power}`}
      </div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 255) * 100);
  const color = value >= 100 ? '#5EB85E' : value >= 60 ? C.red : '#F5B935';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 52, fontSize: 11, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.6 }}>{label}</div>
      <div style={{ width: 32, fontFamily: 'monospace', fontSize: 12, color: C.ink, fontWeight: 700, textAlign: 'right' }}>{value}</div>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#F1ECE8', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 4, background: color,
          transition: 'width 600ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}
