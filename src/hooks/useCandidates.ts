import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Candidate = Tables<'candidates'>;
export type CandidateInsert = TablesInsert<'candidates'>;
export type CandidateUpdate = TablesUpdate<'candidates'>;

export const useCandidates = (cohortId?: string) => {
  return useQuery({
    queryKey: ['candidates', cohortId],
    queryFn: async () => {
      let query = supabase.from('candidates').select('*').order('created_at', { ascending: false });
      
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Failed to fetch candidates');
        throw error;
      }

      return data as Candidate[];
    },
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: ['candidates', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast.error('Failed to fetch candidate');
        throw error;
      }

      return data as Candidate | null;
    },
    enabled: !!id,
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidate: CandidateInsert) => {
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', data.cohort_id] });
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      toast.success('Candidate added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add candidate: ' + error.message);
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CandidateUpdate }) => {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', data.cohort_id] });
      toast.success('Candidate updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update candidate: ' + error.message);
    },
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      toast.success('Candidate removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove candidate: ' + error.message);
    },
  });
};
