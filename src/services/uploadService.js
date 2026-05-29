/**
 * uploadService.js — Upload de photos vers Supabase Storage
 *
 * Bucket requis : « venue-photos » (public)
 * Créer depuis le dashboard Supabase → Storage → New bucket
 *   Name: venue-photos | Public: ✅
 *
 * Install: npx expo install expo-image-picker
 */

import { supabase } from './supabase';

let ImagePicker = null;
try { ImagePicker = require('expo-image-picker'); } catch { }

const BUCKET = 'venue-photos';

/**
 * Ouvre le sélecteur d'images et retourne l'URI locale sélectionnée.
 * Retourne null si annulé ou packages absents.
 */
export async function pickImage() {
  if (!ImagePicker) {
    console.warn('[Upload] Installe expo-image-picker : npx expo install expo-image-picker');
    return null;
  }
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    console.warn('[Upload] Permission galerie refusée');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });
  if (result.canceled) return null;
  return result.assets?.[0]?.uri ?? null;
}

/**
 * Upload un fichier local vers Supabase Storage.
 * Retourne l'URL publique du fichier uploadé.
 *
 * @param {string} localUri - URI expo (ex: file:///tmp/photo.jpg)
 * @param {string} folder   - sous-dossier dans le bucket (ex: 'venues/42')
 * @returns {Promise<string|null>} URL publique
 */
export async function uploadPhoto(localUri, folder = 'misc') {
  try {
    const filename = `${folder}/${Date.now()}.jpg`;
    // Fetch → Blob (React Native)
    const response = await fetch(localUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return data?.publicUrl ?? null;
  } catch (e) {
    console.error('[Upload] uploadPhoto:', e.message);
    return null;
  }
}

/**
 * Sélectionne ET upload une photo en une seule fonction.
 * Retourne l'URL publique ou null.
 *
 * @param {string} folder - ex: 'venues/42'
 */
export async function pickAndUpload(folder = 'misc') {
  const uri = await pickImage();
  if (!uri) return null;
  return uploadPhoto(uri, folder);
}
