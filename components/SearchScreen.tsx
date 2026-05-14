'use client';

import { useEffect, useRef, useState } from 'react';
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

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatSuggestion(slug: string) {
  const specials: Record<string, string> = {
    'mr-mime': 'Mr. Mime', 'mime-jr': 'Mime Jr.', 'mr-rime': 'Mr. Rime',
    'ho-oh': 'Ho-Oh', 'porygon-z': 'Porygon-Z', 'type-null': 'Type: Null',
  };
  return specials[slug] ?? slug.split('-').map(cap).join(' ');
}

export function SearchScreen({ onBack, onResult }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allNames, setAllNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Fetch full Pokémon name list once
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
      .then((r) => r.json())
      .then((d) => setAllNames(d.results.map((p: { name: string }) => p.name)))
      .catch(() => {/* non-critical */});
  }, []);

  // Filter suggestions as query changes
  useEffect(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, '-');
    if (!q || allNames.length === 0) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    const matches = allNames
      .filter((n) => n.startsWith(q))
      .slice(0, 8);
    setSuggestions(matches);
    setShowDrop(matches.length > 0);
  }, [query, allNames]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDrop(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function search(name: string) {
    const q = name.trim();
    if (!q) return;
    setShowDrop(false);
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

  function pickSuggestion(slug: string) {
    setQuery(formatSuggestion(slug));
    setShowDrop(false);
    search(slug);
  }

  const quickPicks = ['Pikachu', 'Charizard', 'Mewtwo', 'Gengar', 'Lucario', 'Eevee'];

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
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

      {/* Search box + dropdown */}
      <div style={{ padding: '14px 16px 0', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#F1ECE8', borderRadius: showDrop ? '14px 14px 0 0' : 14,
          padding: '12px 14px',
          borderBottom: showDrop ? `1px solid ${C.border}` : 'none',
        }}>
          <IconSearch />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') search(query);
              if (e.key === 'Escape') setShowDrop(false);
            }}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            placeholder='Try "Pikachu" or "Gengar"…'
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: C.ink, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSuggestions([]); setShowDrop(false); }}
              style={{ all: 'unset', cursor: 'pointer', color: C.inkSoft, fontSize: 18, lineHeight: 1 }}
            >×</button>
          )}
        </div>

        {/* Dropdown */}
        {showDrop && (
          <div ref={dropRef} style={{
            position: 'absolute', left: 16, right: 16,
            background: '#F1ECE8',
            borderRadius: '0 0 14px 14px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}>
            {suggestions.map((slug, i) => (
              <button
                key={slug}
                onMouseDown={(e) => { e.preventDefault(); pickSuggestion(slug); }}
                style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
                  fontSize: 15, color: C.ink,
                  transition: 'background 80ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: C.inkSoft, fontSize: 13 }}>
                  <IconSearch />
                </span>
                <span style={{ flex: 1 }}>{formatSuggestion(slug)}</span>
              </button>
            ))}
          </div>
        )}
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

      {/* Quick picks */}
      {!loading && (
        <div style={{ padding: '24px 16px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            Try one of these
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {quickPicks.map((s) => (
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
