# Supabase — EventSpace

## Projet
- **URL** : https://lmmadyvzbzeafriyeseg.supabase.co
- **Dashboard** : https://supabase.com/dashboard/project/lmmadyvzbzeafriyeseg
- **Région** : eu-west-2 (Londres)

## Tables créées
| Table | Description |
|---|---|
| `users` | Comptes clients et annonceurs |
| `venues` | Lieux événementiels |
| `reservations` | Demandes de réservation |
| `reviews` | Avis clients |
| `conversations` | Fils de messages |
| `messages` | Messages dans les conversations |
| `favorites` | Lieux favoris par utilisateur |

## Comptes démo
| Rôle | Email | Mot de passe |
|---|---|---|
| Client | client@demo.fr | demo123 |
| Annonceur | annonceur@demo.fr | demo123 |

## Package à installer
```bash
npx expo install @supabase/supabase-js
```

## Notes
- Les mots de passe sont stockés en clair (pour la démo). En production, utiliser Supabase Auth.
- La session utilisateur est en mémoire (non persistée entre relances). Pour persister, utiliser AsyncStorage + restauration au boot.
- RLS activé sur toutes les tables, policies permissives pour la démo.
