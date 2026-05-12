# Plan de Vérification de l'Application Prize Wheel

## 🎯 Objectif
Vérifier la propreté du code et le bon fonctionnement de tous les composants.

## 📋 Checklist de Vérification

### 1. Build & Compilation
- [ ] `npm run build` compile sans erreurs
- [ ] Aucune erreur TypeScript
- [ ] Aucun warning critique
- [ ] Taille du bundle raisonnable

**Commande** :
```bash
npm run build
```

**Résultat attendu** : Build successful, toutes les routes générées

---

### 2. Structure des Fichiers

#### Composants Premium
- [ ] `app/_components/PremiumHalfWheel.tsx` existe et compile
- [ ] `app/_components/PremiumResultOverlay.tsx` existe et compile
- [ ] Tous les composants ont les types TypeScript corrects
- [ ] Pas de `any` non nécessaires

#### Pages
- [ ] `app/play/page.tsx` - Interface standalone/iPad
- [ ] `app/display/page.tsx` - Affichage public
- [ ] `app/admin/*` - Panneaux d'administration

#### Actions
- [ ] `app/actions/wheel.ts` - Server actions fonctionnelles
- [ ] Pas de `setTimeout` côté serveur (corrigé)
- [ ] Lock mechanism avec `forceUnlockWheel()`

---

### 3. Fonctionnalité - Page /play

#### Chargement Initial
- [ ] La roue demi-cercle est visible
- [ ] Le logo placeholder s'affiche en haut
- [ ] Le bouton LAUNCH est visible et centré
- [ ] Les segments se chargent depuis Supabase

#### Bouton LAUNCH
- [ ] Taille suffisante (min 320px)
- [ ] Anneaux lumineux rotatifs visibles
- [ ] Effet hover/active responsive
- [ ] Texte lisible avec effet 3D
- [ ] État SPINNING avec éclairs animés

#### Rotation de la Roue
- [ ] Centre de rotation = centre physique de la roue
- [ ] Rotation fluide sans saccades
- [ ] Décélération progressive réaliste
- [ ] Durée variable (6-10 secondes)

#### Animation de Fin
- [ ] Flash burst doré s'affiche quand la roue s'arrête
- [ ] Sparkles explosent dans toutes les directions
- [ ] Pause dramatique avant overlay
- [ ] Timing : arrêt → flash (800ms) → pause (600ms) → overlay

#### Overlay de Résultat
- [ ] Apparaît après la séquence d'animation
- [ ] Affiche "BIG WIN" si prix
- [ ] Affiche "Merci de participer" si non-prix
- [ ] Confettis animés (si prix)
- [ ] Disparaît après 5 secondes
- [ ] Permet de relancer immédiatement après

#### Gestures Tactiles
- [ ] Swipe up (80px) déclenche le spin
- [ ] Touch sur le bouton fonctionne
- [ ] Pas de double-tap zoom sur mobile

---

### 4. Fonctionnalité - Page /display

#### Affichage
- [ ] Logo placeholder en haut
- [ ] Roue demi-cercle visible
- [ ] État "EN ATTENTE" quand inactif
- [ ] Même design que /play (sans bouton)

#### Synchronisation Real-time
- [ ] Écoute le channel 'wheel' Supabase
- [ ] Roue tourne en sync avec /play
- [ ] Même animation de fin (flash + sparkles)
- [ ] Même overlay de résultat
- [ ] Sons jouent (tick, win, loss)

---

### 5. Fonctionnalité - Admin

#### /admin/segments
- [ ] Liste des segments s'affiche
- [ ] Création de nouveau segment fonctionne
- [ ] Édition de segment fonctionne
- [ ] Suppression de segment fonctionne
- [ ] Toggle is_active fonctionne
- [ ] Changements reflétés en temps réel sur /play et /display

#### /admin/settings
- [ ] Modification du label du bouton fonctionne
- [ ] Durée min/max du spin modifiable
- [ ] Session label modifiable

#### /admin/debug
- [ ] Bouton "Force Unlock" débloque le verrou
- [ ] État is_spinning visible

---

### 6. Real-time Synchronisation

#### Test Dual-Screen
```
1. Ouvrir /play dans onglet A (ou iPad)
2. Ouvrir /display dans onglet B (ou TV)
3. Cliquer LAUNCH dans onglet A
4. Vérifier:
   - Les deux roues tournent ensemble
   - Même angle de rotation
   - Même timing
   - Même résultat affiché
   - Animation de fin synchronisée
```

- [ ] Broadcast 'spin' envoyé correctement
- [ ] Payload contient : targetAngle, spinDuration, segmentLabel, isPrize
- [ ] Les deux clients reçoivent l'événement
- [ ] Animations synchronisées à la milliseconde

---

### 7. Lock Mechanism

#### Scénario Normal
```
1. Cliquer LAUNCH
2. is_spinning = true (pendant rotation)
3. Rotation se termine
4. forceUnlockWheel() appelé
5. is_spinning = false
6. Peut relancer
```

- [ ] Lock acquis avant broadcast
- [ ] Lock libéré après animation côté client
- [ ] Pas de "Spin already in progress" en usage normal

#### Scénario Error
```
1. Si erreur pendant drawPrize()
2. Lock doit être libéré immédiatement
3. Utilisateur peut réessayer
```

- [ ] Erreurs gérées dans try/catch
- [ ] Lock toujours libéré même en cas d'erreur

#### Recovery
- [ ] `/admin/debug` permet de forcer le unlock
- [ ] `/api/force-unlock` accessible en GET

---

### 8. Animations CSS

#### Globals.css
- [ ] Toutes les @keyframes définies
- [ ] Pas de conflits de noms
- [ ] Animations smooth (60fps)

#### Composants
- [ ] PremiumHalfWheel : particules, rayons, LEDs
- [ ] PremiumResultOverlay : confettis, sparkles, text pulse
- [ ] Bouton LAUNCH : anneaux rotatifs, glow
- [ ] Flash burst : expanding rings, sparkles

#### Performance
- [ ] Pas de jank pendant les animations
- [ ] GPU acceleration utilisée (transform, opacity)
- [ ] Pas de reflow/repaint excessif

---

### 9. Styles & Design

#### Cohérence Visuelle
- [ ] Palette de couleurs cohérente (or, orange, cyan, magenta)
- [ ] Typographie : Righteous pour titres, Work Sans pour corps
- [ ] Spacing consistant
- [ ] Border radius cohérent

#### Responsive
- [ ] Mobile (320px+) : roue et bouton visibles
- [ ] Tablet (768px+) : layout optimal
- [ ] Desktop (1024px+) : full experience
- [ ] Large screens : pas de déformation

#### Dark Theme
- [ ] Background : dégradé radial sombre (#1a0a2e → #000)
- [ ] Contraste suffisant pour lisibilité
- [ ] Effets néon visibles sur fond sombre

---

### 10. Base de Données

#### Segments
```sql
SELECT * FROM segments WHERE is_active = true ORDER BY display_order;
```

- [ ] Au moins 3-4 segments actifs
- [ ] Probabilities totalisent ~100
- [ ] Colors sont des hex valides
- [ ] Labels non vides

#### Settings
```sql
SELECT * FROM settings WHERE id = 1;
```

- [ ] is_spinning = false (état initial)
- [ ] spin_duration_min < spin_duration_max
- [ ] spin_button_label non vide
- [ ] session_label défini

#### Draws
```sql
SELECT * FROM draws ORDER BY created_at DESC LIMIT 10;
```

- [ ] Enregistrement des tirages fonctionne
- [ ] segment_id correspond à un segment existant
- [ ] Timestamps corrects

---

### 11. Code Quality

#### TypeScript
- [ ] Pas de `@ts-ignore` ou `@ts-expect-error`
- [ ] Tous les types exportés correctement
- [ ] Interfaces bien définies
- [ ] Pas de `any` sauf si nécessaire

#### React Best Practices
- [ ] Hooks dans le bon ordre
- [ ] Dependencies des useEffect correctes
- [ ] Cleanup des subscriptions
- [ ] Pas de memory leaks

#### Server Actions
- [ ] `'use server'` en haut du fichier
- [ ] Validation des inputs
- [ ] Error handling approprié
- [ ] Pas de code client-side

#### Performance
- [ ] Pas de re-renders inutiles
- [ ] useMemo/useCallback si nécessaire
- [ ] Images optimisées
- [ ] Code splitting si pertinent

---

### 12. Sécurité

#### Environment Variables
- [ ] Variables sensibles dans .env.local (local)
- [ ] Variables configurées dans Vercel (prod)
- [ ] Pas de secrets dans le code
- [ ] NEXT_PUBLIC_* seulement pour vars publiques

#### Supabase
- [ ] RLS (Row Level Security) activée
- [ ] Policies correctes pour public access
- [ ] Service role key seulement côté serveur
- [ ] Anon key pour client-side

#### API
- [ ] Rate limiting considéré
- [ ] Validation des inputs
- [ ] Pas d'injection SQL possible
- [ ] CORS configuré si nécessaire

---

## 🔧 Commandes de Vérification

### Build & Test
```bash
# Clean install
rm -rf node_modules .next
npm install

# Type check
npx tsc --noEmit

# Build
npm run build

# Dev server
npm run dev
```

### Lint & Format
```bash
# ESLint
npm run lint

# Prettier (si configuré)
npx prettier --check "**/*.{ts,tsx,js,jsx}"
```

### Database Check
```bash
# Via Supabase CLI (si installé)
supabase db remote status
```

---

## 🐛 Tests Manuels Critiques

### Test 1: Spin Basique
1. Ouvrir /play
2. Cliquer LAUNCH
3. ✅ Roue tourne centrée
4. ✅ Flash + sparkles à la fin
5. ✅ Overlay apparaît
6. ✅ Peut relancer après

### Test 2: Synchronisation
1. /play dans onglet A
2. /display dans onglet B
3. LAUNCH depuis A
4. ✅ B tourne en même temps
5. ✅ Même résultat sur les deux

### Test 3: Admin Changes
1. Modifier un segment dans /admin
2. ✅ Changement visible sur /play immédiatement
3. ✅ Changement visible sur /display immédiatement

### Test 4: Lock Recovery
1. Simuler un crash pendant spin
2. Aller sur /admin/debug
3. Cliquer Force Unlock
4. ✅ Peut relancer le spin

### Test 5: Mobile
1. Ouvrir /play sur mobile
2. ✅ Roue visible et centrée
3. ✅ Bouton assez grand pour le touch
4. ✅ Swipe up fonctionne
5. ✅ Overlay lisible

---

## 📊 Métriques de Succès

- ✅ Build: 0 erreurs, 0 warnings critiques
- ✅ TypeScript: 100% typé
- ✅ Tests manuels: 5/5 passent
- ✅ Performance: Animations à 60fps
- ✅ Mobile: Responsive sur tous devices
- ✅ Real-time: Latence < 500ms

---

## 🚨 Problèmes Identifiés à Corriger

### 1. Centre de Rotation (CRITIQUE)
**Symptôme** : La roue ne tourne pas autour de son centre physique
**Cause possible** :
- transformOrigin en CSS vs SVG coordinate system
- Container overflow: hidden affecte le transform
- Besoin de transform-box: fill-box

**Test** :
```
1. Marquer le centre de la roue visuellement
2. Lancer un spin
3. Observer si la marque reste fixe ou bouge
```

### 2. Bouton Taille (MEDIUM)
**Symptôme** : Bouton pas assez grand/visible
**Action** : Augmenter de w-64 (256px) à w-80 ou w-96 (320-384px)

### 3. Animation de Fin (CRITIQUE)
**Symptôme** : Flash burst ne s'affiche pas
**Cause possible** :
- Keyframes dans <style jsx> ne s'appliquent pas
- Z-index conflict
- State showWinnerFlash ne se met pas à true
- Timing issue

**Debug** :
```javascript
console.log('Wheel stopped, flash:', showWinnerFlash)
```

---

## ✅ Validation Finale

Avant de considérer l'app prête:
- [ ] Tous les tests manuels passent
- [ ] Build production sans erreurs
- [ ] Déployé sur Vercel avec succès
- [ ] Testé sur plusieurs devices
- [ ] Feedback utilisateur positif

---

**Dernière mise à jour** : 2026-05-12
**Version** : 1.0.0
