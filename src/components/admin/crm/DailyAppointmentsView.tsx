import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { 
  Calendar as CalendarIcon, 
  User, 
  CalendarPlus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Edit, 
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { format, isToday, isTomorrow, isYesterday, startOfDay, endOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import AppointmentReminderStatus from "./AppointmentReminderStatus";
import AppointmentForm from "./AppointmentForm";
import QuickStatusChange from "./QuickStatusChange";
import ManualReminderButton from "./ManualReminderButton";
import VisualCalendar from "./VisualCalendar";

type AppointmentWithDetails = Tables<"patient_appointments"> & {
  patients: Tables<"patients">;
  treatments: {
    id: string;
    name: string;
    category: string;
  };
};

type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

const DailyAppointmentsView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch appointments for selected date
  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ['daily-appointments', selectedDate, statusFilter],
    queryFn: async () => {
      const startDate = startOfDay(selectedDate);
      const endDate = endOfDay(selectedDate);

      let query = supabase
        .from('patient_appointments')
        .select(`
          id,
          scheduled_date,
          duration_minutes,
          status,
          cost,
          pre_treatment_notes,
          post_treatment_notes,
          treatment_id,
          patient_id,
          patients!inner (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .order('scheduled_date', { ascending: true });

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        const validStatuses: AppointmentStatus[] = ["scheduled", "completed", "cancelled", "no_show"];
        if (validStatuses.includes(statusFilter as AppointmentStatus)) {
          query = query.eq('status', statusFilter as AppointmentStatus);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get treatment info from the RPC function  
      const { data: treatmentData } = await supabase.rpc('get_available_treatments_from_pricing');
      
      // Create treatment lookup
      const treatmentLookup: Record<string, { name: string; category: string }> = {};
      treatmentData?.forEach(treatment => {
        treatmentLookup[treatment.treatment_id] = {
          name: treatment.name,
          category: treatment.category
        };
      });

      // Map appointments with treatment data
      const appointmentsWithTreatments = data?.map(appointment => ({
        ...appointment,
        treatments: {
          id: appointment.treatment_id,
          name: treatmentLookup[appointment.treatment_id]?.name || 'Nieznany zabieg',
          category: treatmentLookup[appointment.treatment_id]?.category || 'Inne'
        }
      })) as AppointmentWithDetails[] || [];

      return appointmentsWithTreatments;
    },
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) => {
      const { error } = await supabase
        .from('patient_appointments')
        .update({ status })
        .eq('id', appointmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-appointments'] });
      toast.success('Status wizyty został zaktualizowany');
    },
    onError: (error) => {
      console.error('Error updating appointment status:', error);
      toast.error('Nie udało się zaktualizować statusu wizyty');
    },
  });

  // Delete appointment mutation
  const deleteAppointment = async (appointmentId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('patient_appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['daily-appointments'] });
      toast.success('Wizyta została usunięta');
      setAppointmentToDelete(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Nie udało się usunąć wizyty');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStatusChange = (appointmentId: string, status: AppointmentStatus) => {
    updateStatusMutation.mutate({ appointmentId, status });
  };

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setIsEditFormOpen(true);
  };

  const addToCalendar = async (appointmentId: string) => {
    try {
      const appointment = appointmentsData.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      const startDate = new Date(appointment.scheduled_date);
      const endDate = new Date(startDate.getTime() + (appointment.duration_minutes || 60) * 60000);
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const eventDetails = {
        text: `Wizyta: ${appointment.treatments?.name || 'Zabieg'}`,
        dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
        details: `Pacjent: ${appointment.patients?.first_name} ${appointment.patients?.last_name}${appointment.pre_treatment_notes ? '\nNotatki: ' + appointment.pre_treatment_notes : ''}`,
        location: 'Zastrzyk Piękna'
      };

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventDetails.text,
        dates: eventDetails.dates,
        details: eventDetails.details,
        location: eventDetails.location
      });

      const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
      window.open(calendarUrl, '_blank');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error('Błąd podczas dodawania wydarzenia do kalendarza');
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'Zaplanowana';
      case 'completed': return 'Zakończona';
      case 'cancelled': return 'Anulowana';
      case 'no_show': return 'Nieobecność';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: pl });
  };

  const getDateDisplayText = (date: Date) => {
    if (isToday(date)) return 'Dzisiaj';
    if (isTomorrow(date)) return 'Jutro';
    if (isYesterday(date)) return 'Wczoraj';
    return format(date, 'EEEE, d MMMM yyyy', { locale: pl });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const appointments = appointmentsData || [];
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const totalRevenue = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + (apt.cost || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 min-w-0">
      {/* Kalendarz - mobile */}
      <div className="md:hidden">
        <VisualCalendar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate}
          compact
        />
      </div>

      {/* Kalendarz - tablet (większy, niekompaktowy) */}
      <div className="hidden md:block lg:hidden">
        <VisualCalendar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate}
        />
      </div>

      {/* Main Content Container */}
      <div className="lg:flex lg:gap-6 min-w-0">
        {/* Main Content */}
        <div className="lg:flex-1 lg:min-w-0 space-y-4 lg:space-y-6">
        {/* Date Navigation Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="h-9 w-9 p-0 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 flex-1 min-w-0 justify-start gap-2 px-3">
                  <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">
                    {getDateDisplayText(selectedDate)}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="h-9 w-9 p-0 flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 sm:w-40 h-9">
                <SelectValue placeholder="Filtruj status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="scheduled">Zaplanowane</SelectItem>
                <SelectItem value="completed">Zakończone</SelectItem>
                <SelectItem value="cancelled">Anulowane</SelectItem>
                <SelectItem value="no_show">Nieobecności</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="h-9 px-3"
            >
              <span className="hidden sm:inline">Dzisiaj</span>
              <span className="sm:hidden">Dziś</span>
            </Button>
          </div>
        </div>

        {/* Daily Statistics */}
        {totalAppointments > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wizyty</p>
                    <p className="text-xl font-semibold">{totalAppointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Zakończone</p>
                    <p className="text-xl font-semibold">{completedAppointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Przychód</p>
                    <p className="text-xl font-semibold">{totalRevenue.toFixed(2)} zł</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <CalendarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {isToday(selectedDate) 
                        ? "Nie masz dziś zaplanowanych wizyt" 
                        : `Brak wizyt na ${format(selectedDate, 'd MMMM yyyy', { locale: pl })}`
                      }
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {isToday(selectedDate) 
                        ? "Możesz dodać nową wizytę klikając przycisk powyżej" 
                        : "Wybierz inny dzień lub dodaj nową wizytę"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.treatments?.name || 'Nieznany zabieg'}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(appointment.status)} w-fit`}
                        >
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{appointment.patients?.first_name} {appointment.patients?.last_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.scheduled_date)}</span>
                          {appointment.duration_minutes && (
                            <span className="text-gray-400">({appointment.duration_minutes} min)</span>
                          )}
                        </div>
                        {appointment.cost && (
                          <div className="font-medium text-green-600">
                            {appointment.cost.toFixed(2)} zł
                          </div>
                        )}
                      </div>

                      {appointment.pre_treatment_notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Notatki:</strong> {appointment.pre_treatment_notes}
                        </div>
                      )}

                      <AppointmentReminderStatus appointmentId={appointment.id} />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:flex-wrap">
                      <div className="flex gap-2">
                        <QuickStatusChange
                          currentStatus={appointment.status}
                          onStatusChange={(status: AppointmentStatus) => handleQuickStatusChange(appointment.id, status)}
                        />
                        
                        <ManualReminderButton appointmentId={appointment.id} />
                      </div>

                       <div className="flex gap-2 flex-wrap">
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => addToCalendar(appointment.id)}
                           className="text-xs flex-1 sm:flex-initial sm:text-sm"
                         >
                           <CalendarPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                           <span className="hidden sm:inline">Dodaj do kalendarza</span>
                           <span className="sm:hidden">Kalendarz</span>
                         </Button>

                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => handleEditAppointment(appointment as AppointmentWithDetails)}
                           className="text-xs flex-1 sm:flex-initial sm:text-sm"
                         >
                           <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                           <span>Edytuj</span>
                         </Button>

                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => setAppointmentToDelete(appointment.id)}
                           className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs flex-1 sm:flex-initial sm:text-sm"
                         >
                           <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                           <span>Usuń</span>
                         </Button>
                       </div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Appointment Form */}
        {isEditFormOpen && editingAppointment && (
          <AppointmentForm
            isOpen={isEditFormOpen}
            onClose={() => {
              setIsEditFormOpen(false);
              setEditingAppointment(null);
            }}
            onSuccess={() => {
              setIsEditFormOpen(false);
              setEditingAppointment(null);
              refetch();
            }}
            editingAppointment={editingAppointment}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Usuń wizytę</AlertDialogTitle>
              <AlertDialogDescription>
                Czy na pewno chcesz usunąć tę wizytę? Ta akcja nie może zostać cofnięta.
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
        </div>

        {/* Desktop Sidebar Calendar - Show on larger screens */}
        <div className="hidden lg:block lg:w-72 xl:w-80 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-4 xl:top-6">
            <VisualCalendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAppointmentsView;