import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Store } from '../../utils/store';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Header from '../../components/Header';
import { colors, spacing, typography, radius } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('particulier');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const register = async () => {
    if (!form.firstName || !form.email || !form.password) {
      return Alert.alert('Erreur', 'Merci de remplir tous les champs obligatoires.');
    }
    setLoading(true);
    const users = await Store.getUsers();
    if (users.find(u => u.email === form.email.toLowerCase())) {
      Alert.alert('Erreur', 'Cet email est déjà utilisé.');
      setLoading(false);
      return;
    }
    const user = { ...form, id: Date.now(), role, email: form.email.toLowerCase() };
    users.push(user);
    await Store.saveUsers(users);
    await Store.setCurrentUser(user);
    navigation.replace('MainTabs', { user });
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Créer un compte" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.roleRow}>
          {['particulier', 'annonceur'].map(r => (
            <TouchableOpacity key={r} style={[styles.roleBtn, role === r && styles.roleBtnActive]} onPress={() => setRole(r)}>
              <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                {r === 'particulier' ? '👤 Particulier / Client' : '🏢 Annonceur / Propriétaire'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Prénom *" value={form.firstName} onChangeText={v => setF('firstName', v)} placeholder="Votre prénom" icon="person-outline" />
        <Input label="Nom *" value={form.lastName} onChangeText={v => setF('lastName', v)} placeholder="Votre nom" icon="person-outline" />
        <Input label="Email *" value={form.email} onChangeText={v => setF('email', v)} placeholder="votre@email.fr" keyboardType="email-address" autoCapitalize="none" icon="mail-outline" />
        <Input label="Téléphone" value={form.phone} onChangeText={v => setF('phone', v)} placeholder="06 00 00 00 00" keyboardType="phone-pad" icon="call-outline" />
        <Input label="Mot de passe *" value={form.password} onChangeText={v => setF('password', v)} placeholder="Choisir un mot de passe" secureTextEntry icon="lock-closed-outline" />
        <Button title="Créer mon compte" onPress={register} loading={loading} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  roleRow: { marginBottom: spacing.lg, gap: spacing.sm },
  roleBtn: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  roleBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleText: { fontSize: typography.body, fontWeight: '600', color: colors.mid },
  roleTextActive: { color: colors.primary },
});
