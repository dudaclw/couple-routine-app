import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../theme';
import { WEEKDAY_LABELS, WEEKDAYS_SUN_FIRST } from '../lib/dates';

export function WeekdayChipsRow({ recurrence, style }: { recurrence: string[]; style?: ViewStyle }) {
  const isDaily = recurrence.includes('daily');
  return (
    <View style={[styles.row, style]}>
      {WEEKDAYS_SUN_FIRST.map((day) => {
        const active = isDaily || recurrence.includes(day);
        return (
          <View key={day} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{WEEKDAY_LABELS[day][0]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.sm - 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryTint,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
  },
});
