import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme';
import { formatShortDate } from '../lib/dates';

export function DatePill({ dueDate, overdue }: { dueDate: string; overdue: boolean }) {
  return (
    <View style={[styles.badge, overdue && styles.badgeOverdue]}>
      <Text style={[styles.text, overdue && styles.textOverdue]}>
        {overdue ? `venceu ${formatShortDate(dueDate)}` : formatShortDate(dueDate)}
      </Text>
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
  badgeOverdue: {
    backgroundColor: colors.alert,
    borderColor: colors.alert,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  textOverdue: {
    color: '#FFFFFF',
  },
});
