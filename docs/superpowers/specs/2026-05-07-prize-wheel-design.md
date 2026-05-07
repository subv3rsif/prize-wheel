# Prize Wheel - Real-time Application Design

**Date:** 2026-05-07
**Version:** 1.0
**Status:** Approved

---

## 📋 Vue d'ensemble

Application de roue de loterie temps réel pour événements, opérée par une hôtesse via iPad, avec affichage sur TV/projecteur. Pas d'authentification requise - toutes les vues sont publiques. L'application est conçue pour un environnement contrôlé avec trois interfaces distinctes.

### Objectifs

- Permettre à une hôtesse de lancer des tirages au sort via iPad (bouton tactile + geste swipe)
- Afficher l'animation de la roue en temps réel sur un écran TV/projecteur
- Gérer le branding (couleurs, logo) et les segments (labels, poids, prizes) via interface admin
- Garantir l'équité des tirages avec un système de lock serveur
- Offrir une expérience visuelle festive et engageante

---

## 🎯 Fonctionnalités Principales

### Vue `/admin` - Panneau d'Administration
**Navigation par onglets :**

1. **Onglet Branding**
   - Color pickers pour couleurs principales (primary, secondary, wheel_bg, segment_text)
   - Upload de logo vers Supabase Storage
   - Aperçu visuel en temps réel

2. **Onglet Segments**
   - CRUD complet des segments
   - Configuration : label, couleur, poids (probability), is_prize flag
   - Toggle is_active pour désactiver sans supprimer
   - Réorganisation avec display_order

3. **Onglet Paramètres**
   - Texte du bouton SPIN (spin_button_label)
   - Nom de l'événement (session_label)
   - Configuration durée du spin (min/max en ms)

### Vue `/play` - Contrôleur iPad
- Bouton "SPIN" large et tactile
- Geste swipe-up alternatif (delta vertical minimum 80px)
- Bouton désactivé pendant un spin en cours (spinner animé)
- Feedback visuel immédiat
- Synchronisation temps réel via Supabase Broadcast

### Vue `/display` - Écran TV/Projecteur
- Affichage de la roue SVG avec segments personnalisés
- Animation CSS pure (6 secondes par défaut, variable 5-7s)
- Sons d'ambiance (tick pendant rotation, win/loss à l'arrêt)
- Overlay gagnant : explosion animée avec confettis pour les prizes
- Message discret : "Merci d'avoir participé !" pour les non-prizes

---

## 🏗️ Architecture Technique

### Stack Technologique

- **Framework:** Next.js 16.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Realtime)
- **Storage:** Supabase Storage (logos)
- **Animation:** CSS pur (transforms + transitions)
- **Audio:** Web Audio API / HTML5 `<audio>`
- **Deployment:** Vercel (recommandé)

### Structure des Dossiers

```
/app
  /layout.tsx                    → Layout racine (injection CSS variables)
  /page.tsx                      → Redirect ou home
  /admin
    /page.tsx                    → Panneau admin (Server Component)
    /layout.tsx                  → Layout avec tabs
    /_components
      /BrandingTab.tsx           → Client Component
      /SegmentsTab.tsx           → Client Component
      /SettingsTab.tsx           → Client Component
  /play
    /page.tsx                    → Contrôleur iPad (Client Component)
  /display
    /page.tsx                    → Vue TV (Client Component)
  /actions
    /wheel.ts                    → Server Actions (drawPrize, etc.)
  /_components
    /Wheel.tsx                   → Roue SVG (Client Component)
    /WinnerOverlay.tsx           → Overlay gagnant (Client Component)
    /LossMessage.tsx             → Message perte (Client Component)
/lib
  /supabase
    /server.ts                   → Client SSR (service role)
    /client.ts                   → Client browser (anon key)
  /sounds
    /SoundManager.tsx            → Hook/Context sons
  /utils
    /weighted-random.ts          → Algo tirage pondéré
    /wheel-calculations.ts       → Calculs angles SVG
/public
  /sounds
    /tick.mp3                    → Placeholder
    /win.mp3                     → Placeholder
    /loss.mp3                    → Placeholder
```

### Principes Architecturaux

1. **Server Components par défaut** - Data fetching côté serveur
2. **Client Components ciblés** - Uniquement pour interactivité
3. **Server Actions** - Toutes mutations passent par des Server Actions sécurisées
4. **CSS Variables dynamiques** - Branding injecté au niveau root layout
5. **Real-time via Broadcast** - Pas de polling, événements push-based

---

## 🗄️ Schéma de Base de Données

### Table `segments`

```sql
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  color TEXT NOT NULL,                    -- Hex color
  probability INTEGER NOT NULL CHECK (probability > 0),
  is_prize BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_segments_active ON segments(is_active) WHERE is_active = true;
CREATE INDEX idx_segments_display_order ON segments(display_order);
```

### Table `settings`

```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,       -- Single-row config
  primary_color TEXT DEFAULT '#f59e0b',
  secondary_color TEXT DEFAULT '#ef4444',
  wheel_bg TEXT DEFAULT '#ffffff',
  segment_text_color TEXT DEFAULT '#ffffff',
  logo_url TEXT,
  spin_button_label TEXT DEFAULT 'SPIN',
  session_label TEXT DEFAULT 'Event',
  spin_duration_min INTEGER DEFAULT 5000,
  spin_duration_max INTEGER DEFAULT 7000,
  is_spinning BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
```

### Table `draws`

```sql
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

### Policies RLS

```sql
-- Enable RLS
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read segments" ON segments FOR SELECT USING (true);
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can read draws" ON draws FOR SELECT USING (true);

-- Public insert on draws
CREATE POLICY "Public can insert draws" ON draws FOR INSERT WITH CHECK (true);

-- Server Actions utilisent service role pour writes sur segments/settings
```

### Données par Défaut (Seed)

```sql
-- 12 segments: 3 prizes + 9 non-prizes
INSERT INTO segments (label, color, probability, is_prize, display_order) VALUES
  ('🎁 Grand Prix', '#f59e0b', 5, true, 1),
  ('🎁 Prix Moyen', '#ef4444', 8, true, 2),
  ('🎁 Petit Cadeau', '#8b5cf6', 10, true, 3),
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

**Distribution:**
- Total weight: 156
- Prizes: 23/156 (~15%)
- Grand Prix: ~3.2% | Prix Moyen: ~5.1% | Petit Cadeau: ~6.4%

---

## ⚙️ Logique Métier Critique

### Server Action `drawPrize()`

**Fichier:** `/app/actions/wheel.ts`

**Flow:**

1. **CHECK LOCK** - Vérifie `is_spinning` dans settings
   - Si `true` → retourne erreur `CONCURRENT_SPIN`
   - Empêche les spins simultanés multi-sessions

2. **SET LOCK** - Met `is_spinning = true`

3. **FETCH SEGMENTS** - Récupère segments actifs triés par `display_order`

4. **WEIGHTED RANDOM DRAW** - Utilise `crypto.getRandomValues()`
   - Calcule poids total
   - Génère nombre aléatoire sécurisé
   - Sélectionne segment selon distribution pondérée

5. **CALCULATE TARGET ANGLE**
   - Détermine l'angle du segment gagnant
   - Ajoute 5-8 tours complets pour effet dramatique
   - Formule: `rotations * 360 + (360 - segmentCenter)`

6. **RANDOM SPIN DURATION** - Entre `spin_duration_min` et `spin_duration_max`

7. **INSERT DRAW RECORD** - Enregistre dans table `draws` avec métadonnées

8. **BROADCAST EVENT** - Envoie via Supabase Realtime channel `wheel`
   ```json
   {
     "type": "spin",
     "payload": {
       "targetAngle": 2205,
       "segmentId": "uuid",
       "isPrize": true,
       "segmentLabel": "Grand Prix",
       "spinDuration": 6200
     }
   }
   ```

9. **RELEASE LOCK** (async) - Après `spinDuration + 1000ms buffer`
   - Timeout automatique pour éviter deadlock
   - `revalidatePath()` pour synchroniser UI

**Sécurité:**
- Lock global empêche concurrence
- Service role key pour bypass RLS
- Error handling libère le lock même en cas d'exception

---

## 📡 Synchronisation Real-time

### Architecture Supabase Broadcast

**Channel:** `wheel`
**Event:** `spin`
**Type:** Broadcast public (pas d'auth)

### Flow Complet

1. **Hôtesse** clique/swipe sur `/play`
2. **Client** appelle `drawPrize()` Server Action
3. **Server** tire segment, broadcast event
4. **Display** écoute channel, reçoit payload
5. **Display** anime roue + joue sons
6. **Display** affiche overlay selon `isPrize`
7. **Play** écoute aussi pour sync état bouton

### Gestion Reconnexion

- Supabase auto-reconnecte en cas de perte réseau
- Fallback polling possible si critique (toutes les 500ms)
- État `is_spinning` permet de détecter spins manqués

---

## 🎨 Styling & Branding Dynamique

### Injection CSS Variables

**Root Layout** (`/app/layout.tsx`) injecte via `<style>` inline:

```css
:root {
  --primary-color: #f59e0b;
  --secondary-color: #ef4444;
  --wheel-bg: #ffffff;
  --segment-text-color: #ffffff;
}
```

**Utilisation dans Tailwind:**
```typescript
theme: {
  extend: {
    colors: {
      primary: 'var(--primary-color)',
      secondary: 'var(--secondary-color)',
    }
  }
}
```

### Revalidation

Après modification settings dans `/admin`:
```typescript
revalidatePath('/', 'layout') // Revalide root layout → nouvelles CSS vars
```

### Style Festif

- Couleurs chaudes et saturées
- Bordures épaisses avec gradients
- Ombres portées (drop-shadow)
- Éléments décoratifs (dots, étoiles)
- Animations bounce et confetti

---

## 🎡 Rendu & Animation de la Roue

### Composant Wheel (SVG)

**Technologie:** SVG natif avec paths générés dynamiquement

**Structure:**
```svg
<svg viewBox="0 0 600 600">
  <!-- Background circle -->
  <circle cx="300" cy="300" r="290" fill="var(--wheel-bg)" />

  <!-- Segments (générés dynamiquement) -->
  <path d="M 300 300 L ... A ... Z" fill={segment.color} />

  <!-- Labels + icônes prize -->
  <text transform="rotate(...) translate(...)">
    {segment.label}
  </text>

  <!-- Centre pin -->
  <circle cx="300" cy="300" r="35" fill="#1f2937" />
</svg>
```

### Animation CSS

**Principe:**
```css
.wheel {
  transition: transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  transform: rotate(var(--target-angle));
}
```

**Easing:** `cubic-bezier(0.17, 0.67, 0.12, 0.99)`
- Démarrage rapide
- Ralentissement progressif naturel
- Simule inertie d'une roue physique

**Performances:**
- `transform-gpu` pour GPU acceleration
- SVG scalable et léger
- Pas de repaint/reflow pendant animation

### Calcul des Angles

```typescript
function calculateTargetAngle(segmentIndex, totalSegments) {
  const segmentAngle = 360 / totalSegments
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2
  const rotations = 5 + Math.random() * 3 // 5-8 tours
  return rotations * 360 + (360 - segmentCenter)
}
```

---

## 🔊 Système de Sons

### SoundManager (Context/Hook)

**Implémentation:** React Context + HTML5 Audio

**API:**
```typescript
const { playTick, stopTick, playWin, playLoss, setVolume } = useSoundManager()
```

**Fonctionnalités:**
- Lazy-loading (chargement uniquement côté client)
- Preload au mount pour latence zéro
- Loop pour tick, one-shot pour win/loss
- Volumes ajustés: tick 30%, win 100%, loss 70%
- Fallback silencieux si fichiers manquants

**Fichiers Audio (Placeholders):**
```
/public/sounds/
  tick.mp3   → Son court type "click" (50-100ms)
  win.mp3    → Jingle festif (2-3s)
  loss.mp3   → Son doux (1-2s)
```

**Timeline Sons:**
1. Spin start → `playTick()` en loop
2. Animation en cours → tick continue
3. Spin end → `stopTick()`
4. Si prize → `playWin()` + overlay explosion
5. Si non-prize → `playLoss()` + message discret

---

## 🛡️ Gestion des Erreurs & Edge Cases

### 1. Spin Concurrent
**Problème:** Multi-clic ou multi-iPad
**Solution:** Lock `is_spinning`, retourne `CONCURRENT_SPIN`

### 2. Aucun Segment Actif
**Problème:** Admin désactive tous les segments
**Solution:** Validation côté client (min 1 actif) + check serveur

### 3. Lock Bloqué
**Problème:** Crash serveur pendant spin
**Solution:** Timeout auto + bouton admin "Débloquer"

### 4. Audio Manquant
**Problème:** Placeholders pas encore remplacés
**Solution:** `.catch()` silencieux, app fonctionne sans son

### 5. Perte Connexion Broadcast
**Problème:** Réseau coupe pendant spin
**Solution:** Auto-reconnexion Supabase + fallback polling optionnel

### 6. Upload Logo Échoue
**Problème:** Taille/format/permissions
**Solution:** Validation frontend (max 2MB, PNG/JPG/SVG)

### 7. Display Avant Premier Spin
**Problème:** Écran vide si aucun draw
**Solution:** État "En attente..." avec icône roue

### 8. Poids Invalides
**Problème:** Tous les poids à 0
**Solution:** Validation `min="1"` frontend + check serveur

---

## 🚀 Configuration & Déploiement

### Variables d'Environnement

**`.env.local.example`:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Setup Supabase

1. Créer projet sur supabase.com
2. Créer bucket Storage `logos` (public)
3. Exécuter migrations SQL (tables + RLS + seed)
4. Copier clés API dans `.env.local`

### Installation

```bash
npm install
npm run dev
```

### Checklist Première Utilisation

- [ ] Accéder `/admin` → configurer branding
- [ ] Tester upload logo
- [ ] Configurer segments (poids, labels)
- [ ] Tester `/play` → lancer spin
- [ ] Vérifier `/display` → animation + overlay
- [ ] Ajouter vrais fichiers audio dans `/public/sounds/`

### Production (Vercel)

```bash
npm run build
vercel deploy
```

**Configuration Vercel:**
- Variables d'env (SUPABASE_*)
- Activer Edge Runtime si nécessaire
- Configurer custom domain

---

## 📊 Métriques & Analytics (V2)

**Futures améliorations:**

1. **Dashboard Analytics**
   - Nombre total de spins
   - Taux de victoire réel vs théorique
   - Segments les plus tirés
   - Timeline des draws par session

2. **Export Données**
   - CSV des draws avec timestamps
   - Rapport de session pour l'organisateur

3. **A/B Testing**
   - Tester différentes distributions de poids
   - Optimiser engagement

---

## 🔄 Améliorations Futures

### V1.1 - Confort UX
- [ ] Historique des draws dans `/admin`
- [ ] Preview roue en temps réel dans admin
- [ ] Drag & drop pour réordonner segments
- [ ] Thèmes prédéfinis (festif, professionnel, élégant)

### V1.2 - Fonctionnalités Avancées
- [ ] Multi-sessions (plusieurs roues en parallèle)
- [ ] QR code pour participants (vote, inscription)
- [ ] Intégration réseaux sociaux (partage victoire)
- [ ] Mode "demo" pour tests sans enregistrer draws

### V2.0 - Gamification
- [ ] Streak de victoires
- [ ] Leaderboard participants
- [ ] Animations de confettis avec particules Canvas
- [ ] Sons personnalisables (upload dans admin)

---

## ✅ Critères de Succès

### Fonctionnels
- ✅ Hôtesse peut lancer spins depuis iPad (touch + swipe)
- ✅ Display affiche animation synchronisée en temps réel
- ✅ Admin peut configurer branding et segments sans dev
- ✅ Pas de spins concurrents possibles (lock serveur)
- ✅ Distribution des tirages respecte probabilités configurées

### Techniques
- ✅ Latence broadcast < 500ms
- ✅ Animation fluide 60fps sur iPad et TV
- ✅ Bundle JS < 200kb (gzippé)
- ✅ Pas d'erreur si fichiers audio manquants
- ✅ Reconnexion auto en cas de perte réseau

### UX
- ✅ Interface intuitive sans formation
- ✅ Feedback visuel immédiat sur toutes actions
- ✅ Style festif et engageant
- ✅ Responsive iPad portrait/landscape
- ✅ Fullscreen display sans distractions

---

## 📝 Notes d'Implémentation

### Ordre de Développement Recommandé

1. **Setup infrastructure** (Next.js + Supabase + Tailwind)
2. **Database** (migrations + seed)
3. **Composant Wheel** (SVG statique)
4. **Server Action drawPrize** (logique tirage)
5. **Animation CSS** (rotation + easing)
6. **Real-time Broadcast** (Play → Display sync)
7. **SoundManager** (avec placeholders)
8. **Overlays** (Winner + Loss)
9. **Admin - Onglet Segments** (CRUD)
10. **Admin - Onglet Branding** (colors + logo)
11. **Admin - Onglet Settings** (durée spin)
12. **Testing & Polish** (edge cases, UX)

### Points d'Attention

- **Lock serveur:** Tester scenarios multi-iPad rigoureusement
- **Calcul angles:** Vérifier alignement pointeur/segment gagnant
- **CSS Variables:** S'assurer revalidation layout fonctionne
- **Audio autoplay:** Certains navigateurs bloquent, nécessite interaction user
- **iPad gestures:** Tester swipe-up avec différentes sensibilités

### Dépendances Critiques

- Next.js 16.2+ (App Router stable)
- Supabase Realtime (Broadcast feature)
- Tailwind 4 (CSS variables support)
- Navigateurs modernes (CSS transforms, Web Audio API)

---

**Fin du Document de Design**

_Ce document est vivant et sera mis à jour selon les retours d'implémentation et les besoins terrain._
