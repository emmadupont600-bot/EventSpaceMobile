# Setup & Installation

## 1. Packages Expo requis

```bash
npx expo install expo-notifications expo-device expo-image-picker
```

## 2. Variables d'environnement

Crée un fichier `.env` à la racine :

```env
EXPO_PUBLIC_SUPABASE_URL=https://lmmadyvzbzeafriyeseg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ta_clé_anon>
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TSkDI1...
```

## 3. Secrets Supabase Edge Functions

Dans Supabase → Settings → Edge Functions → Secrets :

| Nom | Valeur |
|-----|--------|
| `STRIPE_SECRET_KEY` | `sk_test_51TSkDI1...` |
| `STRIPE_WEBHOOK_SECRET` | (depuis dashboard Stripe → Webhooks) |

## 4. Bucket Supabase Storage

Dans Supabase → Storage → New bucket :
- **Name**: `venue-photos`
- **Public**: ✅ activé

## 5. Stripe Webhook

Dans [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → Add endpoint :
- **URL**: `https://lmmadyvzbzeafriyeseg.supabase.co/functions/v1/stripe-webhook`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copie le **Signing secret** → l'ajouter comme `STRIPE_WEBHOOK_SECRET` dans Supabase

## 6. Utilisation upload photo dans un screen

```js
import { pickAndUpload } from '../services/uploadService';
import { Store } from '../utils/store';

// Dans un bouton "Changer la photo"
const url = await pickAndUpload(`venues/${venue.id}`);
if (url) {
  await Store.updateVenueCover(venue.id, url);
  setVenue(prev => ({ ...prev, img: url }));
}
```
