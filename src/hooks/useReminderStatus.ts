
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReminderStatus {
  reminder_type: string;
  status: string;
  sent_at: string | null;
  delivery_status: string;
}

export const useReminderStatus = (appointmentId: string) => {
  return useQuery({
    queryKey: ['reminder-status', appointmentId],
    queryFn: async (): Promise<ReminderStatus[]> => {
      const { data, error } = await supabase
        .from('appointment_reminders')
        .select('reminder_type, status, sent_at')
        .eq('appointment_id', appointmentId)
        .order('scheduled_at');
      
      if (error) throw error;
      
      // Map the data to include delivery_status with a default value
      return (data || []).map(reminder => ({
        ...reminder,
        delivery_status: reminder.status === 'sent' ? 'delivered' : 'pending'
      }));
    },
    enabled: !!appointmentId
  });
};
