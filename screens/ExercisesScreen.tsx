import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { RoutineCard } from '../components/RoutineCard';
import { FabNewActivity } from '../components/FabNewActivity';
import { HeaderProfileButton } from '../components/HeaderButtons';
import { colors, fonts } from '../theme';
import { useCompletions, useProfiles, useRoutineItems } from '../hooks/useAppData';
import { completionFor, toggleRoutineCompletion } from '../lib/completions';
import { toISODate } from '../lib/dates';
import { useAuth } from '../contexts/AuthContext';

export function ExercisesScreen() {
  const { profile } = useAuth();
  const { rows: routineItems } = useRoutineItems();
  const { rows: completions } = useCompletions();
  const { rows: profiles } = useProfiles();

  const todayISO = toISODate(new Date());
  const activeItems = useMemo(() => routineItems.filter((r) => r.active), [routineItems]);

  return (
    <View style={styles.screen}>
      <ScreenHeader label="Rotina da semana" title="Exercícios" rightSlot={<HeaderProfileButton />} />
      <FlatList
        contentContainerStyle={styles.content}
        data={activeItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum exercício cadastrado.</Text>}
        renderItem={({ item }) => {
          const existing = completionFor(completions, item.id, todayISO);
          return (
            <RoutineCard
              item={item}
              profiles={profiles}
              checked={!!existing}
              onToggle={() => toggleRoutineCompletion(item.id, todayISO, existing, profile!.id)}
              showRecurrenceChips
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
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
    padding: 16,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
