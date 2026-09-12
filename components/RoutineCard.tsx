import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { AssigneeDot } from './AssigneeDot';
import { CheckToggle } from './CheckToggle';
import { WeekdayChipsRow } from './WeekdayChipsRow';
import { colors, fonts } from '../theme';
import { Profile, RoutineItem } from '../lib/types';

export function RoutineCard({
  item,
  profiles,
  checked,
  onToggle,
  showRecurrenceChips = false,
}: {
  item: RoutineItem;
  profiles: Profile[];
  checked: boolean;
  onToggle: () => void;
  showRecurrenceChips?: boolean;
}) {
  return (
    <Card>
      <View style={styles.topRow}>
        <CheckToggle checked={checked} onToggle={onToggle} />
        <Text style={[styles.title, checked && styles.titleDone]} numberOfLines={2}>
          {item.title}
        </Text>
        <AssigneeDot assignee={item.assigned_to} profiles={profiles} />
      </View>
      {showRecurrenceChips && <WeekdayChipsRow recurrence={item.recurrence} style={styles.chips} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  titleDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  chips: {
    marginTop: 12,
  },
});
