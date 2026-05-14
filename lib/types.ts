export interface PokemonData {
  id: number;
  name: string;
  slug: string;
  types: string[];
  height: string;
  weight: string;
  flavor: string;
  sprite: string;
  moves: Move[];
  stats: Record<string, number>;
  weaknesses: string[];
}

export interface Move {
  name: string;
  type: string;
  power: number;
}

export type Screen = 'home' | 'result' | 'chat' | 'search' | 'photo';
