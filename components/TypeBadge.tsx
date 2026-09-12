import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme';
import { CommitmentType } from '../lib/types';

export const TYPE_LABELS: Record<CommitmentType, string> = {
  task: 'Tarefa',
  exam: 'Prova',
  assignment: 'Trabalho',
  appointment: 'Compromisso',
};

export function TypeBadge({ type }: { type: CommitmentType }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{TYPE_LABELS[type]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
});
