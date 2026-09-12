import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts, radii } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useCommitments, useProfiles } from '../hooks/useAppData';
import { supabase } from '../lib/supabase';
import { Assignee, CommitmentType } from '../lib/types';
import { formatShortDate, toISODate } from '../lib/dates';
import { AssigneePillRow } from '../components/AssigneePillRow';
import { TYPE_LABELS } from '../components/TypeBadge';

const TYPES: CommitmentType[] = ['task', 'exam', 'assignment', 'appointment'];
const TITLE_MAX_LENGTH = 80;

export function CommitmentFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CommitmentForm'>>();
  const { rows: commitments } = useCommitments();
  const { rows: profiles } = useProfiles();
  const editing = route.params?.id ? commitments.find((c) => c.id === route.params.id) : undefined;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CommitmentType>('task');
  const [assignedTo, setAssignedTo] = useState<Assignee>('both');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setType(editing.type);
    setAssignedTo(editing.assigned_to);
    const [y, m, d] = editing.due_date.split('-').map(Number);
    setDueDate(new Date(y, m - 1, d));
  }, [editing?.id]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Dê um título pra essa tarefa.');
      return;
    }
    const payload = {
      title: trimmedTitle,
      type,
      assigned_to: assignedTo,
      due_date: toISODate(dueDate),
    };
    if (editing) {
      await supabase.from('commitments').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('commitments').insert(payload);
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
          placeholder="Ex. Prova de cálculo"
          placeholderTextColor={colors.textMuted}
          maxLength={TITLE_MAX_LENGTH}
        />
        {titleError && <Text style={styles.error}>{titleError}</Text>}

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.optionRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t}
              style={[styles.optionButton, type === t && styles.optionButtonActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.optionText, type === t && styles.optionTextActive]}>{TYPE_LABELS[t]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Responsável</Text>
        <AssigneePillRow value={assignedTo} onChange={setAssignedTo} profiles={profiles} />

        <Text style={styles.label}>Data</Text>
        <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.text }}>
            {formatShortDate(toISODate(dueDate))}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_event, selected) => {
              setShowPicker(Platform.OS === 'ios');
              if (selected) setDueDate(selected);
            }}
          />
        )}
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{editing ? 'Salvar alterações' : 'Adicionar tarefa'}</Text>
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
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },
  optionTextActive: {
    color: '#FFFFFF',
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
