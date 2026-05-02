/**
 * notifications.js — Gestion des push notifications avec expo-notifications.
 * Demande la permission au premier appel, puis expose schedulePushNotification.
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Config du handler de notification (affiche l'alerte même en foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Demande la permission et retourne le token Expo Push
export async function registerForPushNotificationsAsync() {
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
    console.warn('[Notifications] Permission refusée');
    return null;
  }

  if (Platform.OS === 'android') {
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
    console.warn('[Notifications] Impossible d\'obtenir le token:', e.message);
    return null;
  }
}

/**
 * Planifie une notification locale après `delaySeconds` secondes.
 * @param {string} title
 * @param {string} body
 * @param {number} delaySeconds
 */
export async function schedulePushNotification(title, body, delaySeconds = 1) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });
  } catch (e) {
    // Silencieux sur simulateur
    console.warn('[Notifications] scheduleNotificationAsync:', e.message);
  }
}
