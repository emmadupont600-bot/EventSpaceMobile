/**
 * AuthContext — alias rétro-compatible vers AppContext.
 * Certains anciens screens appellent useAuth() : ce fichier les fait
 * pointer automatiquement sur AppContext sans rien casser.
 */
export { AppProvider as AuthProvider, useApp as useAuth } from './AppContext';
