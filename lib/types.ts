export type Assignee = 'user_a' | 'user_b' | 'both';

export type CommitmentType = 'task' | 'exam' | 'assignment' | 'appointment';

export type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface RoutineItem {
  id: string;
  title: string;
  assigned_to: Assignee;
  recurrence: string[]; // WeekdayKey[] or ['daily']
  active: boolean;
  created_at: string;
}

export interface Commitment {
  id: string;
  title: string;
  type: CommitmentType;
  due_date: string; // YYYY-MM-DD
  assigned_to: Assignee;
  completed: boolean;
  created_at: string;
}

export interface Completion {
  id: string;
  routine_item_id: string;
  date: string; // YYYY-MM-DD
  completed_by: string;
  completed_at: string;
}

export type Role = 'user_a' | 'user_b';

export interface Profile {
  id: string;
  role: Role;
  display_name: string;
}
