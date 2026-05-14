# Who's That Pokémon? 🔴

A mobile-first web app that identifies any Pokémon three ways — snap a photo, type a name, or describe what you saw to AI.

## Features

### 📸 Photo Identification
Upload a photo or take one with your camera. Gemini Vision analyzes the image and identifies the Pokémon, then fetches full data from PokéAPI.

### 🔍 Search by Name
Type any Pokémon name and get an instant result card with stats, moves, and type matchups pulled directly from PokéAPI.

### 💬 Describe it to AI
Chat with PokéDex AI — describe what the Pokémon looks like and it asks follow-up questions to narrow it down. Once confident, it reveals the match.

## Result Card
Every identified Pokémon shows:
- Official artwork sprite
- Type badges with accurate colors
- Base stats (HP, ATK, DEF, SP.ATK, SP.DEF, SPD) with animated bars
- Top moves with power values
- Type weaknesses
- Height, weight, and Pokédex flavor text

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI — Primary | Google Gemini 2.0 Flash |
| AI — Fallback | Anthropic Claude Haiku |
| Pokémon Data | [PokéAPI](https://pokeapi.co) (free, no key needed) |
| Deployment | Vercel |

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/Cristofferb7/Whos-That-Pokemonv2.git
cd Whos-That-Pokemonv2
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and add your keys:
```
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
```
- Get a Gemini key at [aistudio.google.com](https://aistudio.google.com/app/apikey) (free tier available)
- Get a Claude key at [console.anthropic.com](https://console.anthropic.com) (pay-as-you-go)

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Cristofferb7/Whos-That-Pokemonv2)

Or manually:
1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Add `GEMINI_API_KEY` and `ANTHROPIC_API_KEY` in Environment Variables
3. Deploy

## Project Structure

```
app/
  api/identify/     # Vision endpoint — Gemini → Claude fallback
  api/chat/         # Chat endpoint  — Gemini → Claude fallback
components/
  HomeScreen        # Landing page with 3 action buttons + recents
  PhotoScreen       # Camera/upload flow
  SearchScreen      # Name search
  ChatScreen        # AI describe flow with match card
  ResultScreen      # Full Pokémon detail card
lib/
  pokeapi.ts        # PokéAPI fetcher + data normalizer
  typeColors.ts     # 18 Pokémon type colors
  types.ts          # TypeScript interfaces
```
