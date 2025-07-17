import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, User, Download, FileText, Search, Filter, Trash2, Edit, Clock, CheckCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import AppointmentReminderStatus from "./AppointmentReminderStatus";
import AppointmentForm from "./AppointmentForm";
import QuickStatusChange from "./QuickStatusChange";
import ManualReminderButton from "./ManualReminderButton";

type AppointmentWithDetails = Tables<"patient_appointments"> & {
  patients: Tables<"patients">;
  treatments: Tables<"treatments">;
};

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled" | "no_show";
type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

const AppointmentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const ITEMS_PER_PAGE = 15;

  const queryClient = useQueryClient();

  const { data: appointmentsData, isLoading, refetch } = useQuery({
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
        .order('scheduled_date', { ascending: false });

      // Apply search filter if provided
      if (searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`;
        query = query.or(`patients.first_name.ilike.${searchPattern},patients.last_name.ilike.${searchPattern},treatments.name.ilike.${searchPattern}`);
      }

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        const validAppointmentStatuses: AppointmentStatus[] = ["scheduled", "completed", "cancelled", "no_show"];
        const isValidStatus = validAppointmentStatuses.includes(statusFilter as AppointmentStatus);
        if (isValidStatus) {
          const validStatus = statusFilter as AppointmentStatus;
          query = query.eq('status', validStatus);
        }
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        appointments: data as AppointmentWithDetails[] || [],
        totalCount: count || 0
      };
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Mutation for quick status updates
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, newStatus }: { appointmentId: string, newStatus: AppointmentStatus }) => {
      const { error } = await supabase
        .from('patient_appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: 'update_appointment_status',
        _resource_type: 'patient_appointment',
        _resource_id: appointmentId,
        _details: { new_status: newStatus }
      });
    },
    onSuccess: () => {
      toast.success("Status wizyty został zaktualizowany");
      queryClient.invalidateQueries({ queryKey: ['appointments-list'] });
    },
    onError: (error) => {
      console.error('Error updating appointment status:', error);
      toast.error("Błąd podczas aktualizacji statusu");
    }
  });

  // Manual reminder sending mutation
  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-appointment-reminders');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Reminders sent:', data);
      toast.success(`Wysłano ${data.sent_reminders?.length || 0} przypomnień`);
      queryClient.invalidateQueries({ queryKey: ['appointments-list'] });
      queryClient.invalidateQueries({ queryKey: ['reminder-status'] });
    },
    onError: (error: any) => {
      console.error('Error sending reminders:', error);
      toast.error(`Błąd wysyłania przypomnień: ${error.message}`);
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

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setIsEditFormOpen(true);
  };

  const handleQuickStatusChange = (appointmentId: string, newStatus: string) => {
    // Validate that newStatus is a valid AppointmentStatus
    const validStatuses: AppointmentStatus[] = ["scheduled", "completed", "cancelled", "no_show"];
    if (!validStatuses.includes(newStatus as AppointmentStatus)) {
      toast.error("Nieprawidłowy status wizyty");
      return;
    }
    
    updateStatusMutation.mutate({ appointmentId, newStatus: newStatus as AppointmentStatus });
  };

  const handleStatusFilterChange = (value: string) => {
    // Validate the value is a valid StatusFilter before setting it
    const validFilters: StatusFilter[] = ["all", "scheduled", "completed", "cancelled", "no_show"];
    if (validFilters.includes(value as StatusFilter)) {
      setStatusFilter(value as StatusFilter);
      setCurrentPage(1);
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

  const deleteAppointment = async (appointmentId: string) => {
    setIsDeleting(true);
    try {
      const appointmentToDelete = appointments.find(apt => apt.id === appointmentId);
      
      const { error } = await supabase
        .from('patient_appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      await supabase.rpc('log_admin_activity', {
        _action: 'delete_appointment',
        _resource_type: 'patient_appointment',
        _resource_id: appointmentId,
        _details: {
          patient_id: appointmentToDelete?.patient_id,
          patient_name: `${appointmentToDelete?.patients.first_name} ${appointmentToDelete?.patients.last_name}`,
          treatment_name: appointmentToDelete?.treatments.name
        }
      });

      toast.success("Wizyta została usunięta");
      refetch();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error("Błąd podczas usuwania wizyty");
    } finally {
      setIsDeleting(false);
      setAppointmentToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-sm">Ładowanie wizyt...</div>;
  }

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {/* Filters and Manual Reminder Button */}
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
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
          <Button
            onClick={() => sendRemindersMutation.mutate()}
            disabled={sendRemindersMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {sendRemindersMutation.isPending ? "Wysyłanie..." : "Wyślij przypomnienia"}
          </Button>
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
              <Card key={appointment.id} className={`p-4 ${dateInfo.isUpcoming ? 'border-l-4 border-l-blue-500' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <h4 className="font-medium text-base truncate">{appointment.treatments.name}</h4>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${getStatusColor(appointment.status || 'scheduled')}`}>
                          {getStatusText(appointment.status || 'scheduled')}
                        </Badge>
                        {dateInfo.isUpcoming && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Nadchodząca
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{appointment.patients.first_name} {appointment.patients.last_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{dateInfo.formatted}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Quick Status Change */}
                      <div>
                        <QuickStatusChange 
                          currentStatus={appointment.status || 'scheduled'}
                          onStatusChange={(newStatus) => handleQuickStatusChange(appointment.id, newStatus)}
                          disabled={updateStatusMutation.isPending}
                        />
                      </div>
                      
                      {/* Reminder Status */}
                      <div>
                        <AppointmentReminderStatus appointmentId={appointment.id} />
                      </div>
                    </div>
                    
                    {appointment.cost && (
                      <p className="text-sm font-medium">
                        Koszt: {appointment.cost} zł
                      </p>
                    )}
                    
                    {(appointment.pre_treatment_notes || appointment.post_treatment_notes) && (
                      <div className="space-y-2">
                        {appointment.pre_treatment_notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <FileText className="w-4 h-4 inline mr-2 text-blue-500" />
                            <span className="font-medium">Przed:</span> {appointment.pre_treatment_notes}
                          </p>
                        )}
                        
                        {appointment.post_treatment_notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <FileText className="w-4 h-4 inline mr-2 text-green-500" />
                            <span className="font-medium">Po:</span> {appointment.post_treatment_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col lg:flex-row gap-2 lg:justify-start">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditAppointment(appointment)}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edytuj
                      </Button>
                      <ManualReminderButton
                        appointmentId={appointment.id}
                        patientEmail={appointment.patients.email}
                        disabled={updateStatusMutation.isPending}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadCalendarEvent(appointment.id)}
                        className="flex-1 lg:flex-none"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Pobierz .ics
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setAppointmentToDelete(appointment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

      {/* Edit Appointment Form */}
      <AppointmentForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditingAppointment(null);
        }}
        editingAppointment={editingAppointment}
        onSuccess={() => {
          setIsEditFormOpen(false);
          setEditingAppointment(null);
          refetch();
        }}
      />

      {/* Delete Appointment Confirmation Dialog */}
      <AlertDialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź usunięcie wizyty</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć tę wizytę? Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => appointmentToDelete && deleteAppointment(appointmentToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Usuwanie..." : "Usuń wizytę"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentsList;
