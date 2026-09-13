import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { AssigneeDot } from '../components/AssigneeDot';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { HeaderCloseButton } from '../components/HeaderButtons';
import { colors, fonts, radii } from '../theme';
import { useCommitments, useProfiles, useRoutineItems } from '../hooks/useAppData';
import { supabase } from '../lib/supabase';
import { formatShortDate, WEEKDAY_LABELS } from '../lib/dates';
import { RootStackParamList } from '../navigation/types';
import { RoutineItem } from '../lib/types';

type Segment = 'routines' | 'commitments';

const SEGMENT_OPTIONS: { value: Segment; label: string }[] = [
  { value: 'routines', label: 'Exercícios' },
  { value: 'commitments', label: 'Tarefas' },
];

async function setRoutineActive(item: RoutineItem, active: boolean) {
  await supabase.from('routine_items').update({ active }).eq('id', item.id);
}

function confirmDeactivate(item: RoutineItem) {
  if (item.active) {
    Alert.alert('Desativar exercício', `Desativar "${item.title}"? Isso não apaga o histórico já registrado.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desativar', style: 'destructive', onPress: () => setRoutineActive(item, false) },
    ]);
  } else {
    setRoutineActive(item, true);
  }
}

export function ManageHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [segment, setSegment] = useState<Segment>('routines');
  const { rows: routineItems } = useRoutineItems();
  const { rows: commitments } = useCommitments();
  const { rows: profiles } = useProfiles();

  const sortedRoutines = [...routineItems].sort((a, b) => a.title.localeCompare(b.title));
  const sortedCommitments = [...commitments].sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <View style={styles.screen}>
      <ScreenHeader label="Editar exercícios e tarefas" title="Gerenciar" rightSlot={<HeaderCloseButton />} />

      <View style={styles.body}>
        <SegmentedControl options={SEGMENT_OPTIONS} value={segment} onChange={setSegment} />

        <Pressable
          style={styles.addButton}
          onPress={() =>
            segment === 'routines' ? navigation.navigate('RoutineForm', {}) : navigation.navigate('CommitmentForm', {})
          }
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{segment === 'routines' ? 'Novo exercício' : 'Nova tarefa'}</Text>
        </Pressable>

        {segment === 'routines' ? (
          <FlatList
            contentContainerStyle={styles.list}
            data={sortedRoutines}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum exercício cadastrado.</Text>}
            renderItem={({ item }) => {
              const recurrenceLabel = item.recurrence.includes('daily')
                ? 'Diário'
                : item.recurrence.map((k) => WEEKDAY_LABELS[k as keyof typeof WEEKDAY_LABELS]).join(' · ');
              return (
                <Card style={styles.row}>
                  <AssigneeDot assignee={item.assigned_to} profiles={profiles} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>
                      {recurrenceLabel} · {item.active ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                  <Pressable onPress={() => navigation.navigate('RoutineForm', { id: item.id })}>
                    <Text style={styles.linkAction}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDeactivate(item)}>
                    <Text style={styles.linkAction}>{item.active ? 'Desativar' : 'Ativar'}</Text>
                  </Pressable>
                </Card>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        ) : (
          <FlatList
            contentContainerStyle={styles.list}
            data={sortedCommitments}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.empty}>Nenhuma tarefa cadastrada.</Text>}
            renderItem={({ item }) => (
              <Card style={styles.row}>
                <AssigneeDot assignee={item.assigned_to} profiles={profiles} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{formatShortDate(item.due_date)}</Text>
                </View>
                <Pressable onPress={() => navigation.navigate('CommitmentForm', { id: item.id })}>
                  <Text style={styles.linkAction}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await supabase.from('commitments').delete().eq('id', item.id);
                  }}
                >
                  <Text style={styles.linkActionAlert}>Excluir</Text>
                </Pressable>
              </Card>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  addButtonText: {
    fontFamily: fonts.bodyMedium,
    color: '#FFFFFF',
    fontSize: 14,
  },
  list: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  linkAction: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  },
  linkActionAlert: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.alert,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
