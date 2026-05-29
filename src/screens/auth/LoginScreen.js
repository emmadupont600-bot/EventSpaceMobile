import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors, spacing, radius, typography } from '../../theme/colors';
import Button from '../../components/Button';
import PressableScale from '../../components/PressableScale';
import { hapticError } from '../../utils/haptics';

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9', '#5B21B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.logoBadge}>
              <Ionicons name="location" size={30} color="#fff" />
            </View>
            <Text style={styles.brand}>EventSpace</Text>
            <Text style={styles.tagline}>Trouvez et louez le lieu parfait</Text>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.welcome}>Bon retour 👋</Text>
            <Text style={styles.welcomeSub}>Connectez-vous pour continuer</Text>

            <Text style={styles.label}>Adresse email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.mid} />
              <TextInput
                style={styles.input}
                placeholder="email@exemple.com"
                placeholderTextColor={colors.light}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mid} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
              />
              <PressableScale haptic="selection" onPress={() => setShowPwd(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mid} />
              </PressableScale>
            </View>

            {!!error && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={15} color={colors.error} />
                <Text style={styles.error}>{error}</Text>
              </View>
            )}

            <Button
              title="Se connecter"
              onPress={() => handleLogin()}
              loading={loading}
              size="lg"
              style={{ marginTop: spacing.lg }}
            />
          </View>

          <View style={styles.demoSection}>
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.demoTitle}>Connexion rapide (démo)</Text>
              <View style={styles.line} />
            </View>
            <View style={styles.demoRow}>
              <PressableScale style={[styles.demoBtn, styles.demoBtnClient]} onPress={() => quickLogin('client')} disabled={loading}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
                <Text style={styles.demoBtnText}>Client</Text>
                <Text style={styles.demoBtnSub}>client@demo.com</Text>
              </PressableScale>

              <PressableScale style={[styles.demoBtn, styles.demoBtnAnnonceur]} onPress={() => quickLogin('annonceur')} disabled={loading}>
                <Ionicons name="business-outline" size={20} color={colors.success} />
                <Text style={styles.demoBtnText}>Annonceur</Text>
                <Text style={styles.demoBtnSub}>annonceur@demo.com</Text>
              </PressableScale>
            </View>
            <Text style={styles.demoHint}>Mot de passe des deux comptes : demo123</Text>
          </View>

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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  hero: {
    alignItems: 'center', paddingTop: 80, paddingBottom: 48,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  logoBadge: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  brand: { fontSize: typography.display, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg, marginTop: -24,
    borderRadius: radius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10, shadowRadius: 24, elevation: 6,
  },
  welcome: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, letterSpacing: -0.5 },
  welcomeSub: { fontSize: typography.small, color: colors.mid, marginTop: 3, marginBottom: spacing.lg },
  label: { fontSize: typography.small, fontWeight: '700', color: colors.dark, marginBottom: 7, marginTop: spacing.md },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, backgroundColor: colors.surfaceSecondary,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: typography.body, color: colors.dark },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, justifyContent: 'center' },
  error: { color: colors.error, fontSize: typography.small, fontWeight: '600' },
  demoSection: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  demoTitle: { color: colors.mid, fontSize: typography.tiny, fontWeight: '600' },
  demoRow: { flexDirection: 'row', gap: spacing.md },
  demoBtn: {
    flex: 1, borderRadius: radius.lg, paddingVertical: spacing.lg, paddingHorizontal: spacing.md,
    alignItems: 'center', borderWidth: 1.5, gap: 4, backgroundColor: colors.surface,
  },
  demoBtnClient: { borderColor: colors.primary },
  demoBtnAnnonceur: { borderColor: colors.success },
  demoBtnText: { fontSize: typography.body, fontWeight: '800', color: colors.dark, marginTop: 4 },
  demoBtnSub: { fontSize: typography.tiny, color: colors.mid },
  demoHint: { textAlign: 'center', fontSize: typography.tiny, color: colors.light, marginTop: spacing.md },
  registerLink: { alignItems: 'center', paddingVertical: spacing.lg, marginTop: spacing.sm },
  registerText: { fontSize: typography.small, color: colors.mid },
  registerTextBold: { color: colors.primary, fontWeight: '800' },
});
