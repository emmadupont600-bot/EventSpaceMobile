/**
 * RegisterScreen — auth "Luxury Minimal" 2026.
 * Même direction artistique que LoginScreen : fond venue flouté + overlay,
 * inputs glass morphism, bouton blanc, validation inline (pas d'Alert),
 * lien switch vers Login avec underline subtil.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { spacing, radius } from '../../theme/tokens';
import PressableScale from '../../components/PressableScale';
import { hapticError, hapticSelection } from '../../utils/haptics';

const BG_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=70';

const ROLES = [
  { value: 'client', icon: 'person-outline', iconActive: 'person', label: 'Particulier' },
  { value: 'annonceur', icon: 'business-outline', iconActive: 'business', label: 'Annonceur' },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useApp();

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Remplissez tous les champs.'); hapticError(); return; }
    if (password.length < 6) { setError('Mot de passe trop court (6 caractères min).'); hapticError(); return; }
    setLoading(true);
    setError('');
    try {
      await register({ name, email: email.toLowerCase().trim(), password, role });
    } catch (err) {
      setError(err.message || 'Impossible de créer le compte');
      hapticError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Image source={{ uri: BG_IMAGE }} style={StyleSheet.absoluteFill} blurRadius={14} />
      <View style={styles.overlay} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez EventSpace gratuitement</Text>

          {/* Rôle */}
          <Text style={styles.label}>Je suis</Text>
          <View style={styles.roleRow}>
            {ROLES.map(r => {
              const active = role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleBtn, active && styles.roleBtnActive]}
                  onPress={() => { hapticSelection(); setRole(r.value); }}
                >
                  <Ionicons name={active ? r.iconActive : r.icon} size={20} color="#FFFFFF" />
                  <Text style={[styles.roleText, active && styles.roleTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Nom complet</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.7)" />
            <TextInput
              style={styles.input} placeholder="Jean Dupont" value={name} onChangeText={setName}
              placeholderTextColor="rgba(255,255,255,0.45)"
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.7)" />
            <TextInput
              style={styles.input} placeholder="votre@email.fr" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />
          </View>

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.7)" />
            <TextInput
              style={styles.input} placeholder="Minimum 6 caractères" value={password} onChangeText={setPassword}
              secureTextEntry placeholderTextColor="rgba(255,255,255,0.45)"
            />
          </View>

          {!!error && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color="#FFB4A4" />
              <Text style={styles.error}>{error}</Text>
            </View>
          )}

          <PressableScale
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            haptic="light"
            accessibilityLabel="Créer mon compte"
          >
            {loading
              ? <ActivityIndicator color="#1B1713" />
              : <Text style={styles.primaryBtnTxt}>Créer mon compte</Text>}
          </PressableScale>

          <PressableScale style={styles.loginLink} haptic="selection" onPress={() => navigation.goBack()}>
            <Text style={styles.loginText}>
              Déjà un compte ? <Text style={styles.loginTextBold}>Se connecter</Text>
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.10)';
const GLASS_BORDER = 'rgba(255,255,255,0.20)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#141210' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,18,16,0.55)' },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: 64, paddingBottom: 40 },
  back: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  title: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 30, color: '#FFFFFF', letterSpacing: -0.4,
  },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6, marginBottom: spacing.md },
  label: {
    fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.6, textTransform: 'uppercase',
    marginBottom: 8, marginTop: spacing.md,
  },
  roleRow: { flexDirection: 'row', gap: spacing.md },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: radius.md,
    backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER,
  },
  roleBtnActive: { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: 'rgba(255,255,255,0.55)' },
  roleText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  roleTextActive: { color: '#FFFFFF', fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: GLASS_BG,
    borderWidth: 1, borderColor: GLASS_BORDER,
    borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52,
  },
  input: { flex: 1, fontSize: 15, color: '#FFFFFF' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, justifyContent: 'center' },
  error: { color: '#FFB4A4', fontSize: 13, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#FFFFFF', borderRadius: radius.md, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl,
  },
  primaryBtnTxt: { fontSize: 16, fontWeight: '700', color: '#1B1713' },
  loginLink: { alignItems: 'center', paddingVertical: spacing.lg, marginTop: spacing.sm, minHeight: 44 },
  loginText: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  loginTextBold: {
    color: '#FFFFFF', fontWeight: '700',
    textDecorationLine: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)',
  },
});
