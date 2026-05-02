/**
 * notifications.js
 * - Demande la permission Expo Notifications au 1er lancement
 * - Enregistre le token push dans Supabase (table users.expo_push_token)
 * - Affiche les notifications reçues en foreground
 * - sendLocalNotif() : notif locale immédiate (test / fallback)
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';

// Affiche les notifs en foreground (son + badge + bannière)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

/**
 * initNotifications(userId)
 * À appeler après login / register.
 * Retourne le token Expo ou null si simulateur / permissions refusées.
 */
export async function initNotifications(userId) {
  if (!Device.isDevice) {
    console.log('[Notif] Simulateur détecté — push non disponible');
    return null;
  }

  // Demande de permission
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('[Notif] Permission refusée');
    return null;
  }

  // Android : channel obligatoire
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reservations', {
      name: 'Réservations',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });
  }

  // Récupération du token Expo Push
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // défini dans app.json / .env
  });
  const token = tokenData.data;
  console.log('[Notif] Expo push token:', token);

  // Sauvegarde dans Supabase
  if (userId && token) {
    const { error } = await supabase
      .from('users')
      .update({ expo_push_token: token })
      .eq('id', userId);
    if (error) console.warn('[Notif] Erreur save token:', error.message);
  }

  return token;
}

/**
 * sendLocalNotif(title, body, data?)
 * Notification locale immédiate — utile pour tests ou fallback offline.
 */
export async function sendLocalNotif(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null, // immédiat
  });
}

/**
 * useNotificationListener(onNotification, onResponse)
 * Hook à utiliser dans App.js pour réagir aux notifs reçues / tapées.
 *
 * onNotification(notification) — notif reçue en foreground
 * onResponse(response)         — utilisateur a tapé la notif
 */
import { useEffect, useRef } from 'react';
export function useNotificationListener(onNotification, onResponse) {
  const notifListener   = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notifListener.current = Notifications.addNotificationReceivedListener(n => {
      onNotification && onNotification(n);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(r => {
      onResponse && onResponse(r);
    });
    return () => {
      Notifications.removeNotificationSubscription(notifListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
