import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useProfiles } from '../hooks/useAppData';
import { translateDbError } from '../lib/errors';
import { nextAvailableRole } from '../lib/profiles';
import { supabase } from '../lib/supabase';
import { colors, fonts, radii } from '../theme';

export function ProfileSetupScreen() {
  const { session, refreshProfile } = useAuth();
  const { rows: profiles } = useProfiles();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Digite como você quer aparecer no app.');
      return;
    }
    const role = nextAvailableRole(profiles);
    if (!role) {
      setError('Os dois perfis já foram criados neste app.');
      return;
    }
    setError(null);
    setSaving(true);
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: session!.user.id, role, display_name: trimmed });
    setSaving(false);
    if (insertError) {
      setError(translateDbError(insertError.code));
      return;
    }
    await refreshProfile();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Como você quer aparecer no app?</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={30}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Continuar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: radii.xl,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: fonts.bodyMedium,
    color: '#FFFFFF',
    fontSize: 15,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.alert,
    fontSize: 13,
  },
});
