import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeTable<T extends { id: string }>(table: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from(table).select('*');
    if (!error && data) setRows(data as T[]);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    reload();
    const channelId = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`realtime:${table}:${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        setRows((prev) => {
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id;
            return prev.filter((r) => r.id !== oldId);
          }
          const next = payload.new as T;
          const exists = prev.some((r) => r.id === next.id);
          return exists ? prev.map((r) => (r.id === next.id ? next : r)) : [...prev, next];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, reload]);

  return { rows, loading, reload };
}
