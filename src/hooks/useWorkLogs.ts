import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkLog } from '@/types/database';

export function useWorkLogs() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (content: string) => {
    try {
      const { data, error } = await supabase
        .from('work_logs')
        .insert([{
          content,
          category: 'General',
          duration: 1,
          date: new Date().toISOString().split('T')[0],
          tags: []
        }])
        .select();

      if (error) throw error;
      if (data) setLogs([data[0], ...logs]);
    } catch (error) {
      console.error('Error adding log:', error);
      // Fallback for demo if no supabase credentials
      const fallbackLog: WorkLog = {
        id: Date.now().toString(),
        created_at: 'Just now',
        user_id: 'demo-user',
        content,
        category: 'General',
        duration: 1,
        date: new Date().toISOString().split('T')[0],
        tags: []
      };
      setLogs([fallbackLog, ...logs]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, addLog, fetchLogs };
}
