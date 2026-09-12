import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, radii } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useProfiles, useRoutineItems } from '../hooks/useAppData';
import { supabase } from '../lib/supabase';
import { Assignee, WeekdayKey } from '../lib/types';
import { WEEKDAY_LABELS, WEEKDAYS_SUN_FIRST } from '../lib/dates';
import { AssigneePillRow } from '../components/AssigneePillRow';

const TITLE_MAX_LENGTH = 60;

export function RoutineFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RoutineForm'>>();
  const { rows: routineItems } = useRoutineItems();
  const { rows: profiles } = useProfiles();
  const editing = route.params?.id ? routineItems.find((r) => r.id === route.params.id) : undefined;

  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<Assignee>('both');
  const [days, setDays] = useState<WeekdayKey[]>([]);
  const [daily, setDaily] = useState(false);
  const [active, setActive] = useState(true);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [recurrenceError, setRecurrenceError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setAssignedTo(editing.assigned_to);
    setActive(editing.active);
    if (editing.recurrence.includes('daily')) {
      setDaily(true);
      setDays([]);
    } else {
      setDaily(false);
      setDays(editing.recurrence as WeekdayKey[]);
    }
  }, [editing?.id]);

  const toggleDay = (day: WeekdayKey) => {
    setDaily(false);
    setRecurrenceError(null);
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleAllDays = () => {
    setRecurrenceError(null);
    if (daily) {
      setDaily(false);
      setDays([]);
    } else {
      setDaily(true);
      setDays([]);
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    let hasError = false;
    if (!trimmedTitle) {
      setTitleError('Dê um título pra esse exercício.');
      hasError = true;
    }
    if (!daily && days.length === 0) {
      setRecurrenceError('Selecione pelo menos um dia.');
      hasError = true;
    }
    if (hasError) return;

    const recurrence = daily ? ['daily'] : days;
    const payload = { title: trimmedTitle, assigned_to: assignedTo, recurrence, active };
    if (editing) {
      await supabase.from('routine_items').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('routine_items').insert(payload);
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (text.trim()) setTitleError(null);
          }}
          placeholder="Ex. Corrida 5 km"
          placeholderTextColor={colors.textMuted}
          maxLength={TITLE_MAX_LENGTH}
        />
        {titleError && <Text style={styles.error}>{titleError}</Text>}

        <Text style={styles.label}>Responsável</Text>
        <AssigneePillRow value={assignedTo} onChange={setAssignedTo} profiles={profiles} />

        <Text style={styles.label}>Recorrência</Text>
        <View style={styles.dayRow}>
          {WEEKDAYS_SUN_FIRST.map((day) => {
            const selected = daily || days.includes(day);
            return (
              <Pressable
                key={day}
                style={[styles.dayChip, selected && styles.dayChipActive]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>
                  {WEEKDAY_LABELS[day]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {recurrenceError && <Text style={styles.error}>{recurrenceError}</Text>}
        <Pressable onPress={toggleAllDays}>
          <Text style={styles.linkButton}>{daily ? 'Desmarcar todos os dias' : 'Todos os dias'}</Text>
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Ativo</Text>
          <Switch value={active} onValueChange={setActive} trackColor={{ true: colors.secondary }} />
        </View>
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{editing ? 'Salvar alterações' : 'Adicionar à rotina'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: 16,
    gap: 8,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    width: 44,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryTint,
  },
  dayChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },
  dayChipTextActive: {
    color: colors.primary,
  },
  linkButton: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: fonts.bodyMedium,
    color: '#FFFFFF',
    fontSize: 15,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    marginTop: 4,
  },
});
