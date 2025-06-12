
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAppointmentReminders = () => {
  const queryClient = useQueryClient();

  // Pobierz przypomnienia dla wizyty
  const getPendingReminders = useQuery({
    queryKey: ['pending-reminders'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pending_reminders');
      if (error) throw error;
      return data;
    }
  });

  // Wyślij przypomnienia
  const sendReminders = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-appointment-reminders');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Wysłano ${data.sent_reminders?.length || 0} przypomnień`);
      queryClient.invalidateQueries({ queryKey: ['pending-reminders'] });
    },
    onError: (error: any) => {
      toast.error(`Błąd wysyłania przypomnień: ${error.message}`);
    }
  });

  return {
    pendingReminders: getPendingReminders.data,
    isLoading: getPendingReminders.isLoading,
    sendReminders: sendReminders.mutate,
    isSending: sendReminders.isPending
  };
};
