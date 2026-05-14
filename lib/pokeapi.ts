import { PokemonData, Move } from './types';

const BASE = 'https://pokeapi.co/api/v2';

// Defending type -> attack types that deal 2× damage
const WEAK_TO: Record<string, string[]> = {
  Normal:   ['Fighting'],
  Fire:     ['Water', 'Ground', 'Rock'],
  Water:    ['Electric', 'Grass'],
  Electric: ['Ground'],
  Grass:    ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'],
  Ice:      ['Fire', 'Fighting', 'Rock', 'Steel'],
  Fighting: ['Flying', 'Psychic', 'Fairy'],
  Poison:   ['Ground', 'Psychic'],
  Ground:   ['Water', 'Grass', 'Ice'],
  Flying:   ['Electric', 'Ice', 'Rock'],
  Psychic:  ['Bug', 'Ghost', 'Dark'],
  Bug:      ['Fire', 'Flying', 'Rock'],
  Rock:     ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'],
  Ghost:    ['Ghost', 'Dark'],
  Dragon:   ['Ice', 'Dragon', 'Fairy'],
  Dark:     ['Fighting', 'Bug', 'Fairy'],
  Steel:    ['Fire', 'Fighting', 'Ground'],
  Fairy:    ['Poison', 'Steel'],
};

// Defending type -> attack types that deal 0× (immune)
const IMMUNE_TO: Record<string, string[]> = {
  Normal:   ['Ghost'],
  Electric: ['Ground'],
  Flying:   ['Ground'],
  Ghost:    ['Normal', 'Fighting'],
  Dark:     ['Psychic'],
  Steel:    ['Poison'],
  Fairy:    ['Dragon'],
};

// Defending type -> attack types that deal 0.5× (resist)
const RESIST: Record<string, string[]> = {
  Normal:   [],
  Fire:     ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'],
  Water:    ['Fire', 'Water', 'Ice', 'Steel'],
  Electric: ['Electric', 'Flying', 'Steel'],
  Grass:    ['Water', 'Electric', 'Grass', 'Ground'],
  Ice:      ['Ice'],
  Fighting: ['Rock', 'Bug', 'Dark'],
  Poison:   ['Grass', 'Fighting', 'Poison', 'Bug', 'Fairy'],
  Ground:   ['Poison', 'Rock'],
  Flying:   ['Grass', 'Fighting', 'Bug'],
  Psychic:  ['Fighting', 'Psychic'],
  Bug:      ['Grass', 'Fighting', 'Ground'],
  Rock:     ['Normal', 'Fire', 'Poison', 'Flying'],
  Ghost:    ['Poison', 'Bug'],
  Dragon:   ['Fire', 'Water', 'Electric', 'Grass'],
  Dark:     ['Ghost', 'Dark'],
  Steel:    ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'],
  Fairy:    ['Fighting', 'Bug', 'Dark'],
};

function getWeaknesses(types: string[]): string[] {
  const allTypes = Object.keys(WEAK_TO);
  return allTypes.filter(attackType => {
    let mult = 1;
    for (const defType of types) {
      if ((IMMUNE_TO[defType] || []).includes(attackType)) mult *= 0;
      else if ((WEAK_TO[defType] || []).includes(attackType)) mult *= 2;
      else if ((RESIST[defType] || []).includes(attackType)) mult *= 0.5;
    }
    return mult > 1;
  });
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatName(slug: string): string {
  const specials: Record<string, string> = {
    'mr-mime': 'Mr. Mime', 'mime-jr': 'Mime Jr.', 'mr-rime': 'Mr. Rime',
    'ho-oh': 'Ho-Oh', 'porygon-z': 'Porygon-Z', 'type-null': 'Type: Null',
    'jangmo-o': 'Jangmo-o', 'hakamo-o': 'Hakamo-o', 'kommo-o': 'Kommo-o',
    'wo-chien': 'Wo-Chien', 'chi-yu': 'Chi-Yu', 'chien-pao': 'Chien-Pao',
    'ting-lu': 'Ting-Lu', 'great-tusk': 'Great Tusk', 'iron-treads': 'Iron Treads',
  };
  return specials[slug] ?? slug.split('-').map(cap).join(' ');
}

function formatMove(slug: string): string {
  return slug.split('-').map(cap).join(' ');
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchPokemon(nameOrId: string | number): Promise<PokemonData> {
  const slug = String(nameOrId).toLowerCase().trim().replace(/\s+/g, '-');

  const [pokeRes, speciesRes] = await Promise.all([
    fetch(`${BASE}/pokemon/${slug}`, { next: { revalidate: 3600 } }),
    fetch(`${BASE}/pokemon-species/${slug}`, { next: { revalidate: 3600 } }),
  ]);

  if (!pokeRes.ok) {
    throw new Error(pokeRes.status === 404 ? `"${nameOrId}" not found` : 'PokeAPI error');
  }

  const poke = await pokeRes.json();
  const species = speciesRes.ok ? await speciesRes.json() : null;

  // Types (capitalize)
  const types: string[] = poke.types.map((t: any) => cap(t.type.name));

  // Level-up moves sorted descending by level, take top 4
  const levelUpMoves: Array<{ name: string; url: string }> = poke.moves
    .filter((m: any) =>
      m.version_group_details.some((d: any) => d.move_learn_method.name === 'level-up')
    )
    .map((m: any) => ({
      name: m.move.name,
      url: m.move.url,
      level: Math.max(
        ...m.version_group_details
          .filter((d: any) => d.move_learn_method.name === 'level-up')
          .map((d: any) => d.level_learned_at as number)
      ),
    }))
    .sort((a: any, b: any) => b.level - a.level)
    .slice(0, 4);

  // Pad with non-level-up moves if needed
  if (levelUpMoves.length < 4) {
    const used = new Set(levelUpMoves.map((m) => m.name));
    const extras = poke.moves
      .filter((m: any) => !used.has(m.move.name))
      .slice(0, 4 - levelUpMoves.length)
      .map((m: any) => ({ name: m.move.name, url: m.move.url }));
    levelUpMoves.push(...extras);
  }

  // Fetch move details in parallel
  const moveDetails = await Promise.all(
    levelUpMoves.map((m) => fetch(m.url, { next: { revalidate: 86400 } }).then((r) => r.json()))
  );

  const moves: Move[] = moveDetails.map((md: any) => ({
    name: formatMove(md.name),
    type: cap(md.type.name),
    power: md.power ?? 0,
  }));

  // Stats
  const statMap: Record<string, string> = {
    hp: 'HP', attack: 'ATK', defense: 'DEF',
    'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
  };
  const stats: Record<string, number> = {};
  for (const s of poke.stats) {
    const key = statMap[s.stat.name];
    if (key) stats[key] = s.base_stat;
  }

  // Flavor text (most recent English entry)
  let flavor = '';
  if (species) {
    const en = species.flavor_text_entries.filter((e: any) => e.language.name === 'en');
    if (en.length) {
      flavor = en[en.length - 1].flavor_text
        .replace(/\f/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/­/g, '')
        .trim();
    }
  }

  const sprite =
    poke.sprites?.other?.['official-artwork']?.front_default ||
    poke.sprites?.front_default ||
    '';

  return {
    id: poke.id,
    name: formatName(poke.name),
    slug: poke.name,
    types,
    height: `${(poke.height / 10).toFixed(1)} m`,
    weight: `${(poke.weight / 10).toFixed(1)} kg`,
    flavor,
    sprite,
    moves,
    stats,
    weaknesses: getWeaknesses(types),
  };
}
