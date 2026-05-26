/**
 * ProfileScreen — full client/owner profile management.
 *
 * Owner: name, phone, IBAN, avatar (URL or pick-and-upload).
 * Client: name, phone, avatar.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { supabase } from '../../services/supabase';
import { pickAndUpload } from '../../services/uploadService';
import { COMMISSION_RATE } from '../../utils/stripeService';
import { colors, spacing, radius, shadow, gradients } from '../../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useApp();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isAnnonceur = user?.role === 'annonceur';

  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(user?.name || '');
  const [phone, setPhone]       = useState(user?.phone || '');
  const [avatar, setAvatar]     = useState(user?.avatar || '');
  const [iban, setIban]         = useState(user?.iban || '');
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Le nom ne peut pas être vide'); return; }
    setSaving(true);
    try {
      const changes = {
        name:   name.trim(),
        phone:  phone.trim(),
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
      setUser({ ...user, ...data });
      setEditing(false);
      toast.success('Profil mis à jour');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    setUploading(true);
    try {
      const url = await pickAndUpload(`avatars/${user.id}`);
      if (url) {
        setAvatar(url);
        toast.success('Photo importée');
      } else {
        toast.info('Sélection annulée ou indisponible');
      }
    } catch (e) {
      toast.error(e.message || 'Upload impossible');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={isAnnonceur ? gradients.success : gradients.primaryHi}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 20 }]}
        >
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={editing ? handlePickAvatar : null}
            activeOpacity={editing ? 0.85 : 1}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            {editing && (
              <View style={styles.avatarEditBadge}>
                {uploading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="camera" size={14} color="#fff" />}
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name={isAnnonceur ? 'business' : 'person'} size={12} color="#fff" />
            <Text style={styles.roleBadgeText}>{isAnnonceur ? 'Annonceur' : 'Particulier'}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Personal info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Informations personnelles</Text>
              <TouchableOpacity onPress={() => { setEditing(!editing); }} style={styles.editBtn}>
                <Ionicons name={editing ? 'close' : 'create-outline'} size={14} color={colors.primary} />
                <Text style={styles.editBtnTxt}>{editing ? 'Annuler' : 'Modifier'}</Text>
              </TouchableOpacity>
            </View>

            {editing ? (
              <>
                <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Votre nom" />
                <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="06 XX XX XX XX" keyboardType="phone-pad" />
                {isAnnonceur && (
                  <Field
                    label="IBAN (pour recevoir vos paiements)"
                    value={iban} onChangeText={setIban}
                    placeholder="FR76 XXXX XXXX XXXX XXXX"
                    autoCapitalize="characters"
                  />
                )}
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.9}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={styles.saveBtnText}>Enregistrer</Text>
                      </>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <InfoRow icon="person-outline" label="Nom" value={user?.name || '—'} />
                <InfoRow icon="mail-outline" label="Email" value={user?.email || '—'} />
                <InfoRow icon="call-outline" label="Téléphone" value={user?.phone || 'Non renseigné'} />
                {isAnnonceur && (
                  <InfoRow
                    icon="card-outline"
                    label="IBAN"
                    value={user?.iban ? `${user.iban.slice(0, 8)}${' •'.repeat(5)}` : 'Non renseigné'}
                  />
                )}
              </>
            )}
          </View>

          {/* Owner activity shortcuts */}
          {isAnnonceur && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mon activité</Text>
              <MenuItem
                icon="stats-chart-outline"
                label="Tableau de bord"
                onPress={() => navigation.navigate('Dashboard')}
              />
              <MenuItem
                icon="add-circle-outline"
                label="Ajouter un lieu"
                onPress={() => navigation.navigate('AddVenue')}
                last
              />
            </View>
          )}

          {/* Owner payment info */}
          {isAnnonceur && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💳 Paiements</Text>
              <View style={styles.ibanInfo}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.ibanInfoText}>
                  EventSpace prélève une commission de{' '}
                  <Text style={{ fontWeight: '900', color: colors.primary }}>{Math.round(COMMISSION_RATE * 100)}%</Text>{' '}
                  sur chaque réservation confirmée. Le solde net vous est versé dans un délai de 3 jours ouvrés après la date de l'événement.
                </Text>
              </View>
            </View>
          )}

          {/* Account */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Compte</Text>
            <MenuItem icon="shield-checkmark-outline" label="Confidentialité" onPress={() => {}} />
            <MenuItem icon="help-circle-outline" label="Aide & support" onPress={() => {}} />
            <MenuItem icon="information-circle-outline" label="À propos" onPress={() => {}} />
            <MenuItem icon="log-out-outline" label="Se déconnecter" onPress={handleLogout} danger last />
          </View>

          <Text style={styles.version}>EventSpace v1.1 · Made with ❤️</Text>
        </View>
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
        placeholderTextColor={colors.textLight}
        autoCorrect={false}
        {...props}
      />
    </>
  );
}
const fStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.text,
  },
});

function InfoRow({ icon, label, value }) {
  return (
    <View style={iStyles.row}>
      <View style={iStyles.iconBox}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={iStyles.label}>{label}</Text>
        <Text style={iStyles.value}>{value}</Text>
      </View>
    </View>
  );
}
const iStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, color: colors.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  value: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
});

function MenuItem({ icon, label, onPress, danger, last }) {
  return (
    <TouchableOpacity
      style={[mStyles.item, !last && mStyles.itemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[mStyles.iconBox, danger && { backgroundColor: colors.errorLight }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[mStyles.label, danger && mStyles.danger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={danger ? colors.error : colors.textLight} />
    </TouchableOpacity>
  );
}
const mStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  danger: { color: colors.error },
});

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  avatarWrap: { marginBottom: 14, position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.text,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  userName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    marginTop: 10,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  content: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight,
    ...shadow.xs,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: -0.2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.primaryLight },
  editBtnTxt: { fontSize: 12, color: colors.primary, fontWeight: '800' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, marginTop: spacing.md, ...shadow.primary,
  },
  saveBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  ibanInfo: {
    flexDirection: 'row', gap: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md, padding: spacing.md,
  },
  ibanInfoText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 },
  version: { textAlign: 'center', fontSize: 11, color: colors.textLight, marginTop: 8, paddingBottom: 20 },
});
