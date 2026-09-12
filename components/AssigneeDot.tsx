import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { Assignee, Profile, Role } from '../lib/types';
import { initialFor } from '../lib/profiles';

function roleColor(role: Role) {
  return role === 'user_a' ? colors.primary : colors.secondary;
}

function SingleDot({ role, profiles, size }: { role: Role; profiles: Profile[]; size: number }) {
  const profile = profiles.find((p) => p.role === role);
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: roleColor(role) }]}>
      <Text style={[styles.initial, { fontSize: size * 0.5 }]}>{profile ? initialFor(profile.display_name) : '?'}</Text>
    </View>
  );
}

export function AssigneeDot({
  assignee,
  profiles,
  size = 22,
}: {
  assignee: Assignee;
  profiles: Profile[];
  size?: number;
}) {
  if (assignee === 'both') {
    return (
      <View style={styles.pair}>
        <SingleDot role="user_a" profiles={profiles} size={size} />
        <SingleDot role="user_b" profiles={profiles} size={size} />
      </View>
    );
  }
  return <SingleDot role={assignee} profiles={profiles} size={size} />;
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: 4 },
  circle: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: fonts.bodyMedium, color: '#FFFFFF' },
});
