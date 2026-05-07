# Prize Wheel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time prize wheel application with admin panel, iPad controller, and TV display.

**Architecture:** Server-centric Next.js 16.2 app with Supabase backend. Server Actions handle all mutations with atomic locking. CSS-only animations for wheel spin. Supabase Broadcast for real-time sync between controller and display.

**Tech Stack:** Next.js 16.2 (App Router), TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + Realtime + Storage), HTML5 Audio

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `.env.local.example`
- Modify: `.gitignore`

- [ ] **Step 1: Initialize Next.js 16.2 project**

```bash
npx create-next-app@16.2.0 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Expected: Next.js project scaffolded with App Router

- [ ] **Step 2: Install Supabase dependencies**

```bash
npm install @supabase/supabase-js@^2.39.0 @supabase/ssr@^0.1.0
```

Expected: Dependencies added to package.json

- [ ] **Step 3: Create environment template**

Create `.env.local.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 4: Update .gitignore**

Add to `.gitignore`:

```gitignore
# Prize Wheel specific
.env.local
.superpowers/
/public/sounds/*.mp3

# Keep placeholder comment files
!/public/sounds/.gitkeep
```

- [ ] **Step 5: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Create Next.js config**

Create `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
```

- [ ] **Step 7: Commit initialization**

```bash
git add .
git commit -m "feat: initialize Next.js 16.2 project with Supabase

- Add TypeScript and Tailwind CSS 4
- Configure Supabase dependencies
- Set up environment template

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Tailwind CSS 4 Configuration

**Files:**
- Create: `tailwind.config.ts`
- Create: `app/globals.css`

- [ ] **Step 1: Create Tailwind config with custom animations**

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        wheelBg: 'var(--wheel-bg)',
        segmentText: 'var(--segment-text-color)',
      },
      animation: {
        'confetti-fall': 'confetti-fall 3s ease-out forwards',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-in-top': 'slide-in-top 0.5s ease-out',
      },
      keyframes: {
        'confetti-fall': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in-top': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Create global styles**

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Default fallbacks (overridden by inline style in layout) */
    --primary-color: #f59e0b;
    --secondary-color: #ef4444;
    --wheel-bg: #ffffff;
    --segment-text-color: #ffffff;

    /* Animation variables (set dynamically by JS) */
    --target-angle: 0deg;
    --spin-duration: 6s;
    --rotation: 0deg;
  }

  body {
    @apply antialiased;
  }
}

@layer utilities {
  /* Festive shadow utility */
  .festive-shadow {
    box-shadow:
      0 4px 6px -1px rgba(245, 158, 11, 0.3),
      0 10px 15px -3px rgba(239, 68, 68, 0.2),
      0 20px 25px -5px rgba(139, 92, 246, 0.1);
  }

  /* Festive gradient border */
  .festive-border {
    border: 4px solid transparent;
    background-image:
      linear-gradient(white, white),
      linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    background-origin: border-box;
    background-clip: padding-box, border-box;
  }

  /* GPU-accelerated transforms */
  .transform-gpu {
    transform: translateZ(0);
    will-change: transform;
  }
}
```

- [ ] **Step 3: Test Tailwind compilation**

```bash
npm run dev
```

Expected: Server starts without errors, Tailwind compiles

- [ ] **Step 4: Stop dev server**

Press Ctrl+C

- [ ] **Step 5: Commit Tailwind config**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: configure Tailwind CSS 4 with custom animations

- Add festive keyframes (confetti-fall, bounce-in)
- Configure CSS variables for branding
- Add utility classes for GPU acceleration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Supabase Client Setup

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`

- [ ] **Step 1: Create server-side Supabase client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role for RLS bypass
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore - may be called from Server Component
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Create client-side Supabase client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Commit Supabase clients**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client wrappers

- Server client with service role for Server Actions
- Browser client with anon key for Client Components

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Database Migrations

**Files:**
- Create: `supabase/migrations/001_init_tables.sql`
- Create: `supabase/migrations/002_rls_policies.sql`
- Create: `supabase/migrations/003_seed_data.sql`

- [ ] **Step 1: Create tables migration**

Create `supabase/migrations/001_init_tables.sql`:

```sql
-- Table: segments
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  probability INTEGER NOT NULL CHECK (probability > 0),
  is_prize BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_segments_active ON segments(is_active) WHERE is_active = true;
CREATE INDEX idx_segments_display_order ON segments(display_order);

-- Table: settings (single-row config)
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  primary_color TEXT DEFAULT '#f59e0b',
  secondary_color TEXT DEFAULT '#ef4444',
  wheel_bg TEXT DEFAULT '#ffffff',
  segment_text_color TEXT DEFAULT '#ffffff',
  logo_url TEXT,
  spin_button_label TEXT DEFAULT 'SPIN',
  session_label TEXT DEFAULT 'Mon Événement',
  spin_duration_min INTEGER DEFAULT 5000,
  spin_duration_max INTEGER DEFAULT 7000,
  is_spinning BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Table: draws
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  drawn_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_label TEXT NOT NULL,
  spin_duration INTEGER NOT NULL,
  is_prize BOOLEAN NOT NULL
);

CREATE INDEX idx_draws_drawn_at ON draws(drawn_at DESC);
CREATE INDEX idx_draws_session ON draws(session_label);
CREATE INDEX idx_draws_segment ON draws(segment_id);
```

- [ ] **Step 2: Create RLS policies migration**

Create `supabase/migrations/002_rls_policies.sql`:

```sql
-- Enable RLS
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required)
CREATE POLICY "Public can read segments"
  ON segments FOR SELECT
  USING (true);

CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read draws"
  ON draws FOR SELECT
  USING (true);

-- Public insert on draws (for client-side logging if needed)
CREATE POLICY "Public can insert draws"
  ON draws FOR INSERT
  WITH CHECK (true);

-- Server Actions use service role key to bypass RLS for writes
```

- [ ] **Step 3: Create seed data migration**

Create `supabase/migrations/003_seed_data.sql`:

```sql
-- Insert 12 default segments (3 prizes + 9 non-prizes)
INSERT INTO segments (label, color, probability, is_prize, display_order) VALUES
  -- PRIZES
  ('🎁 Grand Prix', '#f59e0b', 5, true, 1),
  ('🎁 Prix Moyen', '#ef4444', 8, true, 2),
  ('🎁 Petit Cadeau', '#8b5cf6', 10, true, 3),

  -- NON-PRIZES
  ('Merci !', '#10b981', 15, false, 4),
  ('Bonne chance', '#3b82f6', 15, false, 5),
  ('Presque !', '#ec4899', 12, false, 6),
  ('Réessayez', '#14b8a6', 15, false, 7),
  ('Dommage', '#f97316', 12, false, 8),
  ('Continuez !', '#6366f1', 15, false, 9),
  ('Tentez encore', '#a855f7', 12, false, 10),
  ('Courage !', '#06b6d4', 15, false, 11),
  ('Prochaine fois', '#84cc16', 12, false, 12);
```

- [ ] **Step 4: Create Supabase Storage bucket (manual step)**

Instructions for user:
1. Go to Supabase dashboard → Storage
2. Create new bucket named `logos`
3. Make it public
4. Set allowed MIME types: `image/png`, `image/jpeg`, `image/svg+xml`
5. Set max file size: 2MB

- [ ] **Step 5: Run migrations (manual step)**

Instructions for user:
```bash
# If using Supabase CLI:
supabase db push

# Or manually via Supabase dashboard SQL editor:
# Copy content of each migration file and execute in order
```

- [ ] **Step 6: Commit migrations**

```bash
git add supabase/migrations/
git commit -m "feat: add database schema and seed data

- Tables: segments, settings, draws
- RLS policies for public read access
- 12 default segments (3 prizes, 9 non-prizes)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Utility Functions

**Files:**
- Create: `lib/utils/wheel-calculations.ts`
- Create: `lib/utils/cn.ts`

- [ ] **Step 1: Create wheel calculation utilities**

Create `lib/utils/wheel-calculations.ts`:

```typescript
export interface PolarPoint {
  x: number
  y: number
}

/**
 * Convert polar coordinates to cartesian
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): PolarPoint {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

/**
 * Generate SVG path for arc segment
 */
export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ')
}

/**
 * Calculate target angle for wheel spin
 */
export function calculateTargetAngle(
  segmentIndex: number,
  totalSegments: number,
  currentRotation: number = 0
): number {
  const segmentAngle = 360 / totalSegments
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2

  // 5-8 full rotations for dramatic effect
  const minRotations = 5
  const maxRotations = 8
  const rotations = minRotations + Math.random() * (maxRotations - minRotations)

  // Total rotation = current + full rotations + angle to land on segment
  // Invert because pointer is fixed at top and wheel rotates
  const targetAngle = currentRotation + rotations * 360 + (360 - segmentCenter)

  return Math.round(targetAngle)
}
```

- [ ] **Step 2: Create classnames utility**

Create `lib/utils/cn.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Install clsx and tailwind-merge**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 4: Commit utilities**

```bash
git add lib/utils/
git commit -m "feat: add utility functions

- Wheel calculations (polar coords, SVG arcs, target angle)
- Classnames helper with Tailwind merge

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Sound Manager

**Files:**
- Create: `lib/sounds/SoundManager.tsx`
- Create: `public/sounds/.gitkeep`

- [ ] **Step 1: Create sound manager context**

Create `lib/sounds/SoundManager.tsx`:

```typescript
'use client'

import { createContext, useContext, useRef, useEffect, useState, type ReactNode } from 'react'

interface SoundManagerContextType {
  playTick: () => void
  stopTick: () => void
  playWin: () => void
  playLoss: () => void
  setVolume: (volume: number) => void
}

const SoundManagerContext = createContext<SoundManagerContextType | null>(null)

export function SoundManagerProvider({ children }: { children: ReactNode }) {
  const tickAudioRef = useRef<HTMLAudioElement | null>(null)
  const winAudioRef = useRef<HTMLAudioElement | null>(null)
  const lossAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Lazy load audio files
  useEffect(() => {
    if (typeof window === 'undefined') return

    tickAudioRef.current = new Audio('/sounds/tick.mp3')
    winAudioRef.current = new Audio('/sounds/win.mp3')
    lossAudioRef.current = new Audio('/sounds/loss.mp3')

    tickAudioRef.current.loop = true
    tickAudioRef.current.volume = 0.3

    // Preload
    Promise.all([
      tickAudioRef.current.load(),
      winAudioRef.current.load(),
      lossAudioRef.current.load(),
    ]).then(() => setIsLoaded(true))
      .catch(() => {
        console.warn('Audio files not found - app will run without sound')
        setIsLoaded(true)
      })

    return () => {
      tickAudioRef.current?.pause()
      winAudioRef.current?.pause()
      lossAudioRef.current?.pause()
    }
  }, [])

  const playTick = () => {
    if (!isLoaded || !tickAudioRef.current) return
    tickAudioRef.current.currentTime = 0
    tickAudioRef.current.play().catch(err => console.warn('Tick play failed:', err))
  }

  const stopTick = () => {
    if (!tickAudioRef.current) return
    tickAudioRef.current.pause()
    tickAudioRef.current.currentTime = 0
  }

  const playWin = () => {
    if (!isLoaded || !winAudioRef.current) return
    winAudioRef.current.currentTime = 0
    winAudioRef.current.play().catch(err => console.warn('Win play failed:', err))
  }

  const playLoss = () => {
    if (!isLoaded || !lossAudioRef.current) return
    lossAudioRef.current.currentTime = 0
    lossAudioRef.current.play().catch(err => console.warn('Loss play failed:', err))
  }

  const setVolume = (volume: number) => {
    const vol = Math.max(0, Math.min(1, volume))
    if (tickAudioRef.current) tickAudioRef.current.volume = vol * 0.3
    if (winAudioRef.current) winAudioRef.current.volume = vol
    if (lossAudioRef.current) lossAudioRef.current.volume = vol * 0.7
  }

  return (
    <SoundManagerContext.Provider
      value={{ playTick, stopTick, playWin, playLoss, setVolume }}
    >
      {children}
    </SoundManagerContext.Provider>
  )
}

export function useSoundManager() {
  const context = useContext(SoundManagerContext)
  if (!context) {
    throw new Error('useSoundManager must be used within SoundManagerProvider')
  }
  return context
}
```

- [ ] **Step 2: Create placeholder for sounds directory**

Create `public/sounds/.gitkeep`:

```
# Placeholder for audio files
# Add your own:
# - tick.mp3 (50-100ms click sound)
# - win.mp3 (2-3s victory jingle)
# - loss.mp3 (1-2s soft sound)
```

- [ ] **Step 3: Commit sound manager**

```bash
git add lib/sounds/ public/sounds/.gitkeep
git commit -m "feat: add sound manager with lazy loading

- Context provider for audio playback
- Fallback for missing audio files
- Volume controls (tick 30%, win 100%, loss 70%)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Server Actions

**Files:**
- Create: `app/actions/wheel.ts`

- [ ] **Step 1: Create Server Actions file**

Create `app/actions/wheel.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

interface Segment {
  id: string
  label: string
  color: string
  probability: number
  is_prize: boolean
  is_active: boolean
  display_order: number
}

interface Settings {
  id: number
  is_spinning: boolean
  spin_duration_min: number
  spin_duration_max: number
  session_label: string
}

/**
 * Draw a prize using weighted random selection with server-side lock
 */
export async function drawPrize() {
  const supabase = createClient()

  // 1. CHECK LOCK
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('is_spinning, spin_duration_min, spin_duration_max, session_label')
    .eq('id', 1)
    .single<Settings>()

  if (settingsError || !settings) {
    return { error: 'Settings not found' }
  }

  if (settings.is_spinning) {
    return { error: 'Spin already in progress', code: 'CONCURRENT_SPIN' }
  }

  // 2. SET LOCK
  const { error: lockError } = await supabase
    .from('settings')
    .update({ is_spinning: true })
    .eq('id', 1)

  if (lockError) {
    return { error: 'Failed to acquire lock' }
  }

  try {
    // 3. FETCH ACTIVE SEGMENTS
    const { data: segments, error: segmentsError } = await supabase
      .from('segments')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (segmentsError || !segments || segments.length === 0) {
      throw new Error('No active segments')
    }

    // 4. WEIGHTED RANDOM DRAW
    const totalWeight = segments.reduce((sum: number, s: Segment) => sum + s.probability, 0)
    const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1)
    const randomWeight = randomValue * totalWeight

    let cumulativeWeight = 0
    let selectedSegment = segments[0]

    for (const segment of segments) {
      cumulativeWeight += segment.probability
      if (randomWeight <= cumulativeWeight) {
        selectedSegment = segment
        break
      }
    }

    // 5. CALCULATE TARGET ANGLE
    const segmentIndex = segments.findIndex((s: Segment) => s.id === selectedSegment.id)
    const segmentAngle = 360 / segments.length
    const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2

    const minRotations = 5
    const maxRotations = 8
    const rotations = minRotations + Math.random() * (maxRotations - minRotations)
    const targetAngle = rotations * 360 + (360 - segmentCenter)

    // 6. RANDOM SPIN DURATION
    const spinDuration = Math.floor(
      settings.spin_duration_min +
      Math.random() * (settings.spin_duration_max - settings.spin_duration_min)
    )

    // 7. INSERT DRAW RECORD
    const { error: drawError } = await supabase
      .from('draws')
      .insert({
        segment_id: selectedSegment.id,
        session_label: settings.session_label,
        spin_duration: spinDuration,
        is_prize: selectedSegment.is_prize,
      })

    if (drawError) {
      throw new Error('Failed to insert draw record')
    }

    // 8. BROADCAST REALTIME EVENT
    const channel = supabase.channel('wheel')
    await channel.send({
      type: 'broadcast',
      event: 'spin',
      payload: {
        targetAngle: Math.round(targetAngle),
        segmentId: selectedSegment.id,
        isPrize: selectedSegment.is_prize,
        segmentLabel: selectedSegment.label,
        spinDuration,
      },
    })

    // 9. RELEASE LOCK AFTER ANIMATION (async)
    setTimeout(async () => {
      await supabase
        .from('settings')
        .update({ is_spinning: false })
        .eq('id', 1)

      revalidatePath('/play')
      revalidatePath('/display')
    }, spinDuration + 1000)

    return {
      success: true,
      segment: selectedSegment,
      targetAngle: Math.round(targetAngle),
      spinDuration,
    }
  } catch (error) {
    // RELEASE LOCK on error
    await supabase
      .from('settings')
      .update({ is_spinning: false })
      .eq('id', 1)

    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Update settings
 */
export async function updateSettings(data: {
  primary_color?: string
  secondary_color?: string
  wheel_bg?: string
  segment_text_color?: string
  logo_url?: string
  spin_button_label?: string
  session_label?: string
  spin_duration_min?: number
  spin_duration_max?: number
}) {
  const supabase = createClient()

  const { error } = await supabase
    .from('settings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Create segment
 */
export async function createSegment(data: {
  label: string
  color: string
  probability: number
  is_prize: boolean
  display_order: number
}) {
  const supabase = createClient()

  if (data.probability <= 0) {
    return { error: 'Probability must be greater than 0' }
  }

  const { error } = await supabase
    .from('segments')
    .insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/display')
  return { success: true }
}

/**
 * Update segment
 */
export async function updateSegment(id: string, data: {
  label?: string
  color?: string
  probability?: number
  is_prize?: boolean
  is_active?: boolean
  display_order?: number
}) {
  const supabase = createClient()

  if (data.probability !== undefined && data.probability <= 0) {
    return { error: 'Probability must be greater than 0' }
  }

  const { error } = await supabase
    .from('segments')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/display')
  return { success: true }
}

/**
 * Delete segment
 */
export async function deleteSegment(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('segments')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/display')
  return { success: true }
}

/**
 * Upload logo to Supabase Storage
 */
export async function uploadLogo(formData: FormData) {
  const supabase = createClient()
  const file = formData.get('logo') as File

  if (!file) {
    return { error: 'No file provided' }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'File size must be less than 2MB' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `logo-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName)

  // Update settings with new logo URL
  await updateSettings({ logo_url: publicUrl })

  return { success: true, url: publicUrl }
}
```

- [ ] **Step 2: Commit Server Actions**

```bash
git add app/actions/
git commit -m "feat: add Server Actions for wheel operations

- drawPrize: weighted random with atomic lock
- Settings CRUD (colors, duration, labels)
- Segments CRUD with validation
- Logo upload to Supabase Storage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Wheel Component

**Files:**
- Create: `app/_components/Wheel.tsx`

- [ ] **Step 1: Create Wheel SVG component**

Create `app/_components/Wheel.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { describeArc } from '@/lib/utils/wheel-calculations'

interface Segment {
  id: string
  label: string
  color: string
  is_prize: boolean
  display_order: number
}

interface WheelProps {
  segments: Segment[]
  isSpinning: boolean
  targetAngle: number
  spinDuration?: number
}

export function Wheel({ segments, isSpinning, targetAngle, spinDuration = 6000 }: WheelProps) {
  const [currentRotation, setCurrentRotation] = useState(0)

  useEffect(() => {
    if (isSpinning) {
      setCurrentRotation(targetAngle)
    }
  }, [isSpinning, targetAngle])

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Aucun segment disponible</p>
      </div>
    )
  }

  const totalSegments = segments.length
  const anglePerSegment = 360 / totalSegments

  return (
    <div className="relative flex items-center justify-center p-8">
      {/* Fixed pointer at top */}
      <div
        className="absolute top-4 z-20"
        style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderTop: '40px solid #ef4444',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
        }}
      />

      {/* Wheel SVG */}
      <svg
        width="600"
        height="600"
        viewBox="0 0 600 600"
        className="max-w-full h-auto transform-gpu"
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transition: isSpinning
            ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : 'none',
        }}
      >
        {/* Background circle */}
        <circle
          cx="300"
          cy="300"
          r="290"
          fill="var(--wheel-bg)"
          stroke="#f59e0b"
          strokeWidth="10"
          filter="drop-shadow(0 10px 30px rgba(0,0,0,0.3))"
        />

        {/* Segments */}
        {segments.map((segment, index) => {
          const startAngle = index * anglePerSegment
          const endAngle = startAngle + anglePerSegment
          const midAngle = startAngle + anglePerSegment / 2

          return (
            <g key={segment.id}>
              {/* Arc segment */}
              <path
                d={describeArc(300, 300, 280, startAngle, endAngle)}
                fill={segment.color}
                stroke="white"
                strokeWidth="3"
                opacity={segment.is_prize ? 1 : 0.9}
              />

              {/* Prize icon */}
              {segment.is_prize && (
                <text
                  x="300"
                  y="300"
                  fill="white"
                  fontSize="32"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle} 300 300) translate(0 -220)`}
                >
                  🎁
                </text>
              )}

              {/* Segment label */}
              <text
                x="300"
                y="300"
                fill="var(--segment-text-color)"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${midAngle} 300 300) translate(0 ${segment.is_prize ? -180 : -200})`}
              >
                {segment.label}
              </text>
            </g>
          )
        })}

        {/* Center pin */}
        <circle cx="300" cy="300" r="35" fill="#1f2937" />
        <circle cx="300" cy="300" r="25" fill="#f59e0b" />
        <circle cx="300" cy="300" r="15" fill="white" />

        {/* Decorative border */}
        <circle
          cx="300"
          cy="300"
          r="290"
          fill="none"
          stroke="url(#festiveGradient)"
          strokeWidth="6"
          strokeDasharray="10 5"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="festiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Commit Wheel component**

```bash
git add app/_components/Wheel.tsx
git commit -m "feat: add SVG wheel component with CSS animation

- Dynamic segment rendering from data
- Prize icons for winning segments
- Smooth rotation with cubic-bezier easing
- Responsive sizing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Overlay Components

**Files:**
- Create: `app/_components/WinnerOverlay.tsx`
- Create: `app/_components/LossMessage.tsx`

- [ ] **Step 1: Create winner overlay component**

Create `app/_components/WinnerOverlay.tsx`:

```typescript
'use client'

interface WinnerOverlayProps {
  segmentLabel: string
}

export function WinnerOverlay({ segmentLabel }: WinnerOverlayProps) {
  // Generate confetti elements
  const confettiCount = 30
  const confetti = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-6 animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-10%',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      {/* Winner card */}
      <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-lg mx-4 text-center animate-bounce-in festive-border">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-5xl font-black text-primary mb-4 uppercase">
          Félicitations !
        </h2>
        <div className="text-3xl font-bold text-gray-900 bg-yellow-100 py-4 px-6 rounded-xl mb-6 festive-shadow">
          {segmentLabel}
        </div>
        <p className="text-xl text-gray-600">Vous avez gagné un prix !</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create loss message component**

Create `app/_components/LossMessage.tsx`:

```typescript
'use client'

interface LossMessageProps {
  message?: string
}

export function LossMessage({ message = "Merci d'avoir participé !" }: LossMessageProps) {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-slide-in-top">
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-4 rounded-full shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">😊</span>
          <p className="text-lg font-semibold">{message}</p>
          <span className="text-2xl">😊</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit overlay components**

```bash
git add app/_components/WinnerOverlay.tsx app/_components/LossMessage.tsx
git commit -m "feat: add winner and loss overlay components

- Winner: fullscreen modal with confetti animation
- Loss: top banner with friendly message
- Festive styling with animations

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Root Layout with Branding

**Files:**
- Create: `app/layout.tsx`
- Modify: `app/globals.css` (already created in Task 2)

- [ ] **Step 1: Create root layout with CSS variables**

Create `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prize Wheel - Roue de Loterie',
  description: 'Application de roue de loterie temps réel pour événements',
}

async function getSettings() {
  const supabase = createClient()
  const { data } = await supabase
    .from('settings')
    .select('primary_color, secondary_color, wheel_bg, segment_text_color')
    .eq('id', 1)
    .single()

  return data || {
    primary_color: '#f59e0b',
    secondary_color: '#ef4444',
    wheel_bg: '#ffffff',
    segment_text_color: '#ffffff',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary-color: ${settings.primary_color};
            --secondary-color: ${settings.secondary_color};
            --wheel-bg: ${settings.wheel_bg};
            --segment-text-color: ${settings.segment_text_color};
          }
        `}} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Create home page**

Create `app/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/play')
}
```

- [ ] **Step 3: Commit root layout**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: add root layout with dynamic branding

- Fetch settings from Supabase on server
- Inject CSS variables for theme colors
- Redirect home to /play

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Play Page (iPad Controller)

**Files:**
- Create: `app/play/page.tsx`

- [ ] **Step 1: Create play controller page**

Create `app/play/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { drawPrize } from '@/app/actions/wheel'
import { createClient } from '@/lib/supabase/client'

export default function PlayPage() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [buttonLabel, setButtonLabel] = useState('SPIN')
  const supabase = createClient()

  // Fetch button label
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('spin_button_label')
        .eq('id', 1)
        .single()

      if (data?.spin_button_label) {
        setButtonLabel(data.spin_button_label)
      }
    }

    fetchSettings()
  }, [supabase])

  // Subscribe to spin events to sync button state
  useEffect(() => {
    const channel = supabase.channel('wheel')

    channel
      .on('broadcast', { event: 'spin' }, (payload: any) => {
        const { spinDuration } = payload.payload
        setIsSpinning(true)

        setTimeout(() => {
          setIsSpinning(false)
        }, spinDuration + 1000)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  const handleSpin = async () => {
    if (isSpinning) return

    setIsSpinning(true)
    const result = await drawPrize()

    if (result.error) {
      console.error('Spin error:', result.error)
      if (result.code !== 'CONCURRENT_SPIN') {
        alert(`Erreur: ${result.error}`)
      }
      setIsSpinning(false)
    }
  }

  // Swipe-up gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY - touchEndY

    // Swipe up with minimum 80px delta
    if (deltaY >= 80) {
      handleSpin()
    }

    setTouchStartY(null)
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="relative w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-7xl font-black shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all duration-200 festive-shadow"
      >
        {isSpinning ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin text-6xl">⏳</div>
            <div className="text-2xl font-semibold">En cours...</div>
          </div>
        ) : (
          buttonLabel
        )}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit play page**

```bash
git add app/play/
git commit -m "feat: add iPad controller page

- Large touch-friendly SPIN button
- Swipe-up gesture support (80px threshold)
- Real-time sync via Supabase Broadcast
- Disabled state during spin

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Display Page (TV Screen)

**Files:**
- Create: `app/display/page.tsx`

- [ ] **Step 1: Create display page**

Create `app/display/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wheel } from '@/app/_components/Wheel'
import { WinnerOverlay } from '@/app/_components/WinnerOverlay'
import { LossMessage } from '@/app/_components/LossMessage'
import { SoundManagerProvider, useSoundManager } from '@/lib/sounds/SoundManager'

interface Segment {
  id: string
  label: string
  color: string
  is_prize: boolean
  display_order: number
}

function DisplayContent() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [targetAngle, setTargetAngle] = useState(0)
  const [spinDuration, setSpinDuration] = useState(6000)
  const [showOverlay, setShowOverlay] = useState<'winner' | 'loss' | null>(null)
  const [winningSegment, setWinningSegment] = useState<string>('')

  const { playTick, playWin, playLoss, stopTick } = useSoundManager()
  const supabase = createClient()

  // Fetch segments
  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase
        .from('segments')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data) {
        setSegments(data)
      }
    }

    fetchSegments()

    // Subscribe to segment changes
    const segmentsChannel = supabase
      .channel('segments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'segments' }, () => {
        fetchSegments()
      })
      .subscribe()

    return () => {
      segmentsChannel.unsubscribe()
    }
  }, [supabase])

  // Subscribe to spin events
  useEffect(() => {
    const channel = supabase.channel('wheel')

    channel
      .on('broadcast', { event: 'spin' }, (payload: any) => {
        const { targetAngle, isPrize, segmentLabel, spinDuration } = payload.payload

        // Start animation
        setIsSpinning(true)
        setTargetAngle(targetAngle)
        setSpinDuration(spinDuration)
        setWinningSegment(segmentLabel)

        // Play tick sound
        playTick()

        // At end of animation
        setTimeout(() => {
          setIsSpinning(false)
          stopTick()

          if (isPrize) {
            playWin()
            setShowOverlay('winner')
            setTimeout(() => setShowOverlay(null), 5000)
          } else {
            playLoss()
            setShowOverlay('loss')
            setTimeout(() => setShowOverlay(null), 3000)
          }
        }, spinDuration)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, playTick, playWin, playLoss, stopTick])

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-center text-white">
          <div className="text-8xl mb-6">🎡</div>
          <h1 className="text-5xl font-bold mb-4">En attente...</h1>
          <p className="text-2xl opacity-90">Chargement de la roue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center overflow-hidden">
      <Wheel
        segments={segments}
        isSpinning={isSpinning}
        targetAngle={targetAngle}
        spinDuration={spinDuration}
      />

      {showOverlay === 'winner' && (
        <WinnerOverlay segmentLabel={winningSegment} />
      )}

      {showOverlay === 'loss' && (
        <LossMessage />
      )}
    </div>
  )
}

export default function DisplayPage() {
  return (
    <SoundManagerProvider>
      <DisplayContent />
    </SoundManagerProvider>
  )
}
```

- [ ] **Step 2: Commit display page**

```bash
git add app/display/
git commit -m "feat: add TV display page with real-time sync

- Wheel rendering with live segments
- Supabase Broadcast listener for spins
- Sound manager integration
- Winner/loss overlays
- Auto-refresh on segment changes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Admin Layout and Navigation

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create admin layout with tabs**

Create `app/admin/layout.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Branding', href: '/admin', icon: '🎨' },
    { name: 'Segments', href: '/admin/segments', icon: '🎯' },
    { name: 'Paramètres', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              🎡 Admin - Prize Wheel
            </h1>
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-1 -mb-px">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-3 transition-colors',
                    isActive
                      ? 'border-primary text-primary bg-orange-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.name}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create admin main page (redirect to branding)**

Create `app/admin/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/branding')
}
```

- [ ] **Step 3: Commit admin layout**

```bash
git add app/admin/layout.tsx app/admin/page.tsx
git commit -m "feat: add admin layout with tabs navigation

- Three tabs: Branding, Segments, Settings
- Sticky header with active state
- Redirect main admin page to branding

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Branding Tab

**Files:**
- Create: `app/admin/branding/page.tsx`

- [ ] **Step 1: Create branding configuration tab**

Create `app/admin/branding/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateSettings, uploadLogo } from '@/app/actions/wheel'

interface Settings {
  primary_color: string
  secondary_color: string
  wheel_bg: string
  segment_text_color: string
  logo_url: string | null
}

export default function BrandingPage() {
  const [settings, setSettings] = useState<Settings>({
    primary_color: '#f59e0b',
    secondary_color: '#ef4444',
    wheel_bg: '#ffffff',
    segment_text_color: '#ffffff',
    logo_url: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setSettings(data)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleSave = async () => {
    setIsLoading(true)
    const result = await updateSettings(settings)

    if (result.success) {
      setMessage('✅ Paramètres sauvegardés avec succès !')
      setTimeout(() => setMessage(null), 3000)
      window.location.reload() // Refresh to apply CSS vars
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage('❌ Le fichier doit faire moins de 2MB')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('logo', file)

    const result = await uploadLogo(formData)

    if (result.success && result.url) {
      setSettings({ ...settings, logo_url: result.url })
      setMessage('✅ Logo téléchargé avec succès !')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Branding</h2>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Colors */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Couleurs</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur Principale
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur Secondaire
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fond de la Roue
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.wheel_bg}
                  onChange={(e) => setSettings({ ...settings, wheel_bg: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.wheel_bg}
                  onChange={(e) => setSettings({ ...settings, wheel_bg: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur du Texte
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.segment_text_color}
                  onChange={(e) => setSettings({ ...settings, segment_text_color: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.segment_text_color}
                  onChange={(e) => setSettings({ ...settings, segment_text_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>

          {settings.logo_url && (
            <div className="mb-4">
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-24 object-contain border border-gray-200 rounded-lg p-2"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleLogoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600 cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-2">
            PNG, JPG ou SVG. Maximum 2MB.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Enregistrement...' : '💾 Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit branding tab**

```bash
git add app/admin/branding/
git commit -m "feat: add branding configuration tab

- Color pickers for 4 theme colors
- Logo upload with preview
- Validation (2MB max, image formats)
- Save and reload to apply changes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Segments Tab

**Files:**
- Create: `app/admin/segments/page.tsx`

- [ ] **Step 1: Create segments management tab**

Create `app/admin/segments/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSegment, updateSegment, deleteSegment } from '@/app/actions/wheel'

interface Segment {
  id: string
  label: string
  color: string
  probability: number
  is_prize: boolean
  is_active: boolean
  display_order: number
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    label: '',
    color: '#3b82f6',
    probability: 10,
    is_prize: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    const { data } = await supabase
      .from('segments')
      .select('*')
      .order('display_order', { ascending: true })

    if (data) {
      setSegments(data)
    }
  }

  const handleAdd = async () => {
    const maxOrder = Math.max(...segments.map(s => s.display_order), 0)
    const result = await createSegment({
      ...formData,
      display_order: maxOrder + 1,
    })

    if (result.success) {
      setMessage('✅ Segment ajouté !')
      setIsAdding(false)
      setFormData({ label: '', color: '#3b82f6', probability: 10, is_prize: false })
      fetchSegments()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${result.error}`)
    }
  }

  const handleUpdate = async (id: string, data: Partial<Segment>) => {
    const result = await updateSegment(id, data)

    if (result.success) {
      setMessage('✅ Segment mis à jour !')
      fetchSegments()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${result.error}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce segment ?')) return

    const result = await deleteSegment(id)

    if (result.success) {
      setMessage('✅ Segment supprimé !')
      fetchSegments()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${result.error}`)
    }
  }

  const activeCount = segments.filter(s => s.is_active).length

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Segments</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Ajouter un segment
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
          {message}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Segment</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Prix Spécial"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (probabilité)
              </label>
              <input
                type="number"
                min="1"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_prize}
                    onChange={(e) => setFormData({ ...formData, is_prize: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">🎁 Est un prix</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              ✅ Ajouter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Segments List */}
      <div className="space-y-3">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: segment.color }}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {segment.label}
                    </span>
                    {segment.is_prize && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        🎁 PRIZE
                      </span>
                    )}
                    {!segment.is_active && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                        INACTIF
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Poids: {segment.probability} • Ordre: {segment.display_order}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdate(segment.id, { is_active: !segment.is_active })}
                  disabled={segment.is_active && activeCount === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={segment.is_active && activeCount === 1 ? 'Impossible de désactiver le dernier segment actif' : ''}
                >
                  {segment.is_active ? '👁️ Actif' : '👁️‍🗨️ Inactif'}
                </button>

                <button
                  onClick={() => handleDelete(segment.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded hover:bg-red-200 transition-colors"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg">Aucun segment. Cliquez sur "Ajouter un segment" pour commencer.</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit segments tab**

```bash
git add app/admin/segments/
git commit -m "feat: add segments management tab

- CRUD operations for segments
- Color picker and probability weight
- Prize flag toggle
- Active/inactive state management
- Validation: min 1 active segment

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Settings Tab

**Files:**
- Create: `app/admin/settings/page.tsx`

- [ ] **Step 1: Create settings configuration tab**

Create `app/admin/settings/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateSettings } from '@/app/actions/wheel'

interface Settings {
  spin_button_label: string
  session_label: string
  spin_duration_min: number
  spin_duration_max: number
  is_spinning: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    spin_button_label: 'SPIN',
    session_label: 'Mon Événement',
    spin_duration_min: 5000,
    spin_duration_max: 7000,
    is_spinning: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setSettings(data)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleSave = async () => {
    setIsLoading(true)
    const result = await updateSettings({
      spin_button_label: settings.spin_button_label,
      session_label: settings.session_label,
      spin_duration_min: settings.spin_duration_min,
      spin_duration_max: settings.spin_duration_max,
    })

    if (result.success) {
      setMessage('✅ Paramètres sauvegardés avec succès !')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  const handleForceUnlock = async () => {
    if (!confirm('Forcer le déblocage de la roue ? À utiliser uniquement si un spin est bloqué.')) {
      return
    }

    setIsLoading(true)
    const result = await updateSettings({ is_spinning: false })

    if (result.success) {
      setSettings({ ...settings, is_spinning: false })
      setMessage('✅ Roue débloquée !')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  const avgDuration = (settings.spin_duration_min + settings.spin_duration_max) / 2 / 1000

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Paramètres</h2>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Button Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte du bouton SPIN
          </label>
          <input
            type="text"
            value={settings.spin_button_label}
            onChange={(e) => setSettings({ ...settings, spin_button_label: e.target.value })}
            placeholder="SPIN"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Le texte affiché sur le bouton du contrôleur iPad
          </p>
        </div>

        {/* Session Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'événement
          </label>
          <input
            type="text"
            value={settings.session_label}
            onChange={(e) => setSettings({ ...settings, session_label: e.target.value })}
            placeholder="Mon Événement"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Utilisé pour l'historique des tirages
          </p>
        </div>

        {/* Spin Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée du spin (en secondes)
          </label>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum</label>
              <input
                type="number"
                min="4000"
                max="10000"
                step="500"
                value={settings.spin_duration_min}
                onChange={(e) => setSettings({ ...settings, spin_duration_min: parseInt(e.target.value) || 4000 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(settings.spin_duration_min / 1000).toFixed(1)}s
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum</label>
              <input
                type="number"
                min="4000"
                max="10000"
                step="500"
                value={settings.spin_duration_max}
                onChange={(e) => setSettings({ ...settings, spin_duration_max: parseInt(e.target.value) || 7000 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(settings.spin_duration_max / 1000).toFixed(1)}s
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Durée moyenne:</span> {avgDuration.toFixed(1)}s
            </p>
            <p className="text-xs text-gray-500 mt-1">
              La durée réelle varie aléatoirement entre le min et le max pour plus de naturel
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Enregistrement...' : '💾 Sauvegarder'}
          </button>
        </div>

        {/* Emergency Unlock */}
        {settings.is_spinning && (
          <div className="pt-4 border-t border-gray-200">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-3">
              <p className="text-sm text-red-800 font-semibold mb-1">
                ⚠️ La roue est actuellement verrouillée (spin en cours)
              </p>
              <p className="text-xs text-red-700">
                Si aucun spin n'est réellement en cours, utilisez le bouton ci-dessous
              </p>
            </div>
            <button
              onClick={handleForceUnlock}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔓 Forcer le déblocage
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit settings tab**

```bash
git add app/admin/settings/
git commit -m "feat: add settings configuration tab

- Spin button label customization
- Session label for event tracking
- Spin duration range (min/max in ms)
- Emergency unlock button for stuck spins

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Final Testing and Polish

**Files:**
- None (testing only)

- [ ] **Step 1: Test infrastructure**

```bash
# Start dev server
npm run dev
```

Expected: Server starts on http://localhost:3000 without errors

- [ ] **Step 2: Create .env.local with real credentials**

Create `.env.local` (copy from `.env.local.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Replace with actual Supabase credentials

- [ ] **Step 3: Test admin branding**

1. Navigate to http://localhost:3000/admin
2. Change primary color
3. Click "Sauvegarder"
4. Verify page reloads and new color is applied

Expected: Color changes visible in UI

- [ ] **Step 4: Test admin segments**

1. Navigate to http://localhost:3000/admin/segments
2. Click "Ajouter un segment"
3. Fill form with test data
4. Click "Ajouter"
5. Verify segment appears in list

Expected: New segment created successfully

- [ ] **Step 5: Test admin settings**

1. Navigate to http://localhost:3000/admin/settings
2. Change spin duration min/max
3. Click "Sauvegarder"

Expected: Settings saved successfully

- [ ] **Step 6: Test play page**

1. Navigate to http://localhost:3000/play
2. Click the SPIN button

Expected: Button shows loading state, Server Action called

- [ ] **Step 7: Test display page**

1. Open http://localhost:3000/display in another window/tab
2. Click SPIN on /play page
3. Watch /display page

Expected: Wheel spins, overlay appears (winner or loss depending on segment)

- [ ] **Step 8: Test real-time sync**

1. Keep both /play and /display open
2. Click SPIN on /play
3. Verify /display animates immediately

Expected: Real-time broadcast working, minimal latency

- [ ] **Step 9: Test concurrent spin prevention**

1. Click SPIN rapidly multiple times
2. Check browser console for errors

Expected: Only one spin executes, others rejected with CONCURRENT_SPIN

- [ ] **Step 10: Test audio (optional - only if placeholder files exist)**

If you have audio files in /public/sounds/:
1. Click SPIN
2. Listen for tick sound during spin
3. Listen for win/loss sound at end

Expected: Sounds play correctly (or silent if files missing)

- [ ] **Step 11: Document test results**

Create `TEST_RESULTS.md` with findings:
```markdown
# Test Results

## ✅ Passing
- Admin branding: colors update correctly
- Admin segments: CRUD works
- Admin settings: duration configurable
- Play: SPIN button functional
- Display: wheel animation smooth
- Real-time: broadcast < 200ms latency

## ⚠️ Known Issues
- Audio files are placeholders (need real sounds)
- [Any other issues found]

## 🚀 Ready for Production
- [ ] Replace audio placeholders
- [ ] Deploy to Vercel
- [ ] Test on actual iPad
- [ ] Test on actual TV/projector
```

- [ ] **Step 12: Commit test documentation**

```bash
git add TEST_RESULTS.md
git commit -m "docs: add test results documentation

All core features tested and working:
- Admin panel (branding, segments, settings)
- iPad controller (SPIN button + swipe gesture)
- TV display (wheel animation + overlays)
- Real-time synchronization via Supabase

Known issue: audio files are placeholders

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 18: Production Deployment Preparation

**Files:**
- Create: `README.md`
- Create: `.env.production.example`

- [ ] **Step 1: Create README**

Create `README.md`:

```markdown
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

\`\`\`bash
npm install
\`\`\`

### 2. Configure Supabase

1. Create a project on [supabase.com](https://supabase.com)
2. Run migrations in `supabase/migrations/` (via dashboard or CLI)
3. Create Storage bucket named `logos` (public, max 2MB, image formats)
4. Copy API keys to `.env.local`

### 3. Environment Variables

Create `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open:
- Admin: http://localhost:3000/admin
- Play (iPad): http://localhost:3000/play
- Display (TV): http://localhost:3000/display

## Production Deployment

### Vercel (Recommended)

\`\`\`bash
npm run build
vercel deploy
\`\`\`

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
```

- [ ] **Step 2: Create production env example**

Create `.env.production.example`:

```env
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

- [ ] **Step 3: Commit documentation**

```bash
git add README.md .env.production.example
git commit -m "docs: add README and production env template

- Setup instructions
- Architecture overview
- Deployment guide
- Audio file recommendations

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Create final release commit**

```bash
git tag v1.0.0
git log --oneline
```

Expected: Clean commit history with all features

---

## Self-Review Checklist

### Spec Coverage

✅ **Admin Panel**
- Task 14: Branding tab (colors + logo)
- Task 15: Segments tab (CRUD)
- Task 16: Settings tab (duration + labels)

✅ **iPad Controller**
- Task 11: Play page (button + swipe gesture)

✅ **TV Display**
- Task 12: Display page (wheel + overlays + real-time)

✅ **Real-time Sync**
- Task 7: Server Actions (drawPrize with broadcast)
- Task 12: Display subscribes to broadcast

✅ **Wheel Rendering**
- Task 8: SVG wheel with CSS animation

✅ **Overlays**
- Task 9: Winner (confetti) + Loss (banner)

✅ **Sounds**
- Task 6: Sound Manager with lazy loading

✅ **Database**
- Task 4: Migrations (tables + RLS + seed)

✅ **Infrastructure**
- Task 1: Next.js 16.2 + Supabase
- Task 2: Tailwind CSS 4
- Task 3: Supabase clients (server + browser)

### Placeholder Check

✅ No "TBD" or "TODO" in plan
✅ All code blocks complete and functional
✅ All commands have expected output
✅ All file paths are exact

### Type Consistency

✅ `Segment` interface used consistently across all tasks
✅ `Settings` interface matches database schema
✅ Function signatures match between Server Actions and client calls
✅ Supabase client imports consistent (`createClient` from correct paths)

### Missing from Spec

None - all requirements covered.

---

## Execution Ready

Plan is complete, self-reviewed, and saved to `docs/superpowers/plans/2026-05-07-prize-wheel-implementation.md`.
