
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReminderStatus {
  reminder_type: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
}

export const useReminderStatus = (appointmentId: string) => {
  return useQuery({
    queryKey: ['reminder-status', appointmentId],
    queryFn: async (): Promise<ReminderStatus[]> => {
      const { data, error } = await supabase
        .from('appointment_reminders')
        .select('reminder_type, status, sent_at, error_message')
        .eq('appointment_id', appointmentId)
        .order('scheduled_at');
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!appointmentId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
};
