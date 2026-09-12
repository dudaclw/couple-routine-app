import { Assignee, Profile, Role } from './types';

export const BOTH_LABEL = 'Os dois';

export function displayNameForAssignee(profiles: Profile[], assignee: Assignee): string {
  if (assignee === 'both') return BOTH_LABEL;
  return profiles.find((p) => p.role === assignee)?.display_name ?? '—';
}

export function initialFor(displayName: string): string {
  return displayName.trim().charAt(0).toUpperCase() || '?';
}

export function nextAvailableRole(profiles: Profile[]): Role | null {
  const taken = new Set(profiles.map((p) => p.role));
  if (!taken.has('user_a')) return 'user_a';
  if (!taken.has('user_b')) return 'user_b';
  return null;
}
