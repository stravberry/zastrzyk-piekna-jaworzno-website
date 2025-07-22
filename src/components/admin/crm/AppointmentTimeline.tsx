import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  Trash2, 
  Euro 
} from "lucide-react";

type Appointment = Tables<"patient_appointments"> & {
  treatments: Tables<"treatments">;
};

interface AppointmentTimelineProps {
  appointments: Appointment[];
  onDownloadCalendar: (appointmentId: string) => void;
  onDeleteAppointment: (appointmentId: string) => void;
}

const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({
  appointments,
  onDownloadCalendar,
  onDeleteAppointment,
}) => {
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

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Brak wizyt w historii</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment, index) => (
        <div key={appointment.id} className="relative">
          {/* Timeline line */}
          {index < appointments.length - 1 && (
            <div className="absolute left-6 top-16 w-0.5 h-full bg-border z-0" />
          )}
          
          <div className="relative flex items-start gap-6">
            {/* Timeline dot */}
            <div className={`
              relative z-10 w-12 h-12 rounded-full border-4 border-background flex items-center justify-center
              ${appointment.status === 'completed' ? 'bg-green-500' : 
                appointment.status === 'cancelled' ? 'bg-red-500' :
                appointment.status === 'no_show' ? 'bg-gray-500' : 'bg-blue-500'}
            `}>
              <Calendar className="w-5 h-5 text-white" />
            </div>

            {/* Appointment card */}
            <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="space-y-4 flex-1">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h4 className="text-xl font-semibold text-foreground">
                        {appointment.treatments.name}
                      </h4>
                      <Badge className={`${getStatusColor(appointment.status || 'scheduled')} px-3 py-1 text-sm w-fit`}>
                        {getStatusText(appointment.status || 'scheduled')}
                      </Badge>
                    </div>
                    
                    {/* Date and details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(appointment.scheduled_date)}</span>
                      </div>
                      
                      {appointment.cost && (
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <Euro className="w-4 h-4" />
                          <span>{appointment.cost} zł</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Notes */}
                    {appointment.post_treatment_notes && (
                      <div className="p-4 bg-muted rounded-lg border-l-4 border-l-blue-500">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {appointment.post_treatment_notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadCalendar(appointment.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Pobierz .ics
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteAppointment(appointment.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Usuń
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentTimeline;