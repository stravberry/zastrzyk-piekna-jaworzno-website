import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { CalendarIcon, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type Patient = Tables<"patients">;
type Treatment = Tables<"treatments">;
type Appointment = Tables<"patient_appointments"> & {
  patients: Pick<Tables<"patients">, "first_name" | "last_name" | "phone">;
  treatments: Pick<Tables<"treatments">, "name" | "category">;
};

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Wybierz pacjenta"),
  treatment_id: z.string().min(1, "Wybierz zabieg"),
  scheduled_date: z.date({
    required_error: "Wybierz datę i godzinę",
  }),
  scheduled_time: z.string().min(1, "Wybierz godzinę"),
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

// Helper function to parse date and time
const parseAppointmentDate = (dateString: string) => {
  const appointmentDate = new Date(dateString);
  return {
    date: appointmentDate,
    time: format(appointmentDate, "HH:mm")
  };
};

// Helper function to combine date and time for database
const combineDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':');
  const combined = new Date(date);
  combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return combined.toISOString();
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
        ? new Date(editingAppointment.scheduled_date)
        : undefined,
      scheduled_time: editingAppointment?.scheduled_date 
        ? parseAppointmentDate(editingAppointment.scheduled_date).time
        : "09:00",
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
      const parsedDate = parseAppointmentDate(editingAppointment.scheduled_date);
      form.reset({
        patient_id: editingAppointment.patient_id,
        treatment_id: editingAppointment.treatment_id,
        scheduled_date: new Date(editingAppointment.scheduled_date),
        scheduled_time: parsedDate.time,
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
        scheduled_time: "09:00",
        duration_minutes: 60,
        email_reminders_enabled: true,
        calendar_sync_enabled: true,
        reminder_preferences: { "24h": true, "2h": true }
      });
    }
  }, [editingAppointment, selectedPatient, form]);

  // Fetch treatments from pricing categories to keep them in sync
  const { data: treatments } = useQuery({
    queryKey: ['pricing-treatments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_categories')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) throw error;
      
      // Flatten all items from all categories into a single array
      const allTreatments: any[] = [];
      data?.forEach(category => {
        const items = category.items as any[];
        items?.forEach(item => {
          allTreatments.push({
            id: `${category.id}_${item.name}`, // Unique ID combining category and item
            name: item.name,
            category: category.title,
            description: item.description || null,
            price: parseFloat(item.price?.replace(/[^\d.]/g, '') || '0'),
            duration_minutes: 60, // Default duration
            is_active: true
          });
        });
      });
      
      return allTreatments;
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

      // Combine date and time for database storage
      const scheduledDateTime = combineDateAndTime(data.scheduled_date, data.scheduled_time);

      if (isEditing && editingAppointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('patient_appointments')
          .update({
            patient_id: data.patient_id,
            treatment_id: data.treatment_id,
            scheduled_date: scheduledDateTime,
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
            scheduled_date: scheduledDateTime
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
            scheduled_date: scheduledDateTime,
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

  const groupedTreatments = treatments?.reduce((acc: Record<string, any[]>, treatment: any) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle>{isEditing ? 'Edytuj wizytę' : 'Umów wizytę'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Wszystko pod sobą - mobile first */}
            
            {/* Wybór pacjenta */}
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

            {/* Informacja o wybranym pacjencie */}
            {(selectedPatient || isEditing) && (
              <div className="p-3 bg-gray-50 rounded text-center">
                <p className="font-medium">
                  Pacjent: {selectedPatient ? 
                    `${selectedPatient.first_name} ${selectedPatient.last_name}` : 
                    `${editingAppointment?.patients.first_name} ${editingAppointment?.patients.last_name}`
                  }
                </p>
              </div>
            )}

            {/* Wybór zabiegu */}
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
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {Object.entries(groupedTreatments || {}).map(([category, categoryTreatments]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-sm font-medium text-gray-500 border-b">
                            {category}
                          </div>
                          {Array.isArray(categoryTreatments) && categoryTreatments.map((treatment: any) => (
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

            {/* Opis zabiegu */}
            {selectedTreatment?.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">Opis zabiegu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 text-center">{selectedTreatment.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Data i godzina */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal justify-start",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: undefined })
                            ) : (
                              <span>Wybierz datę</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0" 
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduled_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Godzina *</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Czas trwania i koszt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Status - tylko przy edycji */}
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

            {/* Notatki przed zabiegiem */}
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

            {/* Pola tylko przy edycji */}
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

            {/* Przypomnienia mailowe */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-green-500" />
                  <CardTitle className="text-sm">Przypomnienia mailowe</CardTitle>
                </div>
                <CardDescription className="text-xs text-center">
                  Automatyczne wysyłanie przypomnień pacjentowi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="email_reminders_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-center space-x-3 space-y-0">
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
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="reminder_preferences.24h"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-center space-x-3 space-y-0">
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
                        <FormItem className="flex flex-row items-center justify-center space-x-3 space-y-0">
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

            {/* Synchronizacja z kalendarzem */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  <CardTitle className="text-sm">Synchronizacja z kalendarzem</CardTitle>
                </div>
                <CardDescription className="text-xs text-center">
                  Automatyczne dodawanie do Google Calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="calendar_sync_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-center space-x-3 space-y-0">
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

            {/* Przyciski */}
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <Button 
                type="submit" 
                className="bg-pink-500 hover:bg-pink-600 w-full"
                disabled={isSyncing}
              >
                {isEditing ? 'Zaktualizuj wizytę' : 'Umów wizytę'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="w-full">
                Anuluj
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
