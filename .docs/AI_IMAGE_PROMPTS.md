# Prompts de génération — visuels promotionnels Continental®

> Remplacent `public/aesthetic/` — les sections « Gamme ventilation » et
> « Gamme climatisation » doivent **introduire une promesse**, pas défiler
> une fiche produit. Le produit appartient au catalogue.
>
> Les visuels actuels (`aesthetic-*.jpg`) sont des photos stock génériques
> reprenant les logos DAIKIN / GREE / LEFON. Ils sont à remplacer.

---

## Ce qui distingue ces visuels

| | Photo produit | Visuel promotionnel |
|---|---|---|
| Usage | catalogue, fiche, carrousel | section d'introduction de gamme |
| Fond | blanc pur `#FFFFFF` | scène, décor, lumière |
| Cadrage | produit centré, 1:1 | décor large, 3:2 ou 16:9 |
| Angle | neutre, catalogue | éditorial, légèrement plongeant |
| Émotion | information | **confort, fraîcheur, calme** |

**Ne pas générer de photo produit isolée pour ces sections.** C'est
précisément ce qui rendait la section « Gammes » plate.

---

## Style — bloc à coller sur CHAQUE prompt

C'est lui qui garantit que les visuels forment une série cohérente.

```
Editorial lifestyle photograph, contemporary West African interior in
Dakar, natural daylight, real lived-in space, warm neutral palette of
white cream sand and light oak, minimal modern styling, clean
composition with generous negative space, shallow depth of field,
photorealistic, shot on full-frame camera, natural colour grading,
no text, no watermark, no logo, no brand name, no product packaging,
no visible appliance branding.
```

**Prompt négatif :**

```
text, watermark, logo, brand name, letters, caption, price tag,
oversaturated, heavy HDR, orange-teal grade, cluttered, messy,
distorted architecture, warped furniture, deformed hands, extra fingers,
plastic skin, uncanny face, low resolution, blurry, noise,
jpeg artifacts, fisheye distortion
```

> ⚠ Palette **neutre chaude** (crème, sable, chêne clair) — c'est le décor, pas
> l'interface. Le site reste monochrome ; un fond crème dans une photo évite
> au contraire l'aplat blanc mort et rend la section vivante.

---

## 1. Gamme ventilation — « la fraîcheur sans le bruit »

### 1.1 Salon lumineux, brise visible ⭐ principal

```
public/aesthetic/promo-ventilation.jpg  ·  3:2

A bright modern living room in Dakar at mid-morning, a black pedestal
standing fan placed in the foreground as the clear focal point, sheer
white curtains lifting gently in the breeze it creates, light oak wood
floor, white plastered walls, a low linen sofa in cream, one large
monstera plant, soft tropical sunlight raking across the floor.
The mood reads immediately cool and breathable despite the heat outside.
[STYLE]
```

### 1.2 Chambre, réveil tranquille

```
public/aesthetic/promo-ventilation-chambre.jpg  ·  3:2

A calm minimal bedroom at sunrise, a modern black pedestal fan standing
in the corner, linen bedding slightly disturbed, soft golden-hour light
entering through a window with sheer curtains, pale cream and white
walls, light wood bedside table. The atmosphere is the first breath of
the day — quiet and restorative. [STYLE]
```

### 1.3 Fenêtre ouverte, air de saison

```
public/aesthetic/promo-ventilation-fenetre.jpg  ·  3:2

An airy apartment corner with a large open window, white curtains
billowing inward, a modern standing fan angled toward the window,
terracotta-tiled floor, bare white walls, a rattan chair, strong
daylight flooding in. The frame reads as a gust of fresh air entering
the room. [STYLE]
```

### 1.4 Détail — l'objet dans son univers

```
public/aesthetic/promo-ventilation-detail.jpg  ·  1:1

Close-up detail of a modern black pedestal fan grille and blades in
soft directional daylight, shallow depth of field, blurred bright
neutral interior behind, visible fine mesh texture and matte finish,
tasteful and premium, calm neutral tones. [STYLE]
```

---

## 2. Gamme climatisation — « une pièce fraîche, toute la journée »

### 2.1 Chambre fraîche, fin d'après-midi ⭐ principal

```
public/aesthetic/promo-climatisation.jpg  ·  3:2

A serene modern bedroom in the late afternoon, a sleek white
wall-mounted split air conditioner installed high on the wall above
the bed, crisp white and pale grey bedding, sheer curtains diffusing
soft daylight, minimal styling, light oak floor. The room reads
visibly cool and quiet — the opposite of a hot West African bedroom.
[STYLE]
```

### 2.2 Avant / après — le contraste qui vend

```
public/aesthetic/promo-climatisation-avant-apres.jpg  ·  16:9

Clean vertical split composition showing the same room twice from an
identical camera angle: the left half is a hot room, harsh white
sunlight blasting through closed blinds, hot hazy air, hard contrast,
overexposed window; the right half is the same room cooled, blinds
half open, soft even neutral daylight, calm and restful. A white
wall-mounted split air conditioner is visible in the right half.
[STYLE]
```

### 2.3 Salon, journée de travail

```
public/aesthetic/promo-climatisation-salon.jpg  ·  3:2

A bright modern living room used as a home office during the day, a
white wall-mounted split air conditioner visible on the wall, a light
oak desk, large window, neutral cream sofa, plants, cool natural
light. Productive and comfortable — a calm workspace in a hot climate.
[STYLE]
```

### 2.4 Détail — la surface blanche

```
public/aesthetic/promo-climatisation-detail.jpg  ·  1:1

Close-up detail of a sleek white wall-mounted split air conditioner
in a bright neutral room, soft shadow line beneath the unit, matte
white surface catching gentle daylight, blurred minimal interior
behind, premium appliance detail photography. [STYLE]
```

---

## 3. Visuels de campagne (optionnel)

### 3.1 Bannière plein écran — héros

```
public/aesthetic/promo-banniere.jpg  ·  16:9

Wide cinematic photograph of a bright modern Dakar apartment interior
at golden hour, an open window with sheer curtains on the left, a
modern black pedestal fan in the mid-ground, warm neutral palette,
large empty area of plain wall in the centre of the frame reserved for
text overlay, calm and aspirational. [STYLE]
```

### 3.2 Format carré réseaux sociaux

```
public/aesthetic/promo-social.jpg  ·  1:1

Square composition of a serene modern room in Dakar with a white split
air conditioner on the wall and a pedestal fan nearby, bright neutral
daylight, minimal styling, cream and white palette, generous margins
top and bottom for text overlay. [STYLE]
```

---

## 📐 Spécifications

| Propriété | Valeur |
|---|---|
| Format | **3:2** (sections) · 16:9 (bannière) · 1:1 (détail / social) |
| Résolution mini | **1920 × 1280** (3:2) |
| Fichier | `.jpg` qualité 88, ou `.webp` |
| Couleur | sRGB |
| Lumière | naturelle uniquement — pas de flash ni d'éclairage studio apparent |

---

## 📁 Noms de fichiers

Déposez les fichiers à ces noms — le câblage est déjà fait, aucune
modification de code nécessaire :

| Fichier | Remplace | Usage |
|---|---|---|
| `promo-ventilation.jpg` | `aesthetic-fan-livingroom.jpg` | Gamme ventilation |
| `promo-climatisation.jpg` | `aesthetic-breeze-bedroom-1.jpg` | Gamme climatisation |
| `promo-climatisation-avant-apres.jpg` | `aesthetic-breeze-bedroom-2.jpg` | Bandeau campagne |
| `promo-ventilation-chambre.jpg` | *(nouveau)* | Optionnel |
| `promo-ventilation-fenetre.jpg` | *(nouveau)* | Optionnel |
| `promo-climatisation-salon.jpg` | *(nouveau)* | Optionnel |
| `promo-banniere.jpg` | *(nouveau)* | Optionnel |
| `promo-social.jpg` | *(nouveau)* | Optionnel |

Tous dans : `public/aesthetic/`

---

## ✅ Contrôle qualité

```sh
cd public/aesthetic
for f in *; do printf "%-46s " "$f"; identify -format "%wx%h  %b\n" "$f"; done
```

**Refuser si :**

- un **logo ou du texte** apparaît — c'est le défaut le plus fréquent ;
- le décor est **coupé** par le cadre ;
- le rendu est « plastique » ou sur-saturé (souvent un `--style raw` trop fort) ;
- la lumière est incohérente entre les deux visuels de gamme ;
- des mains ou visages sont déformés — régénérer plutôt que retoucher.

Astuce : réutiliser la même graine / `--seed` pour deux visuels d'une même
gamme favorise la cohérence de lumière et de palette.

---

## ⚖️ À dire au client

Ce sont des visuels de **mise en scène**, pas des photos des machines
réellement vendues. Ils sont cohérents avec un catalogue qui reste, lui,
en photos produits. À remplacer par de vraies photos de show-room avant la
livraison finale si le client peut en fournir.
