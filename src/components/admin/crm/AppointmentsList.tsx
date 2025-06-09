
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Download, FileText, Search, Filter } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type AppointmentWithDetails = Tables<"patient_appointments"> & {
  patients: Tables<"patients">;
  treatments: Tables<"treatments">;
};

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled" | "no_show";

const AppointmentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments-list', searchTerm, statusFilter, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('patient_appointments')
        .select(`
          *,
          patients (*),
          treatments (*)
        `, { count: 'exact' })
        .order('scheduled_date', { ascending: false })
        .range(from, to);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm.trim()) {
        // Search by patient name or treatment name
        query = query.or(`patients.first_name.ilike.%${searchTerm}%,patients.last_name.ilike.%${searchTerm}%,treatments.name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        appointments: data as AppointmentWithDetails[] || [],
        totalCount: count || 0
      };
    }
  });

  const appointments = appointmentsData?.appointments || [];
  const totalCount = appointmentsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isUpcoming = date > now;
    
    return {
      formatted: date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isUpcoming
    };
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
    return <div className="text-center py-8 text-sm">Ładowanie wizyt...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po pacjencie lub zabiegu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="scheduled">Zaplanowane</SelectItem>
            <SelectItem value="completed">Zakończone</SelectItem>
            <SelectItem value="cancelled">Anulowane</SelectItem>
            <SelectItem value="no_show">Nieobecność</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results info */}
      <div className="text-xs sm:text-sm text-gray-600">
        Znaleziono {totalCount} wizyt
        {totalPages > 1 && (
          <span> (strona {currentPage} z {totalPages})</span>
        )}
      </div>

      {/* Appointments List */}
      <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
        {appointments.map((appointment) => {
          const dateInfo = formatDate(appointment.scheduled_date);
          
          return (
            <Card key={appointment.id} className={`p-3 sm:p-4 ${dateInfo.isUpcoming ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h4 className="font-medium text-sm sm:text-base truncate">{appointment.treatments.name}</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`text-xs ${getStatusColor(appointment.status || 'scheduled')}`}>
                        {getStatusText(appointment.status || 'scheduled')}
                      </Badge>
                      {dateInfo.isUpcoming && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                          Nadchodząca
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{appointment.patients.first_name} {appointment.patients.last_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{dateInfo.formatted}</span>
                    </div>
                  </div>
                  
                  {appointment.cost && (
                    <p className="text-xs sm:text-sm font-medium mb-2">
                      Koszt: {appointment.cost} zł
                    </p>
                  )}
                  
                  {appointment.pre_treatment_notes && (
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                      <FileText className="w-3 h-3 inline mr-1" />
                      Notatki przed: {appointment.pre_treatment_notes}
                    </p>
                  )}
                  
                  {appointment.post_treatment_notes && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      <FileText className="w-3 h-3 inline mr-1" />
                      Notatki po: {appointment.post_treatment_notes}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 justify-end sm:justify-start flex-shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadCalendarEvent(appointment.id)}
                    className="text-xs px-2 py-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    .ics
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {appointments.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            {searchTerm || statusFilter !== "all" 
              ? "Nie znaleziono wizyt spełniających kryteria"
              : "Brak wizyt w systemie"
            }
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="text-xs w-full sm:w-auto"
          >
            Poprzednia
          </Button>
          
          <span className="flex items-center px-3 text-xs sm:text-sm order-first sm:order-none">
            {currentPage} z {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="text-xs w-full sm:w-auto"
          >
            Następna
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
