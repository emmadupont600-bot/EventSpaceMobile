import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Store } from '../../utils/store';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, typography, radius } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide';
    if (!password || password.length < 4) e.password = 'Mot de passe requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const login = async () => {
    if (!validate()) return;
    setLoading(true);
    const users = await Store.getUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase() && u.password === password);
    if (user) {
      await Store.setCurrentUser(user);
      navigation.replace('MainTabs', { user });
    } else {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect.\n\nDémo client : user@demo.fr / demo1234\nDémo annonceur : annonceur@demo.fr / demo5678');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logoWrap}>
        <Text style={styles.logo}>Event<Text style={styles.logoBlue}>Space</Text></Text>
        <Text style={styles.tagline}>Trouvez votre lieu idéal</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Connexion</Text>
        <Input label="Adresse email" value={email} onChangeText={setEmail} placeholder="votre@email.fr" keyboardType="email-address" autoCapitalize="none" icon="mail-outline" error={errors.email} />
        <Input label="Mot de passe" value={password} onChangeText={setPassword} placeholder="Votre mot de passe" secureTextEntry icon="lock-closed-outline" error={errors.password} />
        <Button title="Se connecter" onPress={login} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Comptes démo</Text>
        <Text style={styles.demoLine}>👤 Client : user@demo.fr / demo1234</Text>
        <Text style={styles.demoLine}>🏢 Annonceur : annonceur@demo.fr / demo5678</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkText}>Pas encore de compte ? <Text style={styles.linkBold}>Créer un compte</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: 80 },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 36, fontWeight: '900', color: colors.dark },
  logoBlue: { color: colors.primary },
  tagline: { fontSize: typography.body, color: colors.mid, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  title: { fontSize: typography.h2, fontWeight: '800', color: colors.dark, marginBottom: spacing.lg },
  demoBox: { backgroundColor: '#eff6ff', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  demoTitle: { fontSize: typography.small, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  demoLine: { fontSize: typography.small, color: colors.mid, marginBottom: 2 },
  link: { alignItems: 'center', paddingVertical: spacing.md },
  linkText: { fontSize: typography.body, color: colors.mid },
  linkBold: { color: colors.primary, fontWeight: '700' },
});
