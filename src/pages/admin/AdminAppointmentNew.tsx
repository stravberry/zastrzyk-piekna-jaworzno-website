import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { CalendarIcon, ArrowLeft, Save, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import { PatientSelector } from "@/components/admin/crm/PatientSelector";

type Patient = Tables<"patients">;

interface Treatment {
  id: string;
  name: string;
  category: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  is_active: boolean;
}

const appointmentSchema = z.object({
  treatment_id: z.string().min(1, "Wybierz zabieg"),
  scheduled_date: z.date({
    required_error: "Wybierz datę i godzinę",
  }),
  scheduled_time: z.string().min(1, "Wybierz godzinę"),
  duration_minutes: z.number().min(1, "Czas trwania musi być większy niż 0"),
  pre_treatment_notes: z.string().optional(),
  cost: z.number().optional(),
  email_reminders_enabled: z.boolean().default(true),
  calendar_sync_enabled: z.boolean().default(true),
  reminder_preferences: z.object({
    "24h": z.boolean().default(true),
    "2h": z.boolean().default(true)
  }).default({ "24h": true, "2h": true })
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

// Helper function to combine date and time for database
const combineDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':');
  const combined = new Date(date);
  combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return combined.toISOString();
};

const AdminAppointmentNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { syncAppointment, isSyncing } = useGoogleCalendar();

  // Get patient ID from URL params
  const patientIdFromQuery = searchParams.get('patientId');
  const patientIdFromUrl = window.location.pathname.split('/').pop();
  const patientId = patientIdFromQuery || (patientIdFromUrl && patientIdFromUrl !== 'new' ? patientIdFromUrl : null);
  
  const { data: urlPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      if (error) throw error;
      return data as Patient;
    },
    enabled: !!patientId
  });

  // Auto-select patient if loaded from URL
  useEffect(() => {
    if (urlPatient && !selectedPatient) {
      setSelectedPatient(urlPatient);
    }
  }, [urlPatient, selectedPatient]);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      scheduled_time: "09:00",
      duration_minutes: 60,
      email_reminders_enabled: true,
      calendar_sync_enabled: true,
      reminder_preferences: { "24h": true, "2h": true }
    }
  });

  // Fetch treatments from pricing categories
  const { data: treatments } = useQuery({
    queryKey: ['available-treatments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_categories')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) throw error;
      
      // Convert pricing categories to treatments format
      const allTreatments: Treatment[] = [];
      data?.forEach(category => {
        const items = category.items as any[];
        items?.forEach(item => {
          allTreatments.push({
            id: `${category.id}_${item.name}`,
            name: item.name,
            category: category.title,
            description: item.description || undefined,
            price: parseFloat(item.price?.replace(/[^\d.]/g, '') || '0'),
            duration_minutes: 60, // Default duration
            is_active: true
          });
        });
      });
      
      return allTreatments;
    }
  });

  const selectedTreatment = treatments?.find(t => t.id === form.watch('treatment_id'));

  // Update duration and cost when treatment changes
  useEffect(() => {
    if (selectedTreatment) {
      form.setValue('duration_minutes', selectedTreatment.duration_minutes || 60);
      form.setValue('cost', selectedTreatment.price ? Number(selectedTreatment.price) : undefined);
    }
  }, [selectedTreatment, form]);

  // Group treatments by category
  const groupedTreatments = treatments?.reduce((acc: Record<string, Treatment[]>, treatment: Treatment) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {} as Record<string, Treatment[]>);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!selectedPatient) {
      toast.error('Wybierz pacjenta');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Combine date and time for database storage
      const scheduledDateTime = combineDateAndTime(data.scheduled_date, data.scheduled_time);

      // Create new appointment
      const { data: newAppointment, error } = await supabase
        .from('patient_appointments')
        .insert({
          patient_id: selectedPatient.id,
          treatment_id: data.treatment_id,
          scheduled_date: scheduledDateTime,
          duration_minutes: data.duration_minutes,
          pre_treatment_notes: data.pre_treatment_notes || null,
          cost: data.cost || null,
          email_reminders_enabled: data.email_reminders_enabled,
          calendar_sync_enabled: data.calendar_sync_enabled,
          reminder_preferences: data.reminder_preferences,
        })
        .select()
        .single();

      if (error) throw error;

      // Synchronizuj z Google Calendar jeśli włączone
      if (data.calendar_sync_enabled && newAppointment.id) {
        syncAppointment(newAppointment.id);
      }

      toast.success('Wizyta została umówiona');
      navigate('/admin/appointments');
    } catch (error: any) {
      toast.error('Błąd podczas umówiania wizyty: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Breadcrumbs - hidden on mobile */}
        <div className="hidden sm:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/appointments">Wizyty</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Nowa wizyta</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/appointments')}
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Powrót</span>
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">Nowa wizyta</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Wybierz pacjenta i umów wizytę</p>
            </div>
          </div>
        </div>

        {/* Mobile-first layout */}
        <div className="space-y-4 sm:space-y-6">
          {/* Patient Selection */}
          <PatientSelector
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
            onClearSelection={() => setSelectedPatient(null)}
          />

          {/* Appointment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Szczegóły wizyty</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {selectedPatient 
                  ? `Umów wizytę dla: ${selectedPatient.first_name} ${selectedPatient.last_name}`
                  : 'Najpierw wybierz pacjenta'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    {/* Treatment Selection */}
                    <FormField
                      control={form.control}
                      name="treatment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Zabieg *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Wybierz zabieg..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {Object.entries(groupedTreatments || {}).map(([category, categoryTreatments]) => (
                                <SelectGroup key={category}>
                                  <SelectLabel className="font-medium">{category}</SelectLabel>
                                  {categoryTreatments.map((treatment) => (
                                    <SelectItem key={treatment.id} value={treatment.id}>
                                      <div className="flex flex-col text-left">
                                        <span className="font-medium">{treatment.name}</span>
                                        {treatment.price && (
                                          <span className="text-xs text-muted-foreground">{treatment.price} zł</span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Treatment Description */}
                    {selectedTreatment?.description && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs sm:text-sm text-muted-foreground">{selectedTreatment.description}</p>
                      </div>
                    )}

                    {/* Date and Time - Mobile stacked layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduled_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-medium">Data *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Wybierz datę</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
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
                            <FormLabel className="text-sm font-medium">Godzina *</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Duration and Cost */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration_minutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Czas trwania (minuty)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="w-full"
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
                            <FormLabel className="text-sm font-medium">Koszt (zł)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="pre_treatment_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Notatki przed zabiegiem</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Dodaj notatki..." 
                              className="resize-none"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email & Calendar Settings */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-sm font-medium">Ustawienia przypomień</h3>
                      
                      <div className="space-y-3">
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
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm">
                                  <Mail className="w-4 h-4 inline mr-2" />
                                  Przypomienia email
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

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
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm">
                                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                                  Synchronizacja z kalendarzem
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch('email_reminders_enabled') && (
                          <div className="ml-6 space-y-2">
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
                                  <FormLabel className="text-xs sm:text-sm">24 godziny przed</FormLabel>
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
                                  <FormLabel className="text-xs sm:text-sm">2 godziny przed</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || isSyncing}
                        className="flex-1 sm:flex-none sm:w-auto"
                      >
                        {(isSubmitting || isSyncing) ? (
                          <>
                            <Save className="w-4 h-4 mr-2 animate-spin" />
                            Zapisywanie...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Umów wizytę
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/appointments')}
                        disabled={isSubmitting}
                        className="sm:hidden"
                      >
                        Anuluj
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Wybierz pacjenta aby umówić wizytę</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointmentNew;