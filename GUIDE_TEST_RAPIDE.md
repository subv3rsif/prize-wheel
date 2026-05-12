# Guide de Test Rapide - Prize Wheel

## 🚀 Tests Immédiats sur Vercel

### Test 1: Centre de Rotation ✅
1. Ouvrir `/play` sur Vercel
2. **Observer le centre de la roue** (là où est le hub doré)
3. Cliquer LAUNCH
4. **Vérifier**: Le centre doit rester fixe, les segments tournent autour
5. ✅ Le centre ne bouge PAS pendant la rotation

**Si le centre bouge** → problème toujours présent

---

### Test 2: Taille du Bouton ✅
1. Sur `/play`
2. **Observer le bouton LAUNCH**
3. ✅ Doit être **très grand** (320px mobile, 384px desktop)
4. ✅ Anneaux lumineux rotatifs visibles autour
5. ✅ Texte en dégradé or lisible

**Si trop petit** → vérifier que w-80/w-96 appliqués

---

### Test 3: Animation Flash à la Fin ✅
1. Sur `/play`
2. Ouvrir la **Console Browser** (F12 → Console)
3. Cliquer LAUNCH
4. Attendre que la roue s'arrête
5. **Observer**:
   - Console doit afficher: `🎯 Wheel stopped! Triggering flash animation...`
   - Puis: `✨ Flash burst activated`
   - **3 anneaux dorés** doivent exploser du centre
   - **12 sparkles** doivent voler dans toutes les directions
   - Puis: `💫 Flash burst ended`
   - Puis l'overlay "BIG WIN" ou "Merci" apparaît

**Si pas de flash** → regarder la console pour voir où ça bloque

---

## 🐛 Debugging

### Console Logs à Surveiller
```
🎯 Wheel stopped! Triggering flash animation...
✨ Flash burst activated
💫 Flash burst ended
```

Si ces logs apparaissent mais pas d'animation visuelle:
- Vérifier z-index (devrait être z-50)
- Vérifier que globals.css est chargé
- Regarder l'onglet Elements pour voir si les divs sont créées

---

### Vérifier que les Keyframes sont Chargées
1. F12 → Elements tab
2. Chercher `<style>` ou regarder Computed styles
3. Vérifier que `flashBurst`, `expandRing`, `sparkleShoot` existent

---

## ✅ Résultat Attendu

Quand tout fonctionne:
1. ✅ Roue tourne parfaitement centrée
2. ✅ Bouton LAUNCH énorme et spectaculaire
3. ✅ Flash doré explosif à la fin + sparkles
4. ✅ Séquence fluide: rotation → flash → pause → overlay

---

## 📸 Points de Contrôle Visuels

### Bouton au repos:
- Anneaux dorés qui tournent lentement (8s)
- Halo pulsant autour
- Texte en dégradé: blanc → or → orange
- Taille: prend 1/3 de la hauteur de l'écran

### Bouton en spinning:
- Anneaux cyan/turquoise qui tournent vite
- Éclairs ⚡ multiples qui tournent
- Texte "SPINNING..." cyan néon pulsant

### Flash de fin:
- 3 cercles dorés qui s'expandent rapidement
- 12 points lumineux qui explosent vers l'extérieur
- Durée totale: ~800ms
- Très visible, impossible à rater

---

## 🔥 Si Ça Ne Marche TOUJOURS Pas

Envoyez-moi:
1. Screenshot de la console browser avec les logs
2. Screenshot du bouton (pour vérifier la taille)
3. Vidéo courte de la rotation (pour voir si centrée)
4. Description de ce qui ne fonctionne pas exactement

Je débuggerai avec ces infos!
