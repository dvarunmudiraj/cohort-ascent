import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type DailyEffort = Tables<'daily_efforts'>;
export type DailyEffortInsert = TablesInsert<'daily_efforts'>;
export type DailyEffortUpdate = TablesUpdate<'daily_efforts'>;

export const useDailyEfforts = (cohortId?: string, date?: string) => {
  return useQuery({
    queryKey: ['daily_efforts', cohortId, date],
    queryFn: async () => {
      let query = supabase.from('daily_efforts').select('*').order('date', { ascending: false });
      
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }
      
      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Failed to fetch daily efforts');
        throw error;
      }

      return data as DailyEffort[];
    },
  });
};

export const useDailyEffort = (id: string) => {
  return useQuery({
    queryKey: ['daily_efforts', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_efforts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast.error('Failed to fetch daily effort');
        throw error;
      }

      return data as DailyEffort | null;
    },
    enabled: !!id,
  });
};

export const useCreateDailyEffort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (effort: DailyEffortInsert) => {
      const { data, error } = await supabase
        .from('daily_efforts')
        .insert(effort)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily_efforts'] });
      queryClient.invalidateQueries({ queryKey: ['daily_efforts', data.cohort_id] });
      toast.success('Daily effort logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log daily effort: ' + error.message);
    },
  });
};

export const useUpdateDailyEffort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DailyEffortUpdate }) => {
      const { data, error } = await supabase
        .from('daily_efforts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily_efforts'] });
      queryClient.invalidateQueries({ queryKey: ['daily_efforts', data.cohort_id] });
      toast.success('Daily effort updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update daily effort: ' + error.message);
    },
  });
};

export const useDeleteDailyEffort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_efforts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_efforts'] });
      toast.success('Daily effort deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete daily effort: ' + error.message);
    },
  });
};

// Get weekly summary
export const useWeeklyEffortsSummary = (cohortId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['daily_efforts', 'weekly', cohortId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_efforts')
        .select('*')
        .eq('cohort_id', cohortId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        toast.error('Failed to fetch weekly efforts');
        throw error;
      }

      // Calculate summary
      const summary = {
        totalHours: data.reduce((sum, e) => sum + Number(e.effort_hours), 0),
        byStakeholder: {} as Record<string, { name: string; type: string; hours: number }>,
        byArea: {} as Record<string, number>,
        entries: data,
      };

      data.forEach((entry) => {
        // By stakeholder
        if (!summary.byStakeholder[entry.stakeholder_id]) {
          summary.byStakeholder[entry.stakeholder_id] = {
            name: entry.stakeholder_name,
            type: entry.stakeholder_type,
            hours: 0,
          };
        }
        summary.byStakeholder[entry.stakeholder_id].hours += Number(entry.effort_hours);

        // By area
        if (!summary.byArea[entry.area_of_work]) {
          summary.byArea[entry.area_of_work] = 0;
        }
        summary.byArea[entry.area_of_work] += Number(entry.effort_hours);
      });

      return summary;
    },
    enabled: !!cohortId && !!startDate && !!endDate,
  });
};
