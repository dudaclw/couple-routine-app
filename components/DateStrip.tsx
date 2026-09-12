import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme';
import { Commitment, RoutineItem } from '../lib/types';
import { dateWindow, isRoutineDueOn, isSameDay, toISODate, weekdayKey, WEEKDAY_LABELS } from '../lib/dates';

const DAYS_BEFORE = 3;
const DAYS_AFTER = 10;
const CELL_WIDTH = 48;
const CELL_GAP = 8;

type DayStatus = 'none' | 'pending' | 'overdue';

function dayStatus(day: Date, routineItems: RoutineItem[], commitments: Commitment[], todayISO: string): DayStatus {
  const iso = toISODate(day);
  const commitmentsThatDay = commitments.filter((c) => c.due_date === iso);
  const hasRoutineThatDay = routineItems.some((r) => r.active && isRoutineDueOn(r.recurrence, day));

  if (iso < todayISO && commitmentsThatDay.some((c) => !c.completed)) return 'overdue';
  if (commitmentsThatDay.length > 0 || hasRoutineThatDay) return 'pending';
  return 'none';
}

export function DateStrip({ routineItems, commitments }: { routineItems: RoutineItem[]; commitments: Commitment[] }) {
  const scrollRef = useRef<ScrollView>(null);
  const today = new Date();
  const todayISO = toISODate(today);
  const days = dateWindow(DAYS_BEFORE, DAYS_AFTER, today);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: DAYS_BEFORE * (CELL_WIDTH + CELL_GAP), animated: false });
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {days.map((day) => {
        const active = isSameDay(day, today);
        const status = dayStatus(day, routineItems, commitments, todayISO);
        return (
          <View key={toISODate(day)} style={[styles.cell, active && styles.cellActive]}>
            <Text style={[styles.weekday, active && styles.textActive]}>{WEEKDAY_LABELS[weekdayKey(day)]}</Text>
            <Text style={[styles.dayNumber, active && styles.textActive]}>{day.getDate()}</Text>
            <View
              style={[
                styles.dot,
                status === 'pending' && { backgroundColor: active ? '#FFFFFF' : colors.primary },
                status === 'overdue' && { backgroundColor: colors.alert },
                status === 'none' && styles.dotHidden,
              ]}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_WIDTH,
    height: 68,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cellActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekday: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  dayNumber: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.text,
  },
  textActive: {
    color: '#FFFFFF',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotHidden: {
    backgroundColor: 'transparent',
  },
});
