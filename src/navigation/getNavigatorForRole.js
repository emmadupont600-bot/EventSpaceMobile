/**
 * getNavigatorForRole — résout le navigateur racine selon le rôle utilisateur.
 * Point d'extension unique pour les futurs rôles (admin, modérateur, ...).
 */
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import AnnonceurNavigator from './AnnonceurNavigator';

const NAVIGATORS_BY_ROLE = {
  client: ClientNavigator,
  annonceur: AnnonceurNavigator,
};

export default function getNavigatorForRole(user) {
  if (!user) return AuthNavigator;
  return NAVIGATORS_BY_ROLE[user.role] ?? ClientNavigator;
}
