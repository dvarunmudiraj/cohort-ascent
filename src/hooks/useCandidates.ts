import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CandidateDB {
  id: string;
  candidate_id: string;
  name: string;
  email: string | null;
  skill: string;
  location: string;
  cohort_id: string;
  status: string;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export const useCandidates = (cohortId?: string) => {
  return useQuery({
    queryKey: ['candidates', cohortId],
    queryFn: async () => {
      let query = supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CandidateDB[];
    },
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidate: Omit<CandidateDB, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidate)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add candidate: ${error.message}`);
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CandidateDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update candidate: ${error.message}`);
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
      toast.success('Candidate deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete candidate: ${error.message}`);
    },
  });
};

export const useBulkCreateCandidates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidates: Omit<CandidateDB, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidates)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success(`${data.length} candidates imported successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to import candidates: ${error.message}`);
    },
  });
};
