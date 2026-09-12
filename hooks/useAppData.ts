import { useRealtimeTable } from './useRealtimeTable';
import { RoutineItem, Commitment, Completion, Profile } from '../lib/types';

export const useRoutineItems = () => useRealtimeTable<RoutineItem>('routine_items');
export const useCommitments = () => useRealtimeTable<Commitment>('commitments');
export const useCompletions = () => useRealtimeTable<Completion>('completions');
export const useProfiles = () => useRealtimeTable<Profile>('profiles');
