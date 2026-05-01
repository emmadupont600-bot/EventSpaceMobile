import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Mariage', 'Séminaire', 'Soirée', 'Conférence', 'Anniversaire', 'Autre'];
const EQUIPEMENTS_OPTS = ['Parking', 'Wi-Fi', 'Cuisine', 'Sonorisation', 'Climatisation', 'Scène', 'Bar', 'Terrasse', 'Piscine', 'Projecteur'];

export default function AjouterLieuScreen({ navigation }) {
  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [prix, setPrix] = useState('');
  const [capacite, setCapacite] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('');
  const [equipements, setEquipements] = useState([]);
  const [disponible, setDisponible] = useState(true);

  const toggleEquip = (e) => setEquipements(eq => eq.includes(e) ? eq.filter(x => x !== e) : [...eq, e]);

  const handlePublier = () => {
    if (!nom || !ville || !prix || !capacite || !categorie) {
      Alert.alert('Champs manquants', 'Remplissez tous les champs obligatoires (*)'); return;
    }
    Alert.alert(
      '✅ Lieu publié !',
      `"${nom}" est maintenant visible sur EventSpace.`,
      [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publier un lieu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Informations générales</Text>

        <Text style={styles.label}>Nom du lieu *</Text>
        <TextInput style={styles.input} placeholder="Ex: Salle des Fêtes" placeholderTextColor="#666" value={nom} onChangeText={setNom} />

        <Text style={styles.label}>Ville *</Text>
        <TextInput style={styles.input} placeholder="Ex: Paris" placeholderTextColor="#666" value={ville} onChangeText={setVille} />

        <Text style={styles.label}>Adresse complète</Text>
        <TextInput style={styles.input} placeholder="Ex: 12 Rue de la Paix, 75001" placeholderTextColor="#666" value={adresse} onChangeText={setAdresse} />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Prix/jour (€) *</Text>
            <TextInput style={styles.input} placeholder="500" placeholderTextColor="#666" value={prix} onChangeText={setPrix} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Capacité *</Text>
            <TextInput style={styles.input} placeholder="100" placeholderTextColor="#666" value={capacite} onChangeText={setCapacite} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Catégorie *</Text>
        <View style={styles.grid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, categorie === c && styles.chipActive]} onPress={() => setCategorie(c)}>
              <Text style={[styles.chipTxt, categorie === c && styles.chipTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Décrivez votre lieu, l'ambiance, les points forts..."
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
        />

        <Text style={styles.sectionTitle}>Équipements disponibles</Text>
        <View style={styles.grid}>
          {EQUIPEMENTS_OPTS.map(e => (
            <TouchableOpacity key={e} style={[styles.chip, equipements.includes(e) && styles.chipActive]} onPress={() => toggleEquip(e)}>
              <Text style={[styles.chipTxt, equipements.includes(e) && styles.chipTxtActive]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Lieu disponible à la réservation</Text>
            <Text style={styles.switchSub}>Visible et réservable par les clients</Text>
          </View>
          <Switch value={disponible} onValueChange={setDisponible} trackColor={{ false: '#444', true: '#e94560' }} thumbColor="#fff" />
        </View>

        <TouchableOpacity style={styles.publishBtn} onPress={handlePublier}>
          <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
          <Text style={styles.publishTxt}>Publier le lieu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  textarea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  chipTxt: { color: '#aaa', fontSize: 13 },
  chipTxtActive: { color: '#fff', fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginTop: 8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  switchLabel: { color: '#fff', fontWeight: '600', fontSize: 14 },
  switchSub: { color: '#aaa', fontSize: 12, marginTop: 2 },
  publishBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#e94560', borderRadius: 14, paddingVertical: 16, shadowColor: '#e94560', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  publishTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
