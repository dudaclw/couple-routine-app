import { supabase } from './supabase';
import { Completion } from './types';

export function completionFor(completions: Completion[], routineItemId: string, dateISO: string) {
  return completions.find((c) => c.routine_item_id === routineItemId && c.date === dateISO);
}

export async function toggleRoutineCompletion(
  routineItemId: string,
  dateISO: string,
  existing: Completion | undefined,
  completedBy: string
) {
  if (existing) {
    await supabase.from('completions').delete().eq('id', existing.id);
  } else {
    await supabase
      .from('completions')
      .insert({ routine_item_id: routineItemId, date: dateISO, completed_by: completedBy });
  }
}
