
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReminderStatus = (appointmentId: string) => {
  return useQuery({
    queryKey: ['reminder-status', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_appointment_reminder_status', {
        appointment_id_param: appointmentId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!appointmentId
  });
};
