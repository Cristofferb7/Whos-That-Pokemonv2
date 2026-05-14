'use client';

import { useRef, useState } from 'react';
import { PokemonData } from '@/lib/types';
import { fetchPokemon } from '@/lib/pokeapi';
import { IconBack, IconCamera } from './icons';

const C = {
  red: '#E63946', ink: '#1D1D1F', inkSoft: '#6E6E73',
  bg: '#F7F4F2', white: '#FFFFFF', border: '#E8E5E3',
};

interface Props {
  onBack: () => void;
  onResult: (pokemon: PokemonData) => void;
}

type Status = 'idle' | 'compressing' | 'analyzing' | 'fetching' | 'error';

// Resize + compress image to JPEG ≤ 1024px, well under Vercel's 4.5MB limit
function compressImage(file: File, maxPx = 1024, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else { width = Math.round(width * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export function PhotoScreen({ onBack, onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleFile(file: File) {
    setStatus('compressing');
    setErrorMsg('');

    // Show original as preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      // 1. Compress client-side
      const compressed = await compressImage(file);

      // 2. Ask Gemini Vision to identify
      setStatus('analyzing');
      const form = new FormData();
      form.append('image', compressed);
      const idRes = await fetch('/api/identify', { method: 'POST', body: form });
      const idData = await idRes.json();

      if (!idRes.ok) {
        throw new Error(idData.error || `Server error ${idRes.status}`);
      }
      if (!idData.name || idData.name.toLowerCase() === 'unknown') {
        throw new Error("No Pokémon found in that image. Try a clearer photo or official artwork.");
      }

      // 3. Fetch full Pokémon data
      setStatus('fetching');
      const pokemon = await fetchPokemon(idData.name);
      onResult(pokemon);
    } catch (e) {
      setStatus('error');
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  }

  const busy = status === 'compressing' || status === 'analyzing' || status === 'fetching';

  const statusLabel: Record<Status, string> = {
    idle: '',
    compressing: 'Compressing image…',
    analyzing: 'Analyzing with Gemini…',
    fetching: 'Fetching Pokémon data…',
    error: '',
  };

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 12, padding: '54px 16px 12px',
      }}>
        <button onClick={onBack} disabled={busy} style={{
          all: 'unset', cursor: busy ? 'default' : 'pointer',
          width: 36, height: 36, borderRadius: 18,
          background: '#F1ECE8', color: C.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: busy ? 0.4 : 1,
        }}><IconBack /></button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: -0.3 }}>
          Identify a photo
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 20px', gap: 16 }}>
        {/* Preview */}
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          background: '#F1ECE8', border: `2px dashed ${C.border}`,
          aspectRatio: '1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: C.inkSoft, padding: 32 }}>
              <div style={{ marginBottom: 12, opacity: 0.4 }}><IconCamera /></div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>No photo selected</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Tap below to take a photo or pick one from your gallery</div>
            </div>
          )}

          {busy && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', gap: 12,
            }}>
              <Spinner />
              <div style={{ fontSize: 15, fontWeight: 600 }}>{statusLabel[status]}</div>
            </div>
          )}
        </div>

        {/* Error */}
        {status === 'error' && (
          <div style={{ padding: '12px 14px', background: '#FFF1F2', borderRadius: 12, fontSize: 14, color: C.red }}>
            {errorMsg}
          </div>
        )}

        {/* File input — no capture attr so users can pick camera OR gallery */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          style={{
            all: 'unset', cursor: busy ? 'default' : 'pointer',
            background: busy ? '#E8E5E3' : C.red, color: '#fff',
            padding: '16px', borderRadius: 16,
            fontSize: 16, fontWeight: 700, textAlign: 'center',
            boxShadow: busy ? 'none' : '0 6px 18px rgba(230,57,70,0.32)',
            transition: 'background 150ms',
          }}
        >
          {busy ? 'Processing…' : preview ? 'Choose a different photo' : 'Take or upload a photo'}
        </button>

        <div style={{ fontSize: 13, color: C.inkSoft, textAlign: 'center', lineHeight: 1.5 }}>
          Works best with official artwork, card scans, or clear in-game screenshots.
          Gemini Vision identifies the Pokémon.
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 18,
      border: '3px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      animation: 'spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
