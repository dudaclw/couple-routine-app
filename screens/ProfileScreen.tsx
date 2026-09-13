import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '../components/ScreenHeader';
import { HeaderCloseButton } from '../components/HeaderButtons';
import { useProfile } from '../hooks/useProfile';
import { translateDbError } from '../lib/errors';
import { colors, fonts, radii } from '../theme';
import { RootStackParamList } from '../navigation/types';

function Avatar({ url, size = 96 }: { url: string | null | undefined; size?: number }) {
  if (url) {
    return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={size * 0.5} color={colors.textMuted} />
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, partner, uploadAvatar, saveMessage } = useProfile();

  const [message, setMessage] = useState(profile?.partner_message ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePickAvatar = async () => {
    setUploadError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setUploadError('Precisamos de acesso às suas fotos pra trocar o avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      await uploadAvatar(asset.uri, asset.mimeType ?? 'image/jpeg');
    } catch (err) {
      setUploadError(translateDbError((err as { code?: string }).code));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMessage = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await saveMessage(message.trim());
      setSaved(true);
    } catch (err) {
      setSaveError(translateDbError((err as { code?: string }).code));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader label="Sua conta" title="Perfil" rightSlot={<HeaderCloseButton />} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickAvatar} disabled={uploading}>
            <Avatar url={profile?.avatar_url} />
            <View style={styles.avatarEditBadge}>
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
          <Text style={styles.name}>{profile?.display_name}</Text>
          {uploadError && <Text style={styles.error}>{uploadError}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Recado pro seu companheiro</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              setSaved(false);
            }}
            placeholder="Deixe um recado fixo pra quem abrir o app depois de você"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
          />
          {saveError && <Text style={styles.error}>{saveError}</Text>}
          {saved && !saveError && <Text style={styles.success}>Recado salvo.</Text>}
          <Pressable style={styles.saveButton} onPress={handleSaveMessage} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
          </Pressable>
        </View>

        {partner && (
          <View style={styles.card}>
            <Text style={styles.label}>{partner.display_name}</Text>
            <View style={styles.partnerRow}>
              <Avatar url={partner.avatar_url} size={48} />
              <Text style={styles.partnerMessage}>
                {partner.partner_message || 'Ainda não deixou nenhum recado.'}
              </Text>
            </View>
          </View>
        )}

        <Pressable onPress={() => navigation.navigate('ManageHome')}>
          <Text style={styles.linkButton}>Gerenciar exercícios e tarefas</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.text,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: 16,
    gap: 10,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  messageInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: fonts.bodyMedium,
    color: '#FFFFFF',
    fontSize: 15,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
  },
  success: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.secondary,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerMessage: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  linkButton: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
});
