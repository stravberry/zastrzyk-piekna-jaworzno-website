
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, Clock, User, FileText, Edit, Trash2, Download, Search } from "lucide-react";
import { toast } from "sonner";
import AppointmentForm from "./AppointmentForm";

type Appointment = Tables<"patient_appointments"> & {
  patients: Pick<Tables<"patients">, "first_name" | "last_name" | "phone">;
  treatments: Pick<Tables<"treatments">, "name" | "category">;
};

interface AllAppointmentsListProps {
  onUpdate?: () => void;
}

const APPOINTMENTS_PER_PAGE = 15;

const AllAppointmentsList: React.FC<AllAppointmentsListProps> = ({ onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const queryClient = useQueryClient();

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ['all-appointments', searchTerm, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * APPOINTMENTS_PER_PAGE;
      const to = from + APPOINTMENTS_PER_PAGE - 1;

      let query = supabase
        .from('patient_appointments')
        .select(`
          *,
          patients!inner (
            first_name,
            last_name,
            phone
          ),
          treatments!inner (
            name,
            category
          )
        `, { count: 'exact' })
        .order('scheduled_date', { ascending: true })
        .range(from, to);

      if (searchTerm.trim()) {
        query = query.or(`patients.first_name.ilike.%${searchTerm}%,patients.last_name.ilike.%${searchTerm}%,treatments.name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        appointments: data || [],
        totalCount: count || 0
      };
    }
  });

  const appointments = appointmentsData?.appointments || [];
  const totalCount = appointmentsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / APPOINTMENTS_PER_PAGE);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Zakończona';
      case 'scheduled':
        return 'Zaplanowana';
      case 'cancelled':
        return 'Anulowana';
      default:
        return status;
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę wizytę?')) return;

    try {
      const { error } = await supabase
        .from('patient_appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Wizyta została usunięta');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast.error('Błąd podczas usuwania wizyty');
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingAppointment(null);
    refetch();
    queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    if (onUpdate) onUpdate();
    toast.success('Wizyta została zaktualizowana');
  };

  const handleDownloadIcs = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_ics_event', {
        appointment_id_param: appointmentId
      });

      if (error) throw error;
      
      if (data) {
        const blob = new Blob([data], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wizyta-${appointmentId}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Plik .ics został pobrany');
      }
    } catch (error: any) {
      console.error('Error generating ICS:', error);
      toast.error('Błąd podczas generowania pliku .ics');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(page);
            }}
            isActive={currentPage === page}
            className="text-xs sm:text-sm"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-sm">Ładowanie wizyt...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">
            Wszystkie wizyty ({totalCount})
          </h3>
          {totalPages > 1 && (
            <p className="text-xs sm:text-sm text-gray-500">
              Strona {currentPage} z {totalPages} (pokazuje {appointments.length} z {totalCount})
            </p>
          )}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po pacjencie lub zabiegu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {appointments.map((appointment) => {
          const { date, time } = formatDateTime(appointment.scheduled_date);
          
          return (
            <Card key={appointment.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h4 className="font-semibold text-base sm:text-lg truncate">
                        {appointment.patients.first_name} {appointment.patients.last_name}
                      </h4>
                      <Badge variant={getStatusBadgeVariant(appointment.status || 'scheduled')} className="text-xs self-start sm:self-auto">
                        {getStatusLabel(appointment.status || 'scheduled')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{date} o {time}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{appointment.treatments.name}</span>
                      </div>
                      
                      {appointment.duration_minutes && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{appointment.duration_minutes} min</span>
                        </div>
                      )}

                      {appointment.patients.phone && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{appointment.patients.phone}</span>
                        </div>
                      )}
                    </div>

                    {appointment.pre_treatment_notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        <strong>Notatki:</strong> {appointment.pre_treatment_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAppointment(appointment)}
                      className="text-xs"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Edytuj</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadIcs(appointment.id)}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">.ics</span>
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-xs"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Usuń</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {appointments.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            {searchTerm ? 'Nie znaleziono wizyt' : 'Brak wizyt w systemie'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} text-xs sm:text-sm`}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''} text-xs sm:text-sm`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Appointment Form */}
      {showEditForm && editingAppointment && (
        <AppointmentForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingAppointment(null);
          }}
          selectedPatient={null}
          onSuccess={handleEditSuccess}
          editingAppointment={editingAppointment}
        />
      )}
    </div>
  );
};

export default AllAppointmentsList;
