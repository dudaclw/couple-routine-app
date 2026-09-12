import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { AssigneeDot } from './AssigneeDot';
import { CheckToggle } from './CheckToggle';
import { TypeBadge } from './TypeBadge';
import { DatePill } from './DatePill';
import { colors, fonts } from '../theme';
import { Commitment, Profile } from '../lib/types';
import { toISODate } from '../lib/dates';

export function CommitmentRow({
  item,
  profiles,
  onToggle,
}: {
  item: Commitment;
  profiles: Profile[];
  onToggle: () => void;
}) {
  const isOverdue = !item.completed && item.due_date < toISODate(new Date());

  return (
    <Card style={isOverdue && styles.overdueCard}>
      <View style={styles.topRow}>
        <CheckToggle checked={item.completed} onToggle={onToggle} />
        <Text style={[styles.title, item.completed && styles.titleDone]} numberOfLines={2}>
          {item.title}
        </Text>
        <AssigneeDot assignee={item.assigned_to} profiles={profiles} />
      </View>
      <View style={styles.tagsRow}>
        <TypeBadge type={item.type} />
        <DatePill dueDate={item.due_date} overdue={isOverdue} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.alert,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  titleDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginLeft: 38,
  },
});
