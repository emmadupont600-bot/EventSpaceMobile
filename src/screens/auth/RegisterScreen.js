import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { colors, spacing, radius, shadow, gradients } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]         = useState('client');
  const [loading, setLoading]   = useState(false);
  const { register } = useApp();
  const toast = useToast();

  const passwordStrong = password.length >= 6;
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const nameValid = name.trim().length >= 2;
  const canSubmit = passwordStrong && emailValid && nameValid && !loading;

  const handleRegister = async () => {
    if (!nameValid)     return toast.error('Indiquez votre nom');
    if (!emailValid)    return toast.error('Email invalide');
    if (!passwordStrong) return toast.error('Mot de passe trop court (6 caractères min)');
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.toLowerCase().trim(), password, role });
      toast.success('Compte créé avec succès');
    } catch (err) {
      toast.error(err.message || 'Impossible de créer le compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez EventSpace gratuitement</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Je suis :</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'client' && styles.roleBtnActive]}
                onPress={() => setRole('client')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIcon, role === 'client' && { backgroundColor: colors.primary }]}>
                  <Ionicons name="person" size={20} color={role === 'client' ? '#fff' : colors.primary} />
                </View>
                <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>Particulier</Text>
                <Text style={styles.roleSub}>Je cherche un lieu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, role === 'annonceur' && styles.roleBtnActive]}
                onPress={() => setRole('annonceur')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIcon, role === 'annonceur' && { backgroundColor: colors.success }]}>
                  <Ionicons name="business" size={20} color={role === 'annonceur' ? '#fff' : colors.success} />
                </View>
                <Text style={[styles.roleText, role === 'annonceur' && styles.roleTextActive]}>Annonceur</Text>
                <Text style={styles.roleSub}>Je propose mon lieu</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
              />
              {nameValid && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
            </View>

            <View style={styles.field}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailValid && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
            </View>

            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe (6+ caractères)"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.strengthRow}>
              {[1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor: password.length >= i * 3
                        ? (password.length >= 9 ? colors.success : password.length >= 6 ? colors.warning : colors.error)
                        : colors.borderLight,
                    },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btn, !canSubmit && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={!canSubmit}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={canSubmit ? gradients.primary : [colors.borderDark, colors.borderDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.btnText}>Créer mon compte</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.legal}>
              En créant votre compte, vous acceptez nos conditions d'utilisation.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  scroll: { flexGrow: 1, padding: spacing.xl, paddingTop: 60 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  header: { marginTop: spacing.lg, marginBottom: spacing.lg },
  title: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, ...shadow.lg },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.lg },
  roleBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.md, alignItems: 'center',
    backgroundColor: colors.background,
  },
  roleBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  roleText: { fontSize: 14, fontWeight: '700', color: colors.text },
  roleTextActive: { color: colors.primary },
  roleSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 4,
    marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.border,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  strengthRow: { flexDirection: 'row', gap: 4, marginBottom: spacing.lg, marginTop: 2 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  btn: { borderRadius: radius.md, overflow: 'hidden', ...shadow.primary },
  btnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15,
  },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  legal: { fontSize: 11, color: colors.textLight, textAlign: 'center', marginTop: 14 },
});
