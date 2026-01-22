import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Trainer = Tables<'trainers'>;
export type TrainerInsert = TablesInsert<'trainers'>;
export type TrainerUpdate = TablesUpdate<'trainers'>;

export const useTrainers = (cohortId?: string) => {
  return useQuery({
    queryKey: ['trainers', cohortId],
    queryFn: async () => {
      let query = supabase.from('trainers').select('*').order('created_at', { ascending: false });
      
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Failed to fetch trainers');
        throw error;
      }

      return data as Trainer[];
    },
  });
};

export const useTrainer = (id: string) => {
  return useQuery({
    queryKey: ['trainers', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast.error('Failed to fetch trainer');
        throw error;
      }

      return data as Trainer | null;
    },
    enabled: !!id,
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trainer: TrainerInsert) => {
      const { data, error } = await supabase
        .from('trainers')
        .insert(trainer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', data.cohort_id] });
      toast.success('Trainer added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add trainer: ' + error.message);
    },
  });
};

export const useUpdateTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TrainerUpdate }) => {
      const { data, error } = await supabase
        .from('trainers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', data.cohort_id] });
      toast.success('Trainer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update trainer: ' + error.message);
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
    onError: (error) => {
      toast.error('Failed to remove trainer: ' + error.message);
    },
  });
};

export const uploadTrainerAvatar = async (file: File, trainerId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `trainers/${trainerId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl;
};
