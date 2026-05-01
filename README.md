# 🏢 EventSpace Mobile

Application mobile de mise en relation entre **annonceurs de lieux événementiels** et **particuliers/clients**.

Développée avec **React Native + Expo**.

---

## ✨ Fonctionnalités

### Coté Client (Particulier)
- 🔍 Recherche et filtrage de lieux par ville, type, catégorie
- 🏙 Fiche détail avec galerie photos, équipements, avis
- 📅 Réservation en ligne (choix date, horaires, nb invités, type d'événement)
- ❤️ Gestion des favoris
- 💬 Chat temps réel avec l'annonceur
- 📊 Suivi des réservations

### Coté Annonceur
- ➕ Ajout de lieux événementiels
- 📥 Réception et gestion des demandes de réservation
- ✔️ Acceptation / refus des demandes
- 💬 Chat avec les clients

---

## 🚀 Lancement rapide

```bash
git clone https://github.com/emmadupont600-bot/EventSpaceMobile
cd EventSpaceMobile
npm install
npx expo start
```

## 👤 Comptes démo

| Rôle | Email | Mot de passe |
|------|-------|------|
| Client | user@demo.fr | demo1234 |
| Annonceur | annonceur@demo.fr | demo5678 |

---

## 📁 Architecture

```
src/
├── components/     # Composants réutilisables
├── data/           # Données de démonstration
├── navigation/     # Navigation (Stack + Tabs)
├── screens/        # Tous les écrans
│   ├── auth/
│   ├── home/
│   ├── chat/
│   ├── reservations/
│   ├── profile/
│   ├── annonceur/
│   └── favorites/
├── theme/          # Couleurs, typo, spacing
└── utils/          # Store AsyncStorage
```

## 💰 Modèle économique

- Commission de **12% sur le montant de la réservation** (coté client)
- Inscription annonceur **gratuite**

---

Made with ❤️ for EventSpace
