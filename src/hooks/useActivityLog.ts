import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type ActivityLog = Tables<'activity_log'>;
export type ActivityLogInsert = TablesInsert<'activity_log'>;

export const useActivityLog = (limit = 50) => {
  return useQuery({
    queryKey: ['activity_log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        toast.error('Failed to fetch activity log');
        throw error;
      }

      return data as ActivityLog[];
    },
  });
};

export const useUserActivityLog = (userId: string, limit = 20) => {
  return useQuery({
    queryKey: ['activity_log', 'user', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        toast.error('Failed to fetch user activity');
        throw error;
      }

      return data as ActivityLog[];
    },
    enabled: !!userId,
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: ActivityLogInsert) => {
      const { data, error } = await supabase
        .from('activity_log')
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_log'] });
    },
    onError: (error) => {
      console.error('Failed to log activity:', error.message);
    },
  });
};

// Helper function to log activities
export const logActivity = async (
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) => {
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details as any,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
