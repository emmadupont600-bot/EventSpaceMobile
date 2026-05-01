import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Erreur', 'Remplissez tous les champs'); return; }
    setLoading(true);
    const result = login(email.toLowerCase().trim(), password);
    setLoading(false);
    if (!result.success) Alert.alert('Erreur', result.error);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ES</Text>
          </View>
          <Text style={styles.title}>EventSpace</Text>
          <Text style={styles.subtitle}>Trouvez le lieu parfait pour votre événement</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="votre@email.fr" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textLight} />
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={COLORS.textLight} />
          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>
          <View style={styles.divider}><View style={styles.line} /><Text style={styles.orText}>ou</Text><View style={styles.line} /></View>
          <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.btnOutlineText}>Créer un compte</Text>
          </TouchableOpacity>
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Comptes démo :</Text>
            <TouchableOpacity onPress={() => { setEmail('client@demo.fr'); setPassword('demo1234'); }}>
              <Text style={styles.demoBtn}>👤 Client : client@demo.fr / demo1234</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEmail('annonceur@demo.fr'); setPassword('demo5678'); }}>
              <Text style={styles.demoBtn}>🏢 Annonceur : annonceur@demo.fr / demo5678</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', paddingVertical: 40 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  logoText: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { fontSize: 13, color: COLORS.textLight },
  btnOutline: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 14, padding: 18, alignItems: 'center' },
  btnOutlineText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  demo: { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 16, gap: 8 },
  demoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  demoBtn: { fontSize: 12, color: COLORS.primaryDark, paddingVertical: 4 },
});
