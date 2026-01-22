import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Cohort = Tables<'cohorts'>;
export type CohortInsert = TablesInsert<'cohorts'>;
export type CohortUpdate = TablesUpdate<'cohorts'>;

export const useCohorts = () => {
  return useQuery({
    queryKey: ['cohorts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch cohorts');
        throw error;
      }

      return data as Cohort[];
    },
  });
};

export const useCohort = (id: string) => {
  return useQuery({
    queryKey: ['cohorts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast.error('Failed to fetch cohort');
        throw error;
      }

      return data as Cohort | null;
    },
    enabled: !!id,
  });
};

export const useCreateCohort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cohort: CohortInsert) => {
      const { data, error } = await supabase
        .from('cohorts')
        .insert(cohort)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      toast.success('Cohort created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create cohort: ' + error.message);
    },
  });
};

export const useUpdateCohort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CohortUpdate }) => {
      const { data, error } = await supabase
        .from('cohorts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['cohorts', data.id] });
      toast.success('Cohort updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update cohort: ' + error.message);
    },
  });
};

export const useDeleteCohort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cohorts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      toast.success('Cohort deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete cohort: ' + error.message);
    },
  });
};
