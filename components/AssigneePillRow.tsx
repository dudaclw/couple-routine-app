import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AssigneeDot } from './AssigneeDot';
import { colors, fonts, radii } from '../theme';
import { Assignee, Profile } from '../lib/types';
import { BOTH_LABEL } from '../lib/profiles';

function selectedStyle(value: Assignee) {
  if (value === 'user_a') return { backgroundColor: colors.primaryTint, borderColor: colors.primary };
  if (value === 'user_b') return { backgroundColor: colors.secondaryTint, borderColor: colors.secondary };
  return { backgroundColor: colors.background, borderColor: colors.text };
}

export function AssigneePillRow({
  value,
  onChange,
  profiles,
}: {
  value: Assignee;
  onChange: (assignee: Assignee) => void;
  profiles: Profile[];
}) {
  const options: { value: Assignee; label: string }[] = [
    ...profiles.map((p) => ({ value: p.role as Assignee, label: p.display_name })),
    { value: 'both' as Assignee, label: BOTH_LABEL },
  ];

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.pill, active && selectedStyle(option.value)]}
            onPress={() => onChange(option.value)}
          >
            <AssigneeDot assignee={option.value} profiles={profiles} size={14} />
            <Text style={styles.text}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },
});
