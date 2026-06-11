# 🏢 EventSpace Mobile

Application mobile de mise en relation entre **annonceurs de lieux événementiels** et **particuliers/clients**.

Développée avec **React Native + Expo SDK 54** — design system « Luxury Minimal » 2026 (`src/theme/tokens.ts`).

---

## ✨ Fonctionnalités

### Coté Client (Particulier)
- 🔍 Recherche et filtrage de lieux par ville, type, catégorie (+ recherche IA en langage naturel)
- 🏙 Fiche détail avec galerie photos, équipements, avis
- 📅 Réservation en ligne (date, horaires, nb invités, type d'événement)
- 💳 Paiement sécurisé Stripe (mode test) avec codes promo
- ❤️ Gestion des favoris
- 💬 Chat temps réel avec l'annonceur
- 📊 Suivi des réservations

### Coté Annonceur
- ➕ Ajout et édition de lieux, gestion des disponibilités
- 📥 Réception et gestion des demandes de réservation
- ✔️ Acceptation (capture du paiement) / refus (remboursement)
- 📈 Statistiques de revenus
- 💬 Chat avec les clients

---

## 🚀 Lancement rapide (test)

### 1. Cloner et installer

```bash
git clone https://github.com/emmadupont600-bot/EventSpaceMobile
cd EventSpaceMobile
npm ci --legacy-peer-deps
```

### 2. Configurer les clés (obligatoire)

Les clés ne sont **pas versionnées** (sécurité). Copier le template puis renseigner
les valeurs (Supabase → Settings → API ; Stripe → Developers → API keys) :

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://<ton-projet>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<clé anon Supabase>
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<clé publique Stripe>
```

### 3. Lancer

```bash
npx expo start
```

Scanner le QR code avec **Expo Go** (iOS/Android) ou lancer un simulateur (`i` / `a`).

> ⚠️ Le paiement Stripe (`CardField`) nécessite un **development build**
> (`npx expo run:ios` / `npx expo run:android`) — il n'est pas supporté dans Expo Go.

### 4. Vérifier (tests + types)

```bash
npm test          # 30 tests (dont flux financiers Stripe)
npm run typecheck # TypeScript strict
```

---

## 👤 Comptes démo

Boutons « Démo client » / « Démo annonceur » directement sur l'écran de connexion, ou :

| Rôle | Email | Mot de passe |
|------|-------|------|
| Client | client@demo.com | demo123 |
| Annonceur | annonceur@demo.com | demo123 |

## 💳 Cartes de test Stripe

| Numéro | Comportement |
|--------|--------------|
| 4242 4242 4242 4242 | Accepté |
| 4000 0000 0000 9995 | Refusée |
| 4000 0025 0000 3155 | 3D Secure |

Date : n'importe quelle date future — CVC : n'importe quoi.

---

## 📁 Architecture

```
src/
├── components/     # Composants réutilisables (VenueCard, Button, Skeleton...)
├── config/         # env.js — clés via expo-constants (.env → app.config.js)
├── constants/      # COMMISSION_RATE, TTL cache
├── context/        # AppContext (auth/favoris), ThemeContext (dark mode)
├── navigation/     # Tabs + Stacks, getNavigatorForRole
├── screens/        # Tous les écrans
│   ├── auth/ home/ chat/ reservations/ profile/ annonceur/ favorites/ ...
├── services/       # authService, venueService, reservationService,
│                   # messagingService, reviewService, stripeService (TS)
├── theme/          # tokens.ts (source de vérité) + alias colors.js
└── utils/          # Store (façade compat), haptics, currency, notifications
```

Voir aussi : `docs/SETUP.md` (Supabase, Edge Functions, webhooks) et `STRIPE_SETUP.md`.

## 💰 Modèle économique

- Commission de **12% sur le montant de la réservation** (déduite du versement annonceur)
- Inscription annonceur **gratuite**

---

Made with ❤️ for EventSpace
