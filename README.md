# 🎡 Prize Wheel - Real-time Lottery Application

Application de roue de loterie temps réel pour événements, avec contrôle iPad et affichage TV.

## Features

- 🎨 **Admin Panel**: Configure colors, segments, and settings
- 📱 **iPad Controller**: Touch button + swipe gesture to spin
- 📺 **TV Display**: Real-time wheel animation with overlays
- 🔊 **Sound Effects**: Tick, win, and loss sounds
- ⚡ **Real-time Sync**: Supabase Broadcast for instant updates
- 🔒 **Atomic Locking**: Prevent concurrent spins

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Realtime + Storage)
- **Animation**: Pure CSS transforms

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project on [supabase.com](https://supabase.com)
2. Run migrations in `supabase/migrations/` (via dashboard or CLI)
3. Create Storage bucket named `logos` (public, max 2MB, image formats)
4. Copy API keys to `.env.local`

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open:
- Admin: http://localhost:3000/admin
- Play (iPad): http://localhost:3000/play
- Display (TV): http://localhost:3000/display

## Production Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

Configure environment variables in Vercel dashboard.

## Audio Files

Replace placeholder audio files in `/public/sounds/`:
- `tick.mp3`: Short click sound (50-100ms)
- `win.mp3`: Victory jingle (2-3s)
- `loss.mp3`: Soft sound (1-2s)

Recommended sources: [Freesound.org](https://freesound.org/), [Zapsplat.com](https://www.zapsplat.com/)

## Usage

1. **Configure**: Go to `/admin` and set up branding and segments
2. **Controller**: Open `/play` on iPad in fullscreen
3. **Display**: Open `/display` on TV/projector in fullscreen
4. **Spin**: Tap button or swipe up on iPad

## Architecture

See `docs/superpowers/specs/2026-05-07-prize-wheel-design.md` for detailed design.

## License

MIT
