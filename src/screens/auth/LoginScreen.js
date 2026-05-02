import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../../context/AppContext';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (overrideEmail, overridePassword) => {
    const e = (overrideEmail  ?? email).trim();
    const p = (overridePassword ?? password).trim();
    if (!e || !p) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(e, p);
      // navigation gérée par AppContext via user state
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const creds = {
      client:    { email: 'client@demo.com',    password: 'demo123' },
      annonceur: { email: 'annonceur@demo.com', password: 'demo123' },
    }[role];
    handleLogin(creds.email, creds.password);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>📍</Text>
          <Text style={styles.title}>EventSpace</Text>
          <Text style={styles.subtitle}>Trouvez et louez le lieu parfait</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Adresse email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@exemple.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={() => handleLogin()}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Se connecter</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>— Connexion rapide (démo) —</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnClient]}
              onPress={() => quickLogin('client')}
              disabled={loading}
            >
              <Text style={styles.demoBtnText}>👤 Client</Text>
              <Text style={styles.demoBtnSub}>client@demo.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnAnnonceur]}
              onPress={() => quickLogin('annonceur')}
              disabled={loading}
            >
              <Text style={styles.demoBtnText}>🏠 Annonceur</Text>
              <Text style={styles.demoBtnSub}>annonceur@demo.com</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.demoHint}>Mot de passe des deux comptes : demo123</Text>
        </View>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Pas encore de compte ?{' '}
            <Text style={styles.registerTextBold}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40, backgroundColor: '#fff' },
  header: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  form: { marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a2e', backgroundColor: '#fafafa' },
  error: { color: '#e53935', fontSize: 13, marginTop: 10, textAlign: 'center' },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 22, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  demoSection: { marginBottom: 24 },
  demoTitle: { textAlign: 'center', color: '#aaa', fontSize: 12, marginBottom: 12, fontWeight: '500' },
  demoRow: { flexDirection: 'row', gap: 10 },
  demoBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', borderWidth: 1.5 },
  demoBtnClient: { borderColor: '#6C63FF', backgroundColor: '#f3f1ff' },
  demoBtnAnnonceur: { borderColor: '#00b894', backgroundColor: '#f0faf7' },
  demoBtnText: { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  demoBtnSub: { fontSize: 11, color: '#888', marginTop: 2 },
  demoHint: { textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 8 },
  registerLink: { alignItems: 'center', paddingVertical: 8 },
  registerText: { fontSize: 14, color: '#888' },
  registerTextBold: { color: '#6C63FF', fontWeight: '700' },
});
