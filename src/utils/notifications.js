/**
 * notifications.js — Gestion des push notifications avec expo-notifications.
 *
 * ⚠️  Requires: npx expo install expo-notifications expo-device
 *
 * Toutes les fonctions sont défensives : elles échouent silencieusement
 * si les packages ne sont pas encore installés ou si on est sur simulateur.
 */

let Notifications = null;
let Device = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
} catch {
  // expo-notifications pas encore installé → toutes les fonctions seront des no-ops
}

// Config du handler (affiche l'alerte même en foreground)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Demande la permission push et retourne le token Expo.
 * Retourne null si permission refusée ou packages absents.
 */
export async function registerForPushNotificationsAsync() {
  if (!Notifications || !Device) {
    console.warn('[Notifications] expo-notifications non installé. Lance : npx expo install expo-notifications expo-device');
    return null;
  }
  if (!Device.isDevice) {
    console.warn('[Notifications] Push non disponible sur simulateur');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission refusée par l\'utilisateur');
    return null;
  }

  if (require('react-native').Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'EventSpace',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (e) {
    console.warn('[Notifications] Token indisponible:', e.message);
    return null;
  }
}

/**
 * Planifie une notification locale après `delaySeconds` secondes.
 * No-op silencieux si expo-notifications n'est pas installé.
 *
 * @param {string} title
 * @param {string} body
 * @param {number} delaySeconds
 */
export async function schedulePushNotification(title, body, delaySeconds = 1) {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });
  } catch (e) {
    console.warn('[Notifications] scheduleNotificationAsync:', e.message);
  }
}
