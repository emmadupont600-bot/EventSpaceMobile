/**
 * notifications.js — Push notifications Expo + sauvegarde du token en DB.
 *
 * Install: npx expo install expo-notifications expo-device
 *
 * Usage:
 *   - Appeler initNotifications(userId) au démarrage (dans AppContext)
 *   - Appeler schedulePushNotification() pour une notif locale immédiate
 */

let Notifications = null;
let Device = null;

try { Notifications = require('expo-notifications'); } catch { }
try { Device = require('expo-device'); } catch { }

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

import { supabase } from '../lib/supabase';

/**
 * Demande la permission, récupère le token Expo,
 * le sauvegarde dans users.push_token pour les webhooks.
 * @param {string|number} userId
 */
export async function initNotifications(userId) {
  if (!Notifications || !Device) {
    console.warn('[Notif] Installe expo-notifications expo-device');
    return;
  }
  if (!Device.isDevice) return; // simulateur

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  if (require('react-native').Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('eventspace', {
      name: 'EventSpace',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    if (token && userId) {
      // Sauvegarde du token en DB → utilisé par le Stripe Webhook
      await supabase.from('users').update({ push_token: token }).eq('id', userId);
    }
    return token;
  } catch (e) {
    console.warn('[Notif] Token indisponible:', e.message);
  }
}

/**
 * Notification locale immédiate (feedback in-app).
 * @param {string} title
 * @param {string} body
 */
export async function schedulePushNotification(title, body) {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null, // immédiat
    });
  } catch (e) {
    console.warn('[Notif] scheduleNotificationAsync:', e.message);
  }
}

/**
 * Retourne l'abonnement aux notifications reçues (à unsub au unmount).
 * @param {function} callback - reçoit la notification
 */
export function subscribeToNotifications(callback) {
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationReceivedListener(callback);
}
