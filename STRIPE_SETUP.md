# 💳 Stripe — Guide d'intégration TEST EventSpace Mobile

## 1. Variables d'environnement

### App mobile (src/utils/stripeService.js)
Remplace la valeur de `STRIPE_PUBLISHABLE_KEY` par ta vraie clé publique test :
```
pk_test_51XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Edge Function Supabase
Dans le Dashboard Supabase → Settings → Edge Functions → Secrets, ajoute :
```
STRIPE_SECRET_KEY = sk_test_51XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 2. Installation SDK mobile
```bash
npx expo install @stripe/stripe-react-native
```

## 3. Wrapper StripeProvider dans App.js
```jsx
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './src/utils/stripeService';

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {/* ton AppContext, NavigationContainer, etc. */}
    </StripeProvider>
  );
}
```

## 4. Route Navigation — ajouter PaymentScreen
Dans ton fichier de navigation (ex: `src/navigation/ClientNavigator.js`) :
```jsx
import PaymentScreen from '../screens/client/PaymentScreen';

// Dans le Stack Navigator :
<Stack.Screen name="Payment" component={PaymentScreen} />
```

## 5. Deploy de l'Edge Function
```bash
supabase functions deploy create-payment-intent
```

## 6. Migration SQL — colonnes à ajouter dans la table `reservations`
```sql
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refusal_reason TEXT;
```

## 7. Cartes de test Stripe
| Numéro | Résultat |
|--------|----------|
| 4242 4242 4242 4242 | ✅ Paiement accepté |
| 4000 0000 0000 9995 | ❌ Carte refusée |
| 4000 0025 0000 3155 | 🔒 3D Secure requis |

Date : n'importe quelle date future · CVC : n'importe quoi

## 8. Flux complet
```
Client → BookingScreen → demande envoyée (status: pending)
                                ↓
Annonceur → accepte (status: accepted, payment_status: pending_payment)
                                ↓
Client → ReservationsScreen → bouton "Payer maintenant" apparaît
                                ↓
Client → PaymentScreen → saisie carte → confirmPayment(clientSecret)
                                ↓
Stripe confirme → updateReservationPaymentStatus(paid)
                                ↓
Réservation confirmée ✅
```
