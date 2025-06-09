
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, User, Clock } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type AppointmentWithDetails = Tables<"patient_appointments"> & {
  patients: Tables<"patients">;
  treatments: Tables<"treatments">;
};

const AppointmentsCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Fetch appointments for the selected month
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments-calendar', selectedMonth.getFullYear(), selectedMonth.getMonth()],
    queryFn: async () => {
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          *,
          patients (*),
          treatments (*)
        `)
        .gte('scheduled_date', startOfMonth.toISOString())
        .lte('scheduled_date', endOfMonth.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as AppointmentWithDetails[] || [];
    }
  });

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate ? 
    appointments?.filter(apt => {
      const aptDate = new Date(apt.scheduled_date);
      return aptDate.toDateString() === selectedDate.toDateString();
    }) || [] : [];

  // Get dates that have appointments
  const appointmentDates = appointments?.map(apt => new Date(apt.scheduled_date)) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Zaplanowana';
      case 'completed': return 'Zakończona';
      case 'cancelled': return 'Anulowana';
      case 'no_show': return 'Nieobecność';
      default: return status;
    }
  };

  const downloadCalendarEvent = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_ics_event', {
        appointment_id_param: appointmentId
      });

      if (error) throw error;
      
      if (data) {
        const blob = new Blob([data], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wizyta_${appointmentId}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating calendar event:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Ładowanie kalendarza...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Kalendarz wizyt</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            modifiers={{
              hasAppointment: appointmentDates
            }}
            modifiersStyles={{
              hasAppointment: {
                backgroundColor: '#fecaca',
                color: '#dc2626',
                fontWeight: 'bold'
              }
            }}
            className="rounded-md border"
          />
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-200 rounded"></div>
              <span>Dni z wizytami</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>
            Wizyty na dzień {selectedDate ? selectedDate.toLocaleDateString('pl-PL') : 'Wybierz datę'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDateAppointments.length > 0 ? (
                selectedDateAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{appointment.treatments.name}</h4>
                          <Badge className={`text-xs ${getStatusColor(appointment.status || 'scheduled')}`}>
                            {getStatusText(appointment.status || 'scheduled')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {appointment.patients.first_name} {appointment.patients.last_name}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(appointment.scheduled_date).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {appointment.cost && (
                            <div className="font-medium">
                              Koszt: {appointment.cost} zł
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadCalendarEvent(appointment.id)}
                        className="ml-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Brak wizyt w wybranym dniu
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Wybierz datę aby zobaczyć wizyty
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsCalendar;
