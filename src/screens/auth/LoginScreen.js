/**
 * LoginScreen — auth "Luxury Minimal" 2026.
 * Image de fond venue floutée + overlay, logo centré blanc,
 * inputs glass morphism (fond semi-transparent, border blanche 20%),
 * bouton principal blanc avec texte foncé, séparateur "ou continuer avec",
 * lien switch Login/Register avec underline subtil.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Image,
  KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { spacing, radius } from '../../theme/tokens';
import PressableScale from '../../components/PressableScale';
import { hapticError } from '../../utils/haptics';

const BG_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=70';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (overrideEmail, overridePassword) => {
    const e = (overrideEmail ?? email).trim();
    const p = (overridePassword ?? password).trim();
    if (!e || !p) { setError('Veuillez remplir tous les champs.'); hapticError(); return; }
    setLoading(true);
    setError('');
    try {
      await login(e, p);
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
      hapticError();
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const creds = {
      client: { email: 'client@demo.com', password: 'demo123' },
      annonceur: { email: 'annonceur@demo.com', password: 'demo123' },
    }[role];
    handleLogin(creds.email, creds.password);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Fond : venue floutée + overlay sombre */}
      <Image source={{ uri: BG_IMAGE }} style={StyleSheet.absoluteFill} blurRadius={14} />
      <View style={styles.overlay} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo centré */}
          <View style={styles.logoSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="location" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.brand}>EventSpace</Text>
            <Text style={styles.tagline}>Des lieux d'exception pour vos événements</Text>
          </View>

          {/* Formulaire glass */}
          <View style={styles.form}>
            <Text style={styles.label}>Adresse email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="email@exemple.com"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity
                onPress={() => setShowPwd(v => !v)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            {!!error && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={15} color="#FFB4A4" />
                <Text style={styles.error}>{error}</Text>
              </View>
            )}

            {/* Bouton principal : blanc uni, texte foncé */}
            <PressableScale
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={() => handleLogin()}
              disabled={loading}
              haptic="light"
              accessibilityLabel="Se connecter"
            >
              {loading
                ? <ActivityIndicator color="#1B1713" />
                : <Text style={styles.primaryBtnTxt}>Se connecter</Text>}
            </PressableScale>
          </View>

          {/* Séparateur */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerTxt}>ou continuer avec</Text>
            <View style={styles.line} />
          </View>

          {/* Comptes démo */}
          <View style={styles.demoRow}>
            <PressableScale style={styles.demoBtn} onPress={() => quickLogin('client')} disabled={loading}>
              <Ionicons name="person-outline" size={18} color="#FFFFFF" />
              <Text style={styles.demoBtnText}>Démo client</Text>
            </PressableScale>
            <PressableScale style={styles.demoBtn} onPress={() => quickLogin('annonceur')} disabled={loading}>
              <Ionicons name="business-outline" size={18} color="#FFFFFF" />
              <Text style={styles.demoBtnText}>Démo annonceur</Text>
            </PressableScale>
          </View>

          {/* Switch Register */}
          <PressableScale style={styles.registerLink} haptic="selection" onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              Pas encore de compte ? <Text style={styles.registerTextBold}>Créer un compte</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: 40, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginTop: 64, marginBottom: spacing.xxl },
  logoBadge: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: GLASS_BG,
    borderWidth: 1, borderColor: GLASS_BORDER,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  brand: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 34, color: '#FFFFFF', letterSpacing: -0.5,
  },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  form: { width: '100%' },
  label: {
    fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.6, textTransform: 'uppercase',
    marginBottom: 8, marginTop: spacing.md,
  },
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  dividerTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' },
  demoRow: { flexDirection: 'row', gap: spacing.md },
  demoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 48, borderRadius: radius.md,
    backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER,
  },
  demoBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  registerLink: { alignItems: 'center', paddingVertical: spacing.lg, marginTop: spacing.md, minHeight: 44 },
  registerText: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  registerTextBold: {
    color: '#FFFFFF', fontWeight: '700',
    textDecorationLine: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)',
  },
});
