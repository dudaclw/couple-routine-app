import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { CommitmentRow } from '../components/CommitmentRow';
import { HeaderManageButton } from '../components/HeaderManageButton';
import { colors, fonts } from '../theme';
import { useCommitments, useProfiles } from '../hooks/useAppData';
import { supabase } from '../lib/supabase';
import { toISODate } from '../lib/dates';

type Filter = 'all' | 'open' | 'overdue';

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'open', label: 'Em aberto' },
  { value: 'overdue', label: 'Vencidas' },
];

export function TasksScreen() {
  const { rows: commitments } = useCommitments();
  const { rows: profiles } = useProfiles();
  const [filter, setFilter] = useState<Filter>('all');

  const todayISO = toISODate(new Date());

  const sorted = useMemo(
    () => [...commitments].sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [commitments]
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case 'open':
        return sorted.filter((c) => !c.completed && c.due_date >= todayISO);
      case 'overdue':
        return sorted.filter((c) => !c.completed && c.due_date < todayISO);
      default:
        return sorted;
    }
  }, [sorted, filter, todayISO]);

  return (
    <View style={styles.screen}>
      <ScreenHeader label="Prazos e compromissos" title="Tarefas" rightSlot={<HeaderManageButton />} />
      <View style={styles.filterWrap}>
        <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </View>
      <FlatList
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma tarefa ou compromisso por aqui.</Text>}
        renderItem={({ item }) => (
          <CommitmentRow
            item={item}
            profiles={profiles}
            onToggle={async () => {
              await supabase.from('commitments').update({ completed: !item.completed }).eq('id', item.id);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
