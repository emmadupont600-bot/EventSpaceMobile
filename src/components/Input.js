import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, typography, spacing } from '../theme/colors';

export default function Input({ label, error, secureTextEntry, icon, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={18} color={colors.mid} style={styles.icon} />}
        <TextInput
          style={[styles.input, icon && { paddingLeft: 0 }]}
          placeholderTextColor={colors.light}
          secureTextEntry={secureTextEntry && !show}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeBtn}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mid} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: typography.small, fontWeight: '600', color: colors.mid, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.error },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: typography.body,
    color: colors.dark,
  },
  eyeBtn: { padding: spacing.xs },
  errorText: { fontSize: typography.tiny, color: colors.error, marginTop: 4 },
});
