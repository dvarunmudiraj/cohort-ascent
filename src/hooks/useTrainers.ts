import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TrainerDB {
  id: string;
  emp_id: string;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  skill: string;
  avatar_url: string | null;
  cohort_id: string;
  is_internal: boolean;
  status: string;
  training_start_date: string | null;
  training_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useTrainers = (cohortId?: string) => {
  return useQuery({
    queryKey: ['trainers', cohortId],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TrainerDB[];
    },
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trainer: Omit<TrainerDB, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('trainers')
        .insert(trainer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add trainer: ${error.message}`);
    },
  });
};

export const useUpdateTrainer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TrainerDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('trainers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update trainer: ${error.message}`);
    },
  });
};

export const useDeleteTrainer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove trainer: ${error.message}`);
    },
  });
};
