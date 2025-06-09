
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Download, FileText } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type AppointmentWithDetails = Tables<"patient_appointments"> & {
  patients: Tables<"patients">;
  treatments: Tables<"treatments">;
};

const TreatmentHistory: React.FC = () => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['treatment-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          *,
          patients (*),
          treatments (*)
        `)
        .order('scheduled_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AppointmentWithDetails[];
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    return <div className="text-center py-8">Ładowanie historii zabiegów...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia wszystkich zabiegów</CardTitle>
        <CardDescription>
          Przegląd ostatnich wizyt wszystkich pacjentów
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments?.map((appointment) => (
            <Card key={appointment.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{appointment.treatments.name}</h4>
                    <Badge className={getStatusColor(appointment.status || 'scheduled')}>
                      {getStatusText(appointment.status || 'scheduled')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {appointment.patients.first_name} {appointment.patients.last_name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(appointment.scheduled_date)}
                    </div>
                  </div>
                  
                  {appointment.cost && (
                    <p className="text-sm font-medium mb-2">
                      Koszt: {appointment.cost} zł
                    </p>
                  )}
                  
                  {appointment.post_treatment_notes && (
                    <p className="text-sm text-gray-600">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {appointment.post_treatment_notes}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadCalendarEvent(appointment.id)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    .ics
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {(!appointments || appointments.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              Brak zabiegów w historii
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentHistory;
