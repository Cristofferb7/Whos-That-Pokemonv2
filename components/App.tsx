'use client';

import { useState, useCallback } from 'react';
import { PokemonData, Screen } from '@/lib/types';
import { HomeScreen } from './HomeScreen';
import { SearchScreen } from './SearchScreen';
import { PhotoScreen } from './PhotoScreen';
import { ResultScreen } from './ResultScreen';
import { ChatScreen } from './ChatScreen';

const MAX_RECENTS = 5;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [history, setHistory] = useState<Screen[]>([]);
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [recents, setRecents] = useState<PokemonData[]>([]);

  const go = useCallback((next: Screen, payload?: PokemonData) => {
    setHistory((h) => [...h, screen]);
    if (next === 'result' && payload) {
      setPokemon(payload);
      setRecents((r) => {
        const filtered = r.filter((p) => p.id !== payload.id);
        return [payload, ...filtered].slice(0, MAX_RECENTS);
      });
    }
    setScreen(next);
  }, [screen]);

  const back = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1] ?? 'home';
      setScreen(prev);
      return h.slice(0, -1);
    });
  }, []);

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100svh', position: 'relative' }}>
      {screen === 'home' && (
        <HomeScreen onNav={go} recents={recents} />
      )}
      {screen === 'search' && (
        <SearchScreen onBack={back} onResult={(p) => go('result', p)} />
      )}
      {screen === 'photo' && (
        <PhotoScreen onBack={back} onResult={(p) => go('result', p)} />
      )}
      {screen === 'chat' && (
        <ChatScreen onBack={back} onView={(p) => go('result', p)} />
      )}
      {screen === 'result' && pokemon && (
        <ResultScreen pokemon={pokemon} onBack={back} />
      )}
    </main>
  );
}
