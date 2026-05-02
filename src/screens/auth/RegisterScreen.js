import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('client');
  const [loading, setLoading]   = useState(false);
  const { register } = useApp();

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Erreur', 'Remplissez tous les champs'); return; }
    if (password.length < 6) { Alert.alert('Erreur', 'Mot de passe trop court (6 caractères min)'); return; }
    setLoading(true);
    try {
      // AppContext.register attend un objet { name, email, password, role }
      await register({ name, email: email.toLowerCase().trim(), password, role });
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de créer le compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez EventSpace gratuitement</Text>

        <View style={styles.roleContainer}>
          <Text style={styles.label}>Je suis :</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity style={[styles.roleBtn, role === 'client' && styles.roleBtnActive]} onPress={() => setRole('client')}>
              <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>👤 Particulier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleBtn, role === 'annonceur' && styles.roleBtnActive]} onPress={() => setRole('annonceur')}>
              <Text style={[styles.roleText, role === 'annonceur' && styles.roleTextActive]}>🏢 Annonceur</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Nom complet</Text>
        <TextInput style={styles.input} placeholder="Jean Dupont" value={name} onChangeText={setName} placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="votre@email.fr" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput style={styles.input} placeholder="Minimum 6 caractères" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={COLORS.textLight} />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Créer mon compte</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 24, gap: 12 },
  back: { marginBottom: 8 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  roleContainer: { gap: 8 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: { flex: 1, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, padding: 14, alignItems: 'center' },
  roleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  roleText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  roleTextActive: { color: COLORS.primary },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
