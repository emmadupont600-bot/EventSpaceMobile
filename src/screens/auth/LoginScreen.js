import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useApp();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Champs requis', 'Remplissez tous les champs'); return; }
    setLoading(true);
    const result = login(email.toLowerCase().trim(), password);
    setLoading(false);
    if (!result?.success) Alert.alert('Erreur de connexion', result?.error || 'Identifiants incorrects');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetters}>ES</Text>
          </View>
          <Text style={styles.appName}>EventSpace</Text>
          <Text style={styles.tagline}>Trouvez le lieu parfait pour votre événement</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Connexion</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="votre@email.fr"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                placeholderTextColor={COLORS.textLight}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnOutlineText}>Créer un compte</Text>
          </TouchableOpacity>

          {/* Demo accounts */}
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Comptes démo :</Text>
            <TouchableOpacity
              style={styles.demoCard}
              onPress={() => { setEmail('client@demo.fr'); setPassword('demo1234'); }}
            >
              <Text style={styles.demoIcon}>👤</Text>
              <View>
                <Text style={styles.demoRole}>Client</Text>
                <Text style={styles.demoCred}>client@demo.fr · demo1234</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoCard}
              onPress={() => { setEmail('annonceur@demo.fr'); setPassword('demo5678'); }}
            >
              <Text style={styles.demoIcon}>🏢</Text>
              <View>
                <Text style={styles.demoRole}>Annonceur</Text>
                <Text style={styles.demoCred}>annonceur@demo.fr · demo5678</Text>
              </View>
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
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  logoLetters: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  appName: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22 },
  form: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 0,
  },
  formTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 20, letterSpacing: -0.3 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, letterSpacing: 0.2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 13 },
  eyeBtn: { padding: 6 },
  eyeIcon: { fontSize: 16 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
  btnOutline: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 24,
  },
  btnOutlineText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  demo: { gap: 8 },
  demoTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoIcon: { fontSize: 22 },
  demoRole: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  demoCred: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
});
