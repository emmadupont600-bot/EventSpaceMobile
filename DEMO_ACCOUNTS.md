# Comptes démo EventSpace

## Client
- **Email :** `client@demo.com`
- **Mot de passe :** `demo123`
- **Rôle :** client

## Annonceur
- **Email :** `annonceur@demo.com`
- **Mot de passe :** `demo123`
- **Rôle :** annonceur

> Ces comptes doivent être créés manuellement dans Supabase Auth
> (Authentication > Users > Add user) ou via l'inscription dans l'app.

## Cartes Stripe de test

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | ✅ Paiement accepté |
| `4000 0000 0000 9995` | ❌ Carte refusée |
| `4000 0025 0000 3155` | 🔐 3D Secure |

Date expiration : n'importe quelle date future. CVC : 3 chiffres quelconques.

## Mode démo Stripe

Le paiement est actuellement en **mode démo** (`DEMO_MODE = true` dans `stripeService.js`).
Il simule toujours un paiement réussi sans appel réseau réel.
Pour activer Stripe réel : passer `DEMO_MODE = false` et déployer l'Edge Function.
