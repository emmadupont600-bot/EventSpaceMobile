import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { COLORS, colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useApp();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Remplissez tous les champs');
      return;
    }
    setLoading(true);
    const result = login(email.toLowerCase().trim(), password);
    setLoading(false);
    if (!result?.success) {
      Alert.alert('Erreur de connexion', result?.error || 'Identifiants incorrects');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─── */}
        <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetters}>ES</Text>
          </View>
          <Text style={styles.appName}>EventSpace</Text>
          <Text style={styles.tagline}>Trouvez le lieu parfait pour votre événement</Text>
        </View>

        {/* ─── Form card ─── */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Connexion</Text>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Adresse email</Text>
            <View style={[
              styles.inputWrap,
              focusedField === 'email' && styles.inputWrapFocused,
            ]}>
              <Feather name="mail" size={16} color={focusedField === 'email' ? COLORS.primary : COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="votre@email.fr"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={COLORS.textLight}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={[
              styles.inputWrap,
              focusedField === 'password' && styles.inputWrapFocused,
            ]}>
              <Feather name="lock" size={16} color={focusedField === 'password' ? COLORS.primary : COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                placeholderTextColor={COLORS.textLight}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                onPress={() => setShowPass(v => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showPass ? 'eye-off' : 'eye'}
                  size={17}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton login */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <Feather name="loader" size={16} color="#fff" />
                <Text style={styles.btnText}>Connexion...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Créer compte */}
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnOutlineText}>Créer un compte</Text>
          </TouchableOpacity>

          {/* Comptes démo */}
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Comptes démo</Text>
            <TouchableOpacity
              style={styles.demoCard}
              onPress={() => { setEmail('client@demo.fr'); setPassword('demo1234'); }}
              activeOpacity={0.8}
            >
              <View style={[styles.demoAvatarWrap, { backgroundColor: COLORS.primaryLight }]}>
                <Feather name="user" size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoRole}>Client</Text>
                <Text style={styles.demoCred}>client@demo.fr · demo1234</Text>
              </View>
              <Feather name="chevron-right" size={14} color={COLORS.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoCard}
              onPress={() => { setEmail('annonceur@demo.fr'); setPassword('demo5678'); }}
              activeOpacity={0.8}
            >
              <View style={[styles.demoAvatarWrap, { backgroundColor: '#FCE7F3' }]}>
                <Feather name="briefcase" size={16} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoRole}>Annonceur</Text>
                <Text style={styles.demoCred}>annonceur@demo.fr · demo5678</Text>
              </View>
              <Feather name="chevron-right" size={14} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1 },

  hero: {
    alignItems: 'center',
    paddingBottom: 44,
    paddingHorizontal: 24,
    gap: 10,
  },
  logoCircle: {
    width: 76, height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
  },
  logoLetters: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  appName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  tagline: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },

  form: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 22,
    letterSpacing: -0.3,
  },

  fieldWrap: { marginBottom: 16 },
  label: {
    fontSize: typography.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#FAFBFF',
  },
  inputIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: typography.body, color: COLORS.text, paddingVertical: 13 },
  eyeBtn: { padding: 4 },

  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: typography.small, color: COLORS.textLight, fontWeight: '500' },

  btnOutline: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 28,
  },
  btnOutlineText: { fontSize: typography.body, fontWeight: '700', color: COLORS.primary },

  demo: { gap: 8 },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoAvatarWrap: {
    width: 36, height: 36,
    borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  demoRole: { fontSize: typography.small, fontWeight: '700', color: COLORS.text },
  demoCred: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
});
