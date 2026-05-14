import { TYPE_COLORS } from '@/lib/typeColors';

interface Props {
  type: string;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'md' }: Props) {
  const c = TYPE_COLORS[type] ?? { bg: '#888', fg: '#fff' };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        fontSize: size === 'sm' ? 11 : 13,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        padding: size === 'sm' ? '3px 10px' : '5px 14px',
        borderRadius: 999,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      }}
    >
      {type}
    </span>
  );
}
