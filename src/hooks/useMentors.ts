import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MentorDB {
  id: string;
  emp_id: string;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  skill: string;
  avatar_url: string | null;
  cohort_id: string;
  status: string;
  assignment_start_date: string | null;
  assignment_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useMentors = (cohortId?: string) => {
  return useQuery({
    queryKey: ['mentors', cohortId],
    queryFn: async () => {
      let query = supabase
        .from('mentors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as MentorDB[];
    },
  });
};

export const useCreateMentor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mentor: Omit<MentorDB, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentors')
        .insert(mentor)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      toast.success('Mentor added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add mentor: ${error.message}`);
    },
  });
};

export const useUpdateMentor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MentorDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      toast.success('Mentor updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update mentor: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Failed to remove mentor: ${error.message}`);
    },
  });
};
