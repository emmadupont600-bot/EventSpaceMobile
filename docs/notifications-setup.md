# 🔔 Setup Notifications Push

## 1. Installer les dépendances

```bash
npx expo install expo-notifications expo-device expo-constants
```

## 2. Configurer app.json

```json
{
  "expo": {
    "extra": {
      "eas": { "projectId": "<ton-project-id-eas>" }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4F46E5",
          "sounds": []
        }
      ]
    ]
  }
}
```

Ajoute dans `.env` :
```
EXPO_PUBLIC_PROJECT_ID=<ton-project-id-eas>
```

## 3. Déployer l'Edge Function Supabase

```bash
npx supabase functions deploy notify-reservation --no-verify-jwt
```

## 4. Configurer le Database Webhook dans Supabase

Dashboard → Database → Webhooks → **New Webhook** :

| Champ | Valeur |
|---|---|
| Name | `on_reservation_status_change` |
| Table | `reservations` |
| Events | ✅ INSERT ✅ UPDATE |
| URL | `https://<project-ref>.supabase.co/functions/v1/notify-reservation` |
| HTTP Header | `Authorization: Bearer <SERVICE_ROLE_KEY>` |

## 5. Appliquer la migration SQL

```bash
npx supabase db push
# ou
npx supabase migration up
```

## 6. Tester

Dans Supabase Dashboard → Table Editor → `reservations` :
- Change le `status` d'une réservation de `pending` → `accepted`
- Le client doit recevoir une notif push 🎉

## Flow complet

```
Client réserve
    ↓
status = 'pending'
    ↓  (webhook)
Edge Function → notif push à l'ANNONCEUR : "Nouvelle demande"
    ↓
Annonceur accepte (status = 'accepted')
    ↓  (webhook)
Edge Function → notif push au CLIENT : "Accepté ! Payez maintenant"
    ↓
Client paie (status = 'confirmed', payment_status = 'paid')
    ↓  (webhook)
Edge Function → notif push à l'ANNONCEUR : "Paiement reçu !"
```
