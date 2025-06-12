import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Calendar, Mail } from "lucide-react";

type Patient = Tables<"patients">;
type Treatment = Tables<"treatments">;
type Appointment = Tables<"patient_appointments"> & {
  patients: Pick<Tables<"patients">, "first_name" | "last_name" | "phone">;
  treatments: Pick<Tables<"treatments">, "name" | "category">;
};

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Wybierz pacjenta"),
  treatment_id: z.string().min(1, "Wybierz zabieg"),
  scheduled_date: z.string().min(1, "Wybierz datę i godzinę"),
  duration_minutes: z.number().min(1, "Czas trwania musi być większy niż 0"),
  pre_treatment_notes: z.string().optional(),
  post_treatment_notes: z.string().optional(),
  products_used: z.string().optional(),
  cost: z.number().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  email_reminders_enabled: z.boolean().default(true),
  calendar_sync_enabled: z.boolean().default(true),
  reminder_preferences: z.object({
    "24h": z.boolean().default(true),
    "2h": z.boolean().default(true)
  }).default({ "24h": true, "2h": true })
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient?: Patient | null;
  onSuccess?: () => void;
  editingAppointment?: Appointment | null;
}

// Helper function to format date for datetime-local input (keeps local timezone)
const formatDateTimeLocal = (date: string | Date) => {
  const d = new Date(date);
  // Get timezone offset in minutes
  const timezoneOffset = d.getTimezoneOffset();
  // Adjust for timezone to get local time
  const localTime = new Date(d.getTime() - (timezoneOffset * 60000));
  return localTime.toISOString().slice(0, 16);
};

// Helper function to convert datetime-local to UTC for database
const convertToUTC = (localDateString: string) => {
  // Create date object from local datetime string
  const localDate = new Date(localDateString);
  return localDate.toISOString();
};

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  isOpen, 
  onClose, 
  selectedPatient,
  onSuccess,
  editingAppointment 
}) => {
  const isEditing = !!editingAppointment;
  const { syncAppointment, isSyncing } = useGoogleCalendar();
  
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: selectedPatient?.id || editingAppointment?.patient_id || "",
      treatment_id: editingAppointment?.treatment_id || "",
      scheduled_date: editingAppointment?.scheduled_date 
        ? formatDateTimeLocal(editingAppointment.scheduled_date)
        : "",
      duration_minutes: editingAppointment?.duration_minutes || 60,
      pre_treatment_notes: editingAppointment?.pre_treatment_notes || "",
      post_treatment_notes: editingAppointment?.post_treatment_notes || "",
      products_used: editingAppointment?.products_used || "",
      cost: editingAppointment?.cost ? Number(editingAppointment.cost) : undefined,
      status: (editingAppointment?.status as 'scheduled' | 'completed' | 'cancelled' | 'no_show') || 'scheduled',
      email_reminders_enabled: editingAppointment?.email_reminders_enabled ?? true,
      calendar_sync_enabled: editingAppointment?.calendar_sync_enabled ?? true,
      reminder_preferences: editingAppointment?.reminder_preferences as any || { "24h": true, "2h": true }
    }
  });

  // Reset form when editingAppointment changes
  React.useEffect(() => {
    if (editingAppointment) {
      form.reset({
        patient_id: editingAppointment.patient_id,
        treatment_id: editingAppointment.treatment_id,
        scheduled_date: formatDateTimeLocal(editingAppointment.scheduled_date),
        duration_minutes: editingAppointment.duration_minutes || 60,
        pre_treatment_notes: editingAppointment.pre_treatment_notes || "",
        post_treatment_notes: editingAppointment.post_treatment_notes || "",
        products_used: editingAppointment.products_used || "",
        cost: editingAppointment.cost ? Number(editingAppointment.cost) : undefined,
        status: (editingAppointment.status as 'scheduled' | 'completed' | 'cancelled' | 'no_show') || 'scheduled',
        email_reminders_enabled: editingAppointment.email_reminders_enabled ?? true,
        calendar_sync_enabled: editingAppointment.calendar_sync_enabled ?? true,
        reminder_preferences: editingAppointment.reminder_preferences as any || { "24h": true, "2h": true }
      });
    } else if (selectedPatient) {
      form.reset({
        patient_id: selectedPatient.id,
        duration_minutes: 60,
        email_reminders_enabled: true,
        calendar_sync_enabled: true,
        reminder_preferences: { "24h": true, "2h": true }
      });
    }
  }, [editingAppointment, selectedPatient, form]);

  // Fetch treatments
  const { data: treatments } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as Treatment[];
    }
  });

  // Fetch patients if no patient is selected
  const { data: patients } = useQuery({
    queryKey: ['patients-for-appointment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('is_active', true)
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data as Patient[];
    },
    enabled: !selectedPatient
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      let appointmentId;

      // Convert local datetime to UTC for database storage
      const utcScheduledDate = convertToUTC(data.scheduled_date);

      if (isEditing && editingAppointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('patient_appointments')
          .update({
            patient_id: data.patient_id,
            treatment_id: data.treatment_id,
            scheduled_date: utcScheduledDate,
            duration_minutes: data.duration_minutes,
            pre_treatment_notes: data.pre_treatment_notes || null,
            post_treatment_notes: data.post_treatment_notes || null,
            products_used: data.products_used || null,
            cost: data.cost || null,
            status: data.status || 'scheduled',
            email_reminders_enabled: data.email_reminders_enabled,
            calendar_sync_enabled: data.calendar_sync_enabled,
            reminder_preferences: data.reminder_preferences,
          })
          .eq('id', editingAppointment.id);

        if (error) throw error;
        appointmentId = editingAppointment.id;
        
        // Log the update activity
        await supabase.rpc('log_admin_activity', {
          _action: 'update_appointment',
          _resource_type: 'patient_appointment',
          _resource_id: editingAppointment.id,
          _details: {
            patient_id: data.patient_id,
            treatment_id: data.treatment_id,
            status: data.status,
            scheduled_date: utcScheduledDate
          }
        });
        
        toast.success('Wizyta została zaktualizowana');
      } else {
        // Create new appointment
        const { data: newAppointment, error } = await supabase
          .from('patient_appointments')
          .insert({
            patient_id: data.patient_id,
            treatment_id: data.treatment_id,
            scheduled_date: utcScheduledDate,
            duration_minutes: data.duration_minutes,
            pre_treatment_notes: data.pre_treatment_notes || null,
            post_treatment_notes: data.post_treatment_notes || null,
            products_used: data.products_used || null,
            cost: data.cost || null,
            email_reminders_enabled: data.email_reminders_enabled,
            calendar_sync_enabled: data.calendar_sync_enabled,
            reminder_preferences: data.reminder_preferences,
          })
          .select()
          .single();

        if (error) throw error;
        appointmentId = newAppointment.id;
        toast.success('Wizyta została umówiona');
      }

      // Synchronizuj z Google Calendar jeśli włączone
      if (data.calendar_sync_enabled && appointmentId) {
        syncAppointment(appointmentId);
      }
      
      form.reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error('Błąd podczas ' + (isEditing ? 'aktualizacji' : 'umówienia') + ' wizyty: ' + error.message);
    }
  };

  const selectedTreatment = treatments?.find(t => t.id === form.watch('treatment_id'));

  // Update duration and cost when treatment changes
  React.useEffect(() => {
    if (selectedTreatment) {
      form.setValue('duration_minutes', selectedTreatment.duration_minutes || 60);
      form.setValue('cost', selectedTreatment.price ? Number(selectedTreatment.price) : undefined);
    }
  }, [selectedTreatment, form]);

  const groupedTreatments = treatments?.reduce((acc, treatment) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {} as Record<string, Treatment[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edytuj wizytę' : 'Umów wizytę'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Podstawowe informacje */}
              <div className="space-y-4">
                {!selectedPatient && !isEditing && (
                  <FormField
                    control={form.control}
                    name="patient_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pacjent *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz pacjenta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients?.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.first_name} {patient.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(selectedPatient || isEditing) && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">
                      Pacjent: {selectedPatient ? 
                        `${selectedPatient.first_name} ${selectedPatient.last_name}` : 
                        `${editingAppointment?.patients.first_name} ${editingAppointment?.patients.last_name}`
                      }
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="treatment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zabieg *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz zabieg" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(groupedTreatments || {}).map(([category, categoryTreatments]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-sm font-medium text-gray-500 border-b">
                                {category}
                              </div>
                              {categoryTreatments.map((treatment) => (
                                <SelectItem key={treatment.id} value={treatment.id}>
                                  {treatment.name} {treatment.price && `(${treatment.price} zł)`}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduled_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data i godzina *</FormLabel>
                        <FormControl>
                          <Input {...field} type="datetime-local" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Czas trwania (minuty)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditing && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="scheduled">Zaplanowana</SelectItem>
                            <SelectItem value="completed">Zakończona</SelectItem>
                            <SelectItem value="cancelled">Anulowana</SelectItem>
                            <SelectItem value="no_show">Nieobecność</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Koszt (zł)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pre_treatment_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notatki przed zabiegiem</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Dodatkowe informacje, przygotowanie..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <>
                    <FormField
                      control={form.control}
                      name="products_used"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produkty użyte podczas zabiegu</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Lista produktów użytych podczas zabiegu..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="post_treatment_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notatki po zabiegu</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Przebieg zabiegu, obserwacje, zalecenia..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Konfiguracja przypomnień i integracji */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      <CardTitle className="text-sm">Przypomnienia mailowe</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Automatyczne wysyłanie przypomnień pacjentowi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <FormField
                      control={form.control}
                      name="email_reminders_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Włącz przypomnienia mailowe
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {form.watch('email_reminders_enabled') && (
                      <div className="space-y-2 pl-6">
                        <FormField
                          control={form.control}
                          name="reminder_preferences.24h"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Przypomnienie 24h wcześniej
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="reminder_preferences.2h"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Przypomnienie 2h wcześniej
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <CardTitle className="text-sm">Synchronizacja z kalendarzem</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Automatyczne dodawanie do Google Calendar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="calendar_sync_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Synchronizuj z Google Calendar
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {selectedTreatment?.description && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Opis zabiegu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600">{selectedTreatment.description}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button 
                type="submit" 
                className="bg-pink-500 hover:bg-pink-600"
                disabled={isSyncing}
              >
                {isEditing ? 'Zaktualizuj wizytę' : 'Umów wizytę'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
