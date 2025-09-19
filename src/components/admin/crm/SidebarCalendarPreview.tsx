import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format, startOfDay, endOfDay, isToday } from "date-fns";
import { pl } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const SidebarCalendarPreview: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();

  const { data: todayAppointments, isLoading } = useQuery({
    queryKey: ['sidebar-today-appointments'],
    queryFn: async () => {
      const startDate = startOfDay(today);
      const endDate = endOfDay(today);

      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          id,
          scheduled_date,
          duration_minutes,
          status,
          treatment_id,
          patients!inner (
            first_name,
            last_name
          )
        `)
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(3);

      if (error) throw error;

      // Get treatment info
      const { data: treatmentData } = await supabase.rpc('get_available_treatments_from_pricing');
      
      const treatmentLookup: Record<string, { name: string }> = {};
      treatmentData?.forEach(treatment => {
        treatmentLookup[treatment.treatment_id] = {
          name: treatment.name
        };
      });

      // Map appointments with treatment data
      const appointmentsWithTreatments = data?.map(appointment => ({
        ...appointment,
        treatment_name: treatmentLookup[appointment.treatment_id]?.name || 'Nieznany zabieg'
      })) || [];

      return appointmentsWithTreatments;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: pl });
  };

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-900">Dzisiaj</h3>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        {format(today, 'EEEE, d MMMM', { locale: pl })}
      </div>

      {todayAppointments && todayAppointments.length > 0 ? (
        <div className="space-y-2">
          {todayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/admin/appointments')}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-gray-900 truncate flex-1">
                  {appointment.treatment_name}
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(appointment.status)} text-xs px-1 py-0 h-4`}
                >
                  {appointment.status === 'scheduled' ? 'Plan' : 
                   appointment.status === 'completed' ? 'OK' : 
                   appointment.status === 'cancelled' ? 'Anul' : 'Brak'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(appointment.scheduled_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate">
                    {appointment.patients?.first_name} {appointment.patients?.last_name}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {todayAppointments.length === 3 && (
            <button
              onClick={() => navigate('/admin/appointments')}
              className="w-full text-xs text-blue-600 hover:text-blue-700 py-1"
            >
              Zobacz wszystkie →
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-xs text-gray-500 mb-2">
            Brak wizyt na dziś
          </div>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Sprawdź kalendarz →
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarCalendarPreview;