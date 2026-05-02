import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { Store } from '../../utils/store';
import { colors, spacing, typography } from '../../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useApp();
  const insets = useSafeAreaInsets();

  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name || '');
  const [phone, setPhone]     = useState(user?.phone || '');
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Champ requis', 'Le nom ne peut pas être vide.'); return; }
    setSaving(true);
    try {
      // Met à jour dans la liste des users ET dans la session courante
      const users = await Store.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      const updated = { ...user, name: name.trim(), phone: phone.trim() };
      if (idx >= 0) {
        users[idx] = updated;
        await Store.saveUsers(users);
      }
      await Store.setCurrentUser(updated);
      setUser(updated);
      setEditing(false);
      Alert.alert('✅ Profil mis à jour', 'Vos informations ont bien été enregistrées.');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const handleResetDemo = () => {
    Alert.alert(
      '🗑️ Réinitialiser les données',
      'Efface toutes les données locales et recharge les données de démonstration au prochain lancement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser', style: 'destructive',
          onPress: async () => {
            await Store.resetDemo();
            await logout();
          },
        },
      ]
    );
  };

  const C = colors;
  const isAnnonceur = user?.role === 'annonceur';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: isAnnonceur ? '#10B981' : C.primary }]}>
            <Text style={styles.avatarText}>
              {(user?.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={[styles.roleBadge, isAnnonceur && styles.roleBadgeAnnonceur]}>
            <Text style={styles.roleBadgeText}>
              {isAnnonceur ? '🏠 Annonceur' : '👤 Client'}
            </Text>
          </View>
        </View>

        {/* Infos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Informations personnelles</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={styles.editBtn}>{editing ? 'Annuler' : '✏️ Modifier'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={name} onChangeText={setName}
                placeholder="Votre nom"
                placeholderTextColor={C.light}
              />
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={phone} onChangeText={setPhone}
                placeholder="06 XX XX XX XX"
                placeholderTextColor={C.light}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave} disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>💾 Enregistrer</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <InfoRow icon="person-outline" label="Nom" value={user?.name || '-'} />
              <InfoRow icon="mail-outline" label="Email" value={user?.email || '-'} />
              <InfoRow icon="call-outline" label="Téléphone" value={user?.phone || 'Non renseigné'} />
            </>
          )}
        </View>

        {/* Raccourcis annonceur */}
        {isAnnonceur && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mon activité</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AnnonceurTab')}>
              <Ionicons name="stats-chart-outline" size={20} color={C.primary} />
              <Text style={styles.menuItemText}>Tableau de bord</Text>
              <Ionicons name="chevron-forward" size={16} color={C.mid} />
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compte</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleResetDemo}>
            <Ionicons name="refresh-outline" size={20} color={C.mid} />
            <Text style={[styles.menuItemText, { color: C.mid }]}>Réinitialiser les données démo</Text>
            <Ionicons name="chevron-forward" size={16} color={C.mid} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Se déconnecter</Text>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>EventSpace v1.0.0 · Données locales (démo)</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={colors.mid} />
      <View style={{ flex: 1 }}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}
const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 11, color: colors.light, fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '600', color: colors.dark },
});

const C = colors;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: 12 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  roleBadge: { backgroundColor: C.primaryLight || '#EEF2FF', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999 },
  roleBadgeAnnonceur: { backgroundColor: '#D1FAE5' },
  roleBadgeText: { fontSize: 13, fontWeight: '700', color: C.dark },
  card: {
    backgroundColor: C.white, borderRadius: 16, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.dark },
  editBtn: { fontSize: 13, color: C.primary, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '700', color: C.mid, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: C.bg, borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    fontSize: typography.body, color: C.dark,
  },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center', marginTop: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  menuItemDanger: { borderBottomWidth: 0 },
  menuItemText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.dark },
  version: { textAlign: 'center', fontSize: 11, color: C.light, marginTop: 8, paddingBottom: 20 },
});
