/**
 * EditVenueScreen — modifier ou supprimer une salle existante.
 * Utilise Store.updateVenue / Store.deleteVenue (Supabase).
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography } from '../../theme/colors';

const TYPES = ['Château', 'Loft', 'Rooftop', 'Studio photo', 'Jardin', 'Péniche', 'Cave', 'Salle de réception', 'Autre'];

export default function EditVenueScreen({ route, navigation }) {
  const { venue } = route.params;
  const insets = useSafeAreaInsets();

  const [name, setName]           = useState(venue.name || '');
  const [type, setType]           = useState(venue.type || '');
  const [city, setCity]           = useState(venue.city || '');
  const [address, setAddress]     = useState(venue.address || '');
  const [price, setPrice]         = useState(String(venue.price || ''));
  const [capacity, setCapacity]   = useState(String(venue.capacity || ''));
  const [description, setDescription] = useState(venue.description || '');
  const [img, setImg]             = useState(venue.img || '');
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !city.trim() || !price || !capacity) {
      Alert.alert('Champs manquants', 'Nom, ville, prix et capacité sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await Store.updateVenue(venue.id, {
        name: name.trim(),
        type,
        city: city.trim(),
        address: address.trim(),
        price: Number(price),
        capacity: Number(capacity),
        description: description.trim(),
        img: img.trim() || venue.img,
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
    Alert.alert(
      '🗑️ Supprimer ce lieu',
      `Êtes-vous sûr de vouloir supprimer « ${venue.name} » ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
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
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le lieu</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteHeaderBtn} disabled={deleting}>
            {deleting
              ? <ActivityIndicator size="small" color="#EF4444" />
              : <Ionicons name="trash-outline" size={22} color="#EF4444" />}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field label="Nom du lieu *" value={name} onChangeText={setName} placeholder="Ex: Loft du Marais" />

          <Text style={styles.label}>Type de lieu *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Field label="Ville *" value={city} onChangeText={setCity} placeholder="Ex: Paris" />
          <Field label="Adresse complète" value={address} onChangeText={setAddress} placeholder="Ex: 34 Rue de Bretagne, 75003" />
          <Field label="Prix / heure (€) *" value={price} onChangeText={setPrice} placeholder="Ex: 800" keyboardType="number-pad" />
          <Field label="Capacité max (personnes) *" value={capacity} onChangeText={setCapacity} placeholder="Ex: 80" keyboardType="number-pad" />
          <Field
            label="Description"
            value={description} onChangeText={setDescription}
            placeholder="Décrivez votre lieu..."
            multiline numberOfLines={4}
          />
          <Field
            label="URL de la photo principale"
            value={img} onChangeText={setImg}
            placeholder="https://images.unsplash.com/..."
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>💾 Enregistrer les modifications</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
            {deleting
              ? <ActivityIndicator color="#EF4444" />
              : <Text style={styles.deleteBtnText}>🗑️ Supprimer ce lieu</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMulti]}
        placeholderTextColor={colors.light}
        autoCorrect={false}
        {...props}
      />
    </>
  );
}

const C = colors;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: typography.h3, fontWeight: '700', color: C.dark },
  deleteHeaderBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 60 },
  label: { fontSize: 13, fontWeight: '700', color: C.mid, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: typography.body, color: C.dark,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },
  typeRow: { flexGrow: 0, marginBottom: 4 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8, marginBottom: 8,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white,
  },
  typeChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  typeChipText: { fontSize: 13, fontWeight: '600', color: C.dark },
  typeChipTextActive: { color: '#fff' },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginTop: 28, marginBottom: 12,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.body },
  deleteBtn: {
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EF4444',
  },
  deleteBtnText: { color: '#EF4444', fontWeight: '700', fontSize: typography.body },
});
