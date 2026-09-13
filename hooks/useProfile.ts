import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfiles } from './useAppData';
import { supabase } from '../lib/supabase';

export function useProfile() {
  const { profile, session, refreshProfile } = useAuth();
  const { rows: profiles } = useProfiles();

  const partner = useMemo(
    () => profiles.find((p) => p.id === profile?.partner_id) ?? null,
    [profiles, profile?.partner_id]
  );

  const uploadAvatar = useCallback(
    async (localUri: string, mimeType: string) => {
      if (!session) throw new Error('not signed in');
      const ext = mimeType.split('/')[1] ?? 'jpg';
      const path = `${session.user.id}/avatar.${ext}`;

      const response = await fetch(localUri);
      const arrayBuffer = await response.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arrayBuffer, { contentType: mimeType, upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      // Cache-bust so the new avatar shows immediately even though the path is stable.
      const avatar_url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', session.user.id);
      if (updateError) throw updateError;
      await refreshProfile();
    },
    [session, refreshProfile]
  );

  const saveMessage = useCallback(
    async (message: string) => {
      if (!session) throw new Error('not signed in');
      const { error } = await supabase
        .from('profiles')
        .update({ partner_message: message, partner_message_updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
      if (error) throw error;
      await refreshProfile();
    },
    [session, refreshProfile]
  );

  return { profile, partner, uploadAvatar, saveMessage };
}
