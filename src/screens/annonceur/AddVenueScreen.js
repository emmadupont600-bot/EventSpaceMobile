import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

const TYPES = ['Loft', 'Salle', 'Studio', 'Rooftop', 'Domaine', 'Bureau', 'Autre'];
const CATEGORIES = ['Soirée', 'Mariage', 'Professionnel', 'Anniversaire'];

export default function AddVenueScreen({ navigation }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name || !location || !price || !capacity || !type || !category) {
      Alert.alert('Champs manquants', 'Remplissez tous les champs obligatoires');
      return;
    }
    Alert.alert('🎉 Lieu ajouté !', `"${name}" a été publié avec succès sur EventSpace !`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un lieu</Text>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nom du lieu *</Text>
        <TextInput style={styles.input} placeholder="Ex: Le Loft des Arts" value={name} onChangeText={setName} placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>Ville / Adresse *</Text>
        <TextInput style={styles.input} placeholder="Ex: Paris 11e" value={location} onChangeText={setLocation} placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>Prix par jour (€) *</Text>
        <TextInput style={styles.input} placeholder="Ex: 500" value={price} onChangeText={setPrice} keyboardType="number-pad" placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>Capacité maximale *</Text>
        <TextInput style={styles.input} placeholder="Ex: 100" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>Type de lieu *</Text>
        <View style={styles.grid}>
          {TYPES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
              <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.grid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]} placeholder="Décrivez votre lieu..." value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholderTextColor={COLORS.textLight} />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="add-circle" size={20} color={COLORS.white} />
          <Text style={styles.submitText}>Publier le lieu</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, gap: 10, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 4 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text },
  textarea: { height: 100, textAlignVertical: 'top' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitText: { fontSize: 17, fontWeight: '700', color: COLORS.white },
});
