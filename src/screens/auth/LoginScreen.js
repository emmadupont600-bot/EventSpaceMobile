import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { colors, spacing, radius, shadow, gradients } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async (overrideEmail, overridePassword) => {
    const e = (overrideEmail  ?? email).trim();
    const p = (overridePassword ?? password).trim();
    if (!e || !p) {
      setError('Veuillez remplir tous les champs.');
      triggerShake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(e, p);
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const creds = role === 'client'
      ? { email: 'client@demo.com',    password: 'demo123' }
      : { email: 'annonceur@demo.com', password: 'demo123' };
    setEmail(creds.email);
    setPassword(creds.password);
    handleLogin(creds.email, creds.password);
  };

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🏛️</Text>
            </View>
            <Text style={styles.title}>EventSpace</Text>
            <Text style={styles.subtitle}>Trouvez le lieu parfait pour vos événements</Text>
          </View>

          <Animated.View style={[styles.card, { transform: [{ translateX: shakeX }] }]}>
            <Text style={styles.cardTitle}>Bon retour 👋</Text>
            <Text style={styles.cardSubtitle}>Connectez-vous pour continuer</Text>

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
            </View>

            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {!!error && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={() => handleLogin()}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.btnText}>Se connecter</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Connexion rapide démo</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoRow}>
            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnClient]}
              onPress={() => quickLogin('client')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <View style={[styles.demoIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <Text style={styles.demoLabel}>Client</Text>
              <Text style={styles.demoSub}>client@demo.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnHost]}
              onPress={() => quickLogin('annonceur')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <View style={[styles.demoIcon, { backgroundColor: colors.successLight }]}>
                <Ionicons name="business" size={20} color={colors.success} />
              </View>
              <Text style={styles.demoLabel}>Annonceur</Text>
              <Text style={styles.demoSub}>annonceur@demo.com</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerText}>
              Pas encore de compte ?{' '}
              <Text style={styles.registerTextBold}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 320,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 70,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadow.md,
  },
  logoEmoji: { fontSize: 38 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.errorLight,
    borderRadius: radius.sm,
    padding: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600', flex: 1 },
  btn: {
    marginTop: 12,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.primary,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.xs,
  },
  demoBtnClient: { borderColor: colors.primarySoft },
  demoBtnHost: { borderColor: '#A7F3D0' },
  demoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  demoLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  demoSub: { fontSize: 11, color: colors.textSecondary },
  registerLink: { alignItems: 'center', paddingVertical: spacing.sm },
  registerText: { fontSize: 14, color: colors.textSecondary },
  registerTextBold: { color: colors.primary, fontWeight: '800' },
});
