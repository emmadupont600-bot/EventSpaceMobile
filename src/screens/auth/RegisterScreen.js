import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Erreur', 'Remplissez tous les champs');
    if (password.length < 6) return Alert.alert('Erreur', 'Mot de passe trop court (6 caractères min)');
    await register(name, email, password, role);
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>Créer un compte</Text>

            <View style={styles.roleRow}>
              <TouchableOpacity style={[styles.roleBtn, role === 'client' && styles.roleBtnActive]} onPress={() => setRole('client')}>
                <Ionicons name="person" size={20} color={role === 'client' ? '#fff' : '#aaa'} />
                <Text style={[styles.roleTxt, role === 'client' && styles.roleTxtActive]}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBtn, role === 'annonceur' && styles.roleBtnActive]} onPress={() => setRole('annonceur')}>
                <Ionicons name="business" size={20} color={role === 'annonceur' ? '#fff' : '#aaa'} />
                <Text style={[styles.roleTxt, role === 'annonceur' && styles.roleTxtActive]}>Annonceur</Text>
              </TouchableOpacity>
            </View>

            {[{ val: name, set: setName, placeholder: 'Nom complet', icon: 'person-outline' },
              { val: email, set: setEmail, placeholder: 'Email', icon: 'mail-outline', keyboard: 'email-address' },
              { val: password, set: setPassword, placeholder: 'Mot de passe', icon: 'lock-closed-outline', secure: true }]
              .map((f, i) => (
                <View key={i} style={styles.inputGroup}>
                  <Ionicons name={f.icon} size={20} color="#999" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#666"
                    value={f.val}
                    onChangeText={f.set}
                    keyboardType={f.keyboard || 'default'}
                    autoCapitalize="none"
                    secureTextEntry={!!f.secure}
                  />
                </View>
              ))}

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Créer le compte</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
              <Text style={styles.linkText}>Déjà un compte ? <Text style={styles.linkAccent}>Se connecter</Text></Text>
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
  back: { marginBottom: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 24, textAlign: 'center' },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  roleBtnActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  roleTxt: { color: '#aaa', fontWeight: '600' },
  roleTxtActive: { color: '#fff' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', paddingVertical: 14, fontSize: 15 },
  btn: { backgroundColor: '#e94560', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
  linkAccent: { color: '#e94560', fontWeight: '700' },
});
