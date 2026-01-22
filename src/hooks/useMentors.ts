import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Mentor = Tables<'mentors'>;
export type MentorInsert = TablesInsert<'mentors'>;
export type MentorUpdate = TablesUpdate<'mentors'>;

export const useMentors = (cohortId?: string) => {
  return useQuery({
    queryKey: ['mentors', cohortId],
    queryFn: async () => {
      let query = supabase.from('mentors').select('*').order('created_at', { ascending: false });
      
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Failed to fetch mentors');
        throw error;
      }

      return data as Mentor[];
    },
  });
};

export const useMentor = (id: string) => {
  return useQuery({
    queryKey: ['mentors', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast.error('Failed to fetch mentor');
        throw error;
      }

      return data as Mentor | null;
    },
    enabled: !!id,
  });
};

export const useCreateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentor: MentorInsert) => {
      const { data, error } = await supabase
        .from('mentors')
        .insert(mentor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      queryClient.invalidateQueries({ queryKey: ['mentors', data.cohort_id] });
      toast.success('Mentor added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add mentor: ' + error.message);
    },
  });
};

export const useUpdateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MentorUpdate }) => {
      const { data, error } = await supabase
        .from('mentors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      queryClient.invalidateQueries({ queryKey: ['mentors', data.cohort_id] });
      toast.success('Mentor updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update mentor: ' + error.message);
    },
  });
};

export const useDeleteMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      toast.success('Mentor removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove mentor: ' + error.message);
    },
  });
};

export const uploadMentorAvatar = async (file: File, mentorId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `mentors/${mentorId}.${fileExt}`;

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
