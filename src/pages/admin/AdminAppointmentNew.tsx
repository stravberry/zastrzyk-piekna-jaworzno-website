
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { CalendarIcon, ArrowLeft, Save, Mail, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { PatientSelector } from "@/components/admin/crm/PatientSelector";

type Patient = Tables<"patients">;
type Treatment = Tables<"treatments">;

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
  const [treatmentSearchOpen, setTreatmentSearchOpen] = useState(false);
  const { syncAppointment, isSyncing } = useGoogleCalendar();

  // Get patient ID from URL params (both query param and route param)
  const patientIdFromQuery = searchParams.get('patientId');
  const patientIdFromUrl = window.location.pathname.split('/').pop(); // Get last segment
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

  // Fetch treatments from the treatments table
  const { data: treatments } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Treatment[];
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
          treatment_id: data.treatment_id, // Now this will be a proper UUID
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
    <div className="space-y-6">
      {/* Breadcrumbs */}
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/appointments')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Umów nową wizytę</h1>
            <p className="text-muted-foreground">Wybierz pacjenta i umów wizytę</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection */}
        <div className="lg:col-span-1">
          <PatientSelector
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
            onClearSelection={() => setSelectedPatient(null)}
          />
        </div>

        {/* Appointment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Szczegóły wizyty</CardTitle>
              <CardDescription>
                {selectedPatient 
                  ? `Umów wizytę dla: ${selectedPatient.first_name} ${selectedPatient.last_name}`
                  : 'Najpierw wybierz pacjenta'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Treatment Selection */}
                       <div className="md:col-span-2">
                         <FormField
                           control={form.control}
                           name="treatment_id"
                           render={({ field }) => (
                             <FormItem className="flex flex-col">
                               <FormLabel>Zabieg *</FormLabel>
                               <Popover open={treatmentSearchOpen} onOpenChange={setTreatmentSearchOpen}>
                                 <PopoverTrigger asChild>
                                   <FormControl>
                                     <Button
                                       variant="outline"
                                       role="combobox"
                                       aria-expanded={treatmentSearchOpen}
                                       className="w-full justify-between text-left font-normal"
                                     >
                                       {field.value
                                         ? treatments?.find((treatment) => treatment.id === field.value)?.name
                                         : "Wybierz zabieg..."}
                                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                     </Button>
                                   </FormControl>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-full p-0 z-50" align="start">
                                   <Command>
                                     <CommandInput placeholder="Wyszukaj zabieg..." className="h-9" />
                                     <CommandEmpty>Nie znaleziono zabiegu.</CommandEmpty>
                                     <CommandList className="max-h-80 overflow-y-auto">
                                       {Object.entries(groupedTreatments || {}).map(([category, categoryTreatments]) => (
                                         <CommandGroup key={category} heading={category}>
                                           {Array.isArray(categoryTreatments) && categoryTreatments.map((treatment: Treatment) => (
                                             <CommandItem
                                               key={treatment.id}
                                               value={`${treatment.name} ${category}`}
                                               onSelect={() => {
                                                 field.onChange(treatment.id);
                                                 setTreatmentSearchOpen(false);
                                               }}
                                               className="cursor-pointer"
                                             >
                                               <Check
                                                 className={cn(
                                                   "mr-2 h-4 w-4",
                                                   field.value === treatment.id ? "opacity-100" : "opacity-0"
                                                 )}
                                               />
                                               <div className="flex flex-col flex-1">
                                                 <span className="font-medium">{treatment.name}</span>
                                                 {treatment.price && (
                                                   <span className="text-sm text-muted-foreground">{treatment.price} zł</span>
                                                 )}
                                               </div>
                                             </CommandItem>
                                           ))}
                                         </CommandGroup>
                                       ))}
                                     </CommandList>
                                   </Command>
                                 </PopoverContent>
                               </Popover>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       </div>

                      {/* Date and Time */}
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
                            <FormLabel>Godzina *</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
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

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="pre_treatment_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notatki przed zabiegiem</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Dodaj notatki..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Options */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="email_reminders_enabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Wysyłaj przypomnienia email
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="calendar_sync_enabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Synchronizuj z Google Calendar
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Treatment Description */}
                    {selectedTreatment?.description && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Opis zabiegu:</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedTreatment.description}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || isSyncing}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Zapisywanie...' : 'Umów wizytę'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate('/admin/appointments')}
                        disabled={isSubmitting}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Wybierz pacjenta, aby rozpocząć umówienie wizyty</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentNew;
