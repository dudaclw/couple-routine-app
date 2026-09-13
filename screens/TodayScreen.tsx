import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { DateStrip } from '../components/DateStrip';
import { RoutineCard } from '../components/RoutineCard';
import { CommitmentRow } from '../components/CommitmentRow';
import { FabNewActivity } from '../components/FabNewActivity';
import { HeaderProfileButton } from '../components/HeaderButtons';
import { colors, fonts } from '../theme';
import { useCommitments, useCompletions, useProfiles, useRoutineItems } from '../hooks/useAppData';
import { completionFor, toggleRoutineCompletion } from '../lib/completions';
import { formatHeaderDate, isRoutineDueOn, toISODate } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function TodayScreen() {
  const { profile } = useAuth();
  const { rows: routineItems } = useRoutineItems();
  const { rows: commitments } = useCommitments();
  const { rows: completions } = useCompletions();
  const { rows: profiles } = useProfiles();

  const today = new Date();
  const todayISO = toISODate(today);

  const todayRoutines = useMemo(
    () => routineItems.filter((r) => r.active && isRoutineDueOn(r.recurrence, today)),
    [routineItems]
  );

  const relevantCommitments = useMemo(
    () =>
      commitments
        .filter((c) => c.due_date === todayISO || (c.due_date < todayISO && !c.completed))
        .sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [commitments, todayISO]
  );

  const nothingToday = todayRoutines.length === 0 && relevantCommitments.length === 0;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        label={formatHeaderDate(today)}
        title="Hoje"
        rightSlot={<HeaderProfileButton />}
        showBlob
      />
      <ScrollView contentContainerStyle={styles.content}>
        <DateStrip routineItems={routineItems} commitments={commitments} />

        {nothingToday ? (
          <Text style={styles.emptyState}>Nada pendente hoje.</Text>
        ) : (
          <>
            {todayRoutines.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercícios de hoje</Text>
                <View style={{ gap: 10 }}>
                  {todayRoutines.map((item) => {
                    const existing = completionFor(completions, item.id, todayISO);
                    return (
                      <RoutineCard
                        key={item.id}
                        item={item}
                        profiles={profiles}
                        checked={!!existing}
                        onToggle={() => toggleRoutineCompletion(item.id, todayISO, existing, profile!.id)}
                      />
                    );
                  })}
                </View>
              </View>
            )}

            {relevantCommitments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tarefas e compromissos</Text>
                <View style={{ gap: 10 }}>
                  {relevantCommitments.map((item) => (
                    <CommitmentRow
                      key={item.id}
                      item={item}
                      profiles={profiles}
                      onToggle={async () => {
                        await supabase.from('commitments').update({ completed: !item.completed }).eq('id', item.id);
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <FabNewActivity />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  section: {
    marginTop: 10,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.text,
  },
  emptyState: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 32,
    textAlign: 'center',
  },
});
