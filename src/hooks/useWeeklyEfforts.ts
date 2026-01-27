import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WeeklyEffortDB {
  id: string;
  cohort_id: string;
  week_start_date: string;
  week_end_date: string;
  week_number: number;
  // Trainer logs
  trainer_id: string | null;
  trainer_name: string | null;
  trainer_hours: number;
  trainer_activities: string | null;
  // Mentor logs
  mentor_id: string | null;
  mentor_name: string | null;
  mentor_hours: number;
  mentor_notes: string | null;
  // Buddy Mentor logs
  buddy_mentor_id: string | null;
  buddy_mentor_name: string | null;
  buddy_mentor_hours: number;
  buddy_mentor_notes: string | null;
  // Meta
  status: 'draft' | 'completed';
  submitted_by: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyEffortInput {
  cohort_id: string;
  week_start_date: string;
  week_end_date: string;
  week_number: number;
  trainer_id?: string | null;
  trainer_name?: string | null;
  trainer_hours: number;
  trainer_activities?: string | null;
  mentor_id?: string | null;
  mentor_name?: string | null;
  mentor_hours: number;
  mentor_notes?: string | null;
  buddy_mentor_id?: string | null;
  buddy_mentor_name?: string | null;
  buddy_mentor_hours: number;
  buddy_mentor_notes?: string | null;
  status: 'draft' | 'completed';
  submitted_by: string;
}

// For now, we'll use the daily_efforts table with weekly grouping
// This hook provides a weekly view of efforts

export const useWeeklyEfforts = (cohortId?: string) => {
  return useQuery({
    queryKey: ['weekly_efforts', cohortId],
    queryFn: async () => {
      if (!cohortId) return [];
      
      const { data, error } = await supabase
        .from('daily_efforts')
        .select('*')
        .eq('cohort_id', cohortId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!cohortId,
  });
};

export const useSaveWeeklyEffort = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (efforts: Array<{
      cohort_id: string;
      date: string;
      stakeholder_id: string;
      stakeholder_name: string;
      stakeholder_type: string;
      mode_of_training: string;
      virtual_reason?: string | null;
      area_of_work: string;
      effort_hours: number;
      session_start_time?: string | null;
      session_end_time?: string | null;
      active_genc_count?: number | null;
      notes?: string | null;
      submitted_by: string;
    }>) => {
      // First delete existing entries for the same week and cohort
      if (efforts.length > 0) {
        const dates = efforts.map(e => e.date);
        await supabase
          .from('daily_efforts')
          .delete()
          .eq('cohort_id', efforts[0].cohort_id)
          .in('date', dates);
      }
      
      const { data, error } = await supabase
        .from('daily_efforts')
        .insert(efforts)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_efforts'] });
      queryClient.invalidateQueries({ queryKey: ['daily_efforts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save weekly effort: ${error.message}`);
    },
  });
};
