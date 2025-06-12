
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGoogleCalendar = () => {
  const queryClient = useQueryClient();

  // Pobierz integracje kalendarza
  const getIntegrations = useQuery({
    queryKey: ['calendar-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('provider', 'google')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Rozpocznij autoryzację Google
  const authorizeGoogle = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'authorize' }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Otwórz okno autoryzacji
      window.open(data.auth_url, 'google-auth', 'width=500,height=600');
    },
    onError: (error: any) => {
      toast.error(`Błąd autoryzacji: ${error.message}`);
    }
  });

  // Synchronizuj wizytę z kalendarzem
  const syncAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: { appointment_id: appointmentId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
      if (successCount > 0) {
        toast.success(`Zsynchronizowano z ${successCount} kalendarzami`);
      }
      queryClient.invalidateQueries({ queryKey: ['calendar-integrations'] });
    },
    onError: (error: any) => {
      toast.error(`Błąd synchronizacji: ${error.message}`);
    }
  });

  return {
    integrations: getIntegrations.data,
    isLoading: getIntegrations.isLoading,
    authorizeGoogle: authorizeGoogle.mutate,
    isAuthorizing: authorizeGoogle.isPending,
    syncAppointment: syncAppointment.mutate,
    isSyncing: syncAppointment.isPending
  };
};
