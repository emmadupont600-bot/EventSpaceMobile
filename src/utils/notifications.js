/**
 * notifications.js
 *
 * Push notifications via Expo. Optional: if the native modules
 * (`expo-notifications`, `expo-device`) are not linked, we silently
 * skip everything — the app keeps working in Expo Go web/dev environments.
 *
 * - Asks permission on first launch
 * - Stores the Expo push token in `users.expo_push_token`
 * - Provides sendLocalNotif() for in-app fallback notifications
 */
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';

let Notifications = null;
let Device = null;
try { Notifications = require('expo-notifications'); } catch {}
try { Device = require('expo-device'); } catch {}

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
 * initNotifications(userId)
 * Returns the Expo push token, or null if unavailable / declined / on simulator.
 */
export async function initNotifications(userId) {
  try {
    if (!Notifications || !Device) return null;
    if (!Device.isDevice) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reservations', {
        name: 'Réservations',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData?.data ?? null;

    if (userId && token) {
      try {
        await supabase
          .from('users')
          .update({ expo_push_token: token })
          .eq('id', userId);
      } catch {}
    }
    return token;
  } catch (e) {
    console.warn('[Notif] init error:', e?.message);
    return null;
  }
}

export async function sendLocalNotif(title, body, data = {}) {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  } catch {}
}
