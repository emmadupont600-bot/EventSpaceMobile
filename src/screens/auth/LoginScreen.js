import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Erreur', 'Remplissez tous les champs');
    const result = await login(email.trim(), password);
    if (!result.success) Alert.alert('Erreur', result.error);
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="location" size={40} color="#e94560" />
            </View>
            <Text style={styles.logoText}>EventSpace</Text>
            <Text style={styles.tagline}>Trouvez le lieu parfait</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Connexion</Text>

            <View style={styles.inputGroup}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Se connecter</Text>}
            </TouchableOpacity>

            <View style={styles.demo}>
              <Text style={styles.demoTitle}>Comptes démo :</Text>
              <TouchableOpacity onPress={() => { setEmail('user@demo.fr'); setPassword('demo1234'); }}>
                <Text style={styles.demoLink}>👤 Client : user@demo.fr / demo1234</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEmail('annonceur@demo.fr'); setPassword('demo5678'); }}>
                <Text style={styles.demoLink}>🏢 Annonceur : annonceur@demo.fr / demo5678</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
              <Text style={styles.linkText}>Pas encore de compte ? <Text style={styles.linkAccent}>S'inscrire</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(233,69,96,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline: { color: '#aaa', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 24, textAlign: 'center' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', paddingVertical: 14, fontSize: 15 },
  btn: { backgroundColor: '#e94560', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  demo: { marginTop: 20, padding: 14, backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)' },
  demoTitle: { color: '#e94560', fontWeight: '700', marginBottom: 8, fontSize: 13 },
  demoLink: { color: '#ccc', fontSize: 12, marginBottom: 4 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
  linkAccent: { color: '#e94560', fontWeight: '700' },
});
