'use client';

import { useState } from 'react';
import { PokemonData } from '@/lib/types';
import { fetchPokemon } from '@/lib/pokeapi';
import { IconBack, IconSearch } from './icons';

const C = {
  red: '#E63946', ink: '#1D1D1F', inkSoft: '#6E6E73',
  bg: '#F7F4F2', white: '#FFFFFF', border: '#E8E5E3',
};

interface Props {
  onBack: () => void;
  onResult: (pokemon: PokemonData) => void;
}

export function SearchScreen({ onBack, onResult }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(name: string) {
    const q = name.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const pokemon = await fetchPokemon(q);
      onResult(pokemon);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Not found. Check the spelling and try again.');
    } finally {
      setLoading(false);
    }
  }

  const suggestions = ['Pikachu', 'Charizard', 'Mewtwo', 'Gengar', 'Lucario', 'Eevee'];

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{
        paddingTop: 54, background: C.white, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 12, padding: '54px 16px 12px',
      }}>
        <button onClick={onBack} style={{
          all: 'unset', cursor: 'pointer',
          width: 36, height: 36, borderRadius: 18,
          background: '#F1ECE8', color: C.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><IconBack /></button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: -0.3 }}>
          Search by name
        </div>
      </div>

      {/* Search box */}
      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#F1ECE8', borderRadius: 14, padding: '12px 14px',
        }}>
          <IconSearch />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search(query)}
            placeholder="Try &quot;Pikachu&quot; or &quot;mr-mime&quot;…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: C.ink, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ all: 'unset', cursor: 'pointer', color: C.inkSoft, fontSize: 18, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '8px 16px 0', padding: '12px 14px', background: '#FFF1F2', borderRadius: 12, fontSize: 14, color: C.red }}>
          {error}
        </div>
      )}

      {/* Search button */}
      <div style={{ padding: '12px 16px 0' }}>
        <button
          onClick={() => search(query)}
          disabled={!query.trim() || loading}
          style={{
            all: 'unset', cursor: query.trim() && !loading ? 'pointer' : 'default',
            width: '100%', boxSizing: 'border-box',
            background: query.trim() && !loading ? C.red : '#E8E5E3',
            color: '#fff',
            padding: '14px', borderRadius: 14,
            fontSize: 15, fontWeight: 700, textAlign: 'center',
            transition: 'background 150ms',
          }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Suggestions */}
      {!loading && (
        <div style={{ padding: '24px 16px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            Try one of these
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => search(s)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  fontSize: 14, padding: '8px 14px',
                  background: C.white, color: C.ink,
                  border: `1px solid ${C.border}`, borderRadius: 999,
                }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
