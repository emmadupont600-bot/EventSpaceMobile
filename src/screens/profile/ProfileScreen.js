/**
 * ProfileScreen — profil complet client et annonceur.
 * Annonceur : édition nom, téléphone, IBAN (pour les virements), photo avatar URL.
 * Sauvegarde dans Supabase via Store.updateUser()
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabase';
import { colors, spacing, typography } from '../../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useApp();
  const insets = useSafeAreaInsets();
  const isAnnonceur = user?.role === 'annonceur';

  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name || '');
  const [phone, setPhone]     = useState(user?.phone || '');
  const [avatar, setAvatar]   = useState(user?.avatar || '');
  const [iban, setIban]       = useState(user?.iban || '');
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Champ requis', 'Le nom ne peut pas être vide.'); return; }
    setSaving(true);
    try {
      const changes = {
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
        ...(isAnnonceur && { iban: iban.trim() }),
      };
      const { data, error } = await supabase
        .from('users')
        .update(changes)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      const updated = { ...user, ...data };
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

  const C = colors;
  const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: isAnnonceur ? '#10B981' : C.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={[styles.roleBadge, isAnnonceur && styles.roleBadgeAnnonceur]}>
            <Text style={styles.roleBadgeText}>
              {isAnnonceur ? '🏠 Annonceur' : '👤 Client'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Infos personnelles */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Informations personnelles</Text>
            <TouchableOpacity onPress={() => { setEditing(!editing); }}>
              <Text style={styles.editBtn}>{editing ? 'Annuler' : '✏️ Modifier'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Votre nom" />
              <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="06 XX XX XX XX" keyboardType="phone-pad" />
              <Field
                label="Photo de profil (URL)"
                value={avatar} onChangeText={setAvatar}
                placeholder="https://..."
                autoCapitalize="none"
              />
              {isAnnonceur && (
                <Field
                  label="IBAN (pour recevoir vos paiements)"
                  value={iban} onChangeText={setIban}
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  autoCapitalize="characters"
                />
              )}
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
              {isAnnonceur && (
                <InfoRow
                  icon="card-outline"
                  label="IBAN"
                  value={user?.iban ? `${user.iban.slice(0, 8)}${'•'.repeat(10)}` : 'Non renseigné'}
                />
              )}
            </>
          )}
        </View>

        {/* Raccourcis annonceur */}
        {isAnnonceur && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mon activité</Text>
            <MenuItem
              icon="stats-chart-outline"
              label="Tableau de bord"
              onPress={() => navigation.navigate('AnnonceurTab')}
            />
            <MenuItem
              icon="home-outline"
              label="Mes lieux"
              onPress={() => navigation.navigate('AnnonceurTab', { tab: 'venues' })}
            />
            <MenuItem
              icon="calendar-outline"
              label="Demandes de réservation"
              onPress={() => navigation.navigate('AnnonceurTab', { tab: 'requests' })}
              last
            />
          </View>
        )}

        {/* Paiements (annonceur) */}
        {isAnnonceur && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💳 Paiements</Text>
            <View style={styles.ibanInfo}>
              <Ionicons name="information-circle-outline" size={18} color={C.primary} />
              <Text style={styles.ibanInfoText}>
                EventSpace prélève une commission de <Text style={{ fontWeight: '800' }}>12%</Text> sur chaque réservation confirmée. Le solde net vous est versé dans un délai de 3 jours ouvrés après la date de l'événement.
              </Text>
            </View>
          </View>
        )}

        {/* Compte */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compte</Text>
          <MenuItem icon="log-out-outline" label="Se déconnecter" onPress={handleLogout} danger last />
        </View>

        <Text style={styles.version}>EventSpace v1.0 · Supabase</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }) {
  return (
    <>
      <Text style={fStyles.label}>{label}</Text>
      <TextInput
        style={fStyles.input}
        placeholderTextColor={colors.light}
        autoCorrect={false}
        {...props}
      />
    </>
  );
}
const fStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: colors.mid, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.bg, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    fontSize: typography.body, color: colors.dark,
  },
});

function InfoRow({ icon, label, value }) {
  return (
    <View style={iStyles.row}>
      <Ionicons name={icon} size={18} color={colors.mid} />
      <View style={{ flex: 1 }}>
        <Text style={iStyles.label}>{label}</Text>
        <Text style={iStyles.value}>{value}</Text>
      </View>
    </View>
  );
}
const iStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 11, color: colors.light, fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '600', color: colors.dark },
});

function MenuItem({ icon, label, onPress, danger, last }) {
  return (
    <TouchableOpacity
      style={[mStyles.item, !last && mStyles.itemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={danger ? '#EF4444' : colors.primary} />
      <Text style={[mStyles.label, danger && mStyles.danger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={danger ? '#EF4444' : colors.mid} />
    </TouchableOpacity>
  );
}
const mStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.dark },
  danger: { color: '#EF4444' },
});

const C = colors;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: 8 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
  },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { fontSize: 34, fontWeight: '900', color: '#fff' },
  roleBadge: { backgroundColor: C.primaryLight || '#EEF2FF', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, marginTop: 4 },
  roleBadgeAnnonceur: { backgroundColor: '#D1FAE5' },
  roleBadgeText: { fontSize: 13, fontWeight: '700', color: C.dark },
  userName: { fontSize: 20, fontWeight: '900', color: C.dark, marginTop: 4 },
  userEmail: { fontSize: 13, color: C.mid },
  card: {
    backgroundColor: C.white, borderRadius: 16, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.dark },
  editBtn: { fontSize: 13, color: C.primary, fontWeight: '700' },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center', marginTop: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ibanInfo: {
    flexDirection: 'row', gap: 10, backgroundColor: C.bg,
    borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: C.border,
  },
  ibanInfoText: { flex: 1, fontSize: 13, color: C.mid, lineHeight: 19 },
  version: { textAlign: 'center', fontSize: 11, color: C.light, marginTop: 8, paddingBottom: 20 },
});
