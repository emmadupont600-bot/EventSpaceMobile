import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Store } from '../../utils/store';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, typography, radius } from '../../theme/colors';

const TYPES = ['Salle de réception', 'Rooftop', 'Loft', 'Château', 'Studio photo', 'Jardin', 'Autre'];

export default function AddVenueScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', city: '', address: '', price: '', capacity: '', type: '', description: '', img: '' });
  const [loading, setLoading] = useState(false);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.city || !form.price || !form.capacity || !form.type) {
      return Alert.alert('Champs manquants', 'Remplissez tous les champs obligatoires.');
    }
    setLoading(true);
    const user = await Store.getCurrentUser();
    await Store.addVenue({
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      ownerId: user.id,
      img: form.img || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
    });
    Alert.alert('✅ Lieu ajouté !', 'Votre lieu est maintenant visible sur la plateforme.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Ajouter un lieu" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Nom du lieu *" value={form.name} onChangeText={v => setF('name', v)} placeholder="Ex: Salle des Roses" icon="business-outline" />
        <Input label="Ville *" value={form.city} onChangeText={v => setF('city', v)} placeholder="Paris, Lyon..." icon="location-outline" />
        <Input label="Adresse complète *" value={form.address} onChangeText={v => setF('address', v)} placeholder="12 rue de la Paix, 75001 Paris" icon="map-outline" />
        <Input label="Prix / heure (€) *" value={form.price} onChangeText={v => setF('price', v)} placeholder="Ex: 150" keyboardType="number-pad" icon="cash-outline" />
        <Input label="Capacité max (personnes) *" value={form.capacity} onChangeText={v => setF('capacity', v)} placeholder="Ex: 80" keyboardType="number-pad" icon="people-outline" />

        <Text style={styles.label}>Type de lieu *</Text>
        <View style={styles.typeGrid}>
          {TYPES.map(t => (
            <Button
              key={t}
              title={t}
              variant={form.type === t ? 'primary' : 'outline'}
              onPress={() => setF('type', t)}
              style={styles.typeBtn}
            />
          ))}
        </View>

        <Input label="Description" value={form.description} onChangeText={v => setF('description', v)} placeholder="Décrivez votre lieu..." multiline numberOfLines={4} icon="document-text-outline" />
        <Input label="URL photo principale" value={form.img} onChangeText={v => setF('img', v)} placeholder="https://..." icon="image-outline" />

        <Button title="Publier le lieu" onPress={save} loading={loading} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  label: { fontSize: typography.small, fontWeight: '700', color: colors.mid, marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2 },
});
