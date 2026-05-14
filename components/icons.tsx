export function IconCamera() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 8a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
        stroke="currentColor" strokeWidth="2"
      />
      <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-7l-4 4v-4H6a2 2 0 01-2-2V6z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4v12M12 4l-4 4M12 4l4 4M6 14v4a2 2 0 002 2h8a2 2 0 002-2v-4"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12l16-8-6 16-3-7-7-1z"
        stroke="currentColor" strokeWidth="2"
        fill="currentColor" strokeLinejoin="round"
      />
    </svg>
  );
}

export function DexMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <circle cx="20" cy="20" r="19" fill="#fff" stroke="#1D1D1F" strokeWidth="2" />
      <path d="M1 20 A19 19 0 0 1 39 20 Z" fill="#E63946" />
      <rect x="1" y="18" width="38" height="4" fill="#1D1D1F" />
      <circle cx="20" cy="20" r="6" fill="#fff" stroke="#1D1D1F" strokeWidth="2" />
      <circle cx="20" cy="20" r="2" fill="#1D1D1F" />
    </svg>
  );
}
