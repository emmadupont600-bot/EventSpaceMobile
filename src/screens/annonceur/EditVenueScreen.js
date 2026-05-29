/**
 * EditVenueScreen — modifier lieu, galerie photos, disponibilités
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_CURRENCIES, formatMoneyPerHour } from '../../utils/currency';

const TYPES = ['Château', 'Loft', 'Rooftop', 'Studio photo', 'Jardin', 'Péniche', 'Cave', 'Salle de réception', 'Autre'];

export default function EditVenueScreen({ route, navigation }) {
  const { venue } = route.params;
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(venue.name || '');
  const [type, setType] = useState(venue.type || '');
  const [city, setCity] = useState(venue.city || '');
  const [address, setAddress] = useState(venue.address || '');
  const [price, setPrice] = useState(String(venue.price || ''));
  const [capacity, setCapacity] = useState(String(venue.capacity || ''));
  const [description, setDescription] = useState(venue.description || '');
  const [img, setImg] = useState(venue.img || '');
  const [currency, setCurrency] = useState(venue.currency || 'eur');
  const [gallery, setGallery] = useState(venue.gallery || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const movePhoto = (index, direction) => {
    const next = [...gallery];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setGallery(next);
  };

  const removePhoto = async (url) => {
    try {
      await Store.removeVenueGalleryPhoto(venue.id, url);
      setGallery(g => g.filter(u => u !== url));
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  const addPhoto = async () => {
    if (!newPhotoUrl.trim()) return;
    try {
      const updated = await Store.addVenueGalleryPhoto(venue.id, newPhotoUrl.trim());
      setGallery(updated);
      setNewPhotoUrl('');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !city.trim() || !price || !capacity) {
      Alert.alert('Champs manquants', 'Nom, ville, prix et capacité sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await Store.reorderVenueGallery(venue.id, gallery);
      await Store.updateVenue(venue.id, {
        name: name.trim(), type, city: city.trim(), address: address.trim(),
        price: Number(price), capacity: Number(capacity),
        description: description.trim(), img: img.trim() || venue.img, currency,
      });
      Alert.alert('✅ Sauvegardé', 'Les modifications ont été enregistrées.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('🗑️ Supprimer ce lieu', `Supprimer « ${venue.name} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await Store.deleteVenue(venue.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Erreur', e.message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.dark} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.dark }]}>Modifier le lieu</Text>
          <TouchableOpacity onPress={handleDelete} disabled={deleting}>
            {deleting ? <ActivityIndicator size="small" color={colors.error} /> : <Ionicons name="trash-outline" size={22} color={colors.error} />}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Field label="Nom du lieu *" value={name} onChangeText={setName} colors={colors} typography={typography} />

          <Text style={[styles.label, { color: colors.mid }]}>Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, { borderColor: colors.border, backgroundColor: type === t ? colors.primary : colors.white }]}
                onPress={() => setType(t)}
              >
                <Text style={{ color: type === t ? '#fff' : colors.dark, fontWeight: '600', fontSize: 13 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Field label="Ville *" value={city} onChangeText={setCity} colors={colors} typography={typography} />
          <Field label="Adresse" value={address} onChangeText={setAddress} colors={colors} typography={typography} />
          <Field label={`Prix / heure (${formatMoneyPerHour(0, currency).split(' ')[1]})`} value={price} onChangeText={setPrice} keyboardType="number-pad" colors={colors} typography={typography} />
          <Field label="Capacité *" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" colors={colors} typography={typography} />

          <Text style={[styles.label, { color: colors.mid }]}>Devise</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {SUPPORTED_CURRENCIES.map(c => (
              <TouchableOpacity
                key={c.code}
                style={[styles.chip, { borderColor: colors.border, backgroundColor: currency === c.code ? colors.primary : colors.white }]}
                onPress={() => setCurrency(c.code)}
              >
                <Text style={{ color: currency === c.code ? '#fff' : colors.dark, fontWeight: '600' }}>{c.symbol} {c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Field label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} colors={colors} typography={typography} />
          <Field label="Photo principale (URL)" value={img} onChangeText={setImg} autoCapitalize="none" colors={colors} typography={typography} />

          <Text style={[styles.label, { color: colors.mid }]}>Galerie ({gallery.length} photos)</Text>
          {gallery.map((url, i) => (
            <View key={url} style={[styles.galleryRow, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <Image source={{ uri: url }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.mid, fontSize: 11 }} numberOfLines={1}>{url}</Text>
              </View>
              <TouchableOpacity onPress={() => movePhoto(i, -1)} disabled={i === 0}>
                <Ionicons name="chevron-up" size={20} color={i === 0 ? colors.border : colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => movePhoto(i, 1)} disabled={i === gallery.length - 1}>
                <Ionicons name="chevron-down" size={20} color={i === gallery.length - 1 ? colors.border : colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removePhoto(url)}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1, color: colors.dark, borderColor: colors.border, backgroundColor: colors.white }]}
              placeholder="URL nouvelle photo"
              placeholderTextColor={colors.light}
              value={newPhotoUrl}
              onChangeText={setNewPhotoUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.addPhotoBtn, { backgroundColor: colors.primary }]} onPress={addPhoto}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.availBtn, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
            onPress={() => navigation.navigate('VenueAvailability', { venue: { ...venue, name, id: venue.id } })}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Gérer le calendrier de disponibilités</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>💾 Enregistrer</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, colors, typography, ...props }) {
  return (
    <>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.mid, marginBottom: 6, marginTop: 14 }}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border,
          paddingHorizontal: 12, paddingVertical: 12, fontSize: typography.body, color: colors.dark,
          ...(props.multiline ? { minHeight: 90, textAlignVertical: 'top' } : {}),
        }}
        placeholderTextColor={colors.light}
        autoCorrect={false}
        {...props}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8, borderWidth: 1.5 },
  input: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  galleryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  addPhotoBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  availBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, marginTop: 20, marginBottom: 8 },
  saveBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
