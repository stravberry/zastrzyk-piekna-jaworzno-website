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
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
  cost: z.number().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient?: Patient | null;
  onSuccess?: () => void;
  editingAppointment?: Appointment | null;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  isOpen, 
  onClose, 
  selectedPatient,
  onSuccess,
  editingAppointment 
}) => {
  const isEditing = !!editingAppointment;
  
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: selectedPatient?.id || editingAppointment?.patient_id || "",
      treatment_id: editingAppointment?.treatment_id || "",
      scheduled_date: editingAppointment?.scheduled_date 
        ? new Date(editingAppointment.scheduled_date).toISOString().slice(0, 16)
        : "",
      duration_minutes: editingAppointment?.duration_minutes || 60,
      pre_treatment_notes: editingAppointment?.pre_treatment_notes || "",
      cost: editingAppointment?.cost ? Number(editingAppointment.cost) : undefined,
      status: (editingAppointment?.status as 'scheduled' | 'completed' | 'cancelled') || 'scheduled',
    }
  });

  // Reset form when editingAppointment changes
  React.useEffect(() => {
    if (editingAppointment) {
      form.reset({
        patient_id: editingAppointment.patient_id,
        treatment_id: editingAppointment.treatment_id,
        scheduled_date: new Date(editingAppointment.scheduled_date).toISOString().slice(0, 16),
        duration_minutes: editingAppointment.duration_minutes || 60,
        pre_treatment_notes: editingAppointment.pre_treatment_notes || "",
        cost: editingAppointment.cost ? Number(editingAppointment.cost) : undefined,
        status: (editingAppointment.status as 'scheduled' | 'completed' | 'cancelled') || 'scheduled',
      });
    } else if (selectedPatient) {
      form.reset({
        patient_id: selectedPatient.id,
        duration_minutes: 60,
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
      if (isEditing && editingAppointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('patient_appointments')
          .update({
            patient_id: data.patient_id,
            treatment_id: data.treatment_id,
            scheduled_date: data.scheduled_date,
            duration_minutes: data.duration_minutes,
            pre_treatment_notes: data.pre_treatment_notes || null,
            cost: data.cost || null,
            status: data.status || 'scheduled',
          })
          .eq('id', editingAppointment.id);

        if (error) throw error;
        toast.success('Wizyta została zaktualizowana');
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('patient_appointments')
          .insert({
            patient_id: data.patient_id,
            treatment_id: data.treatment_id,
            scheduled_date: data.scheduled_date,
            duration_minutes: data.duration_minutes,
            pre_treatment_notes: data.pre_treatment_notes || null,
            cost: data.cost || null,
          });

        if (error) throw error;
        toast.success('Wizyta została umówiona');
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edytuj wizytę' : 'Umów wizytę'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {selectedTreatment?.description && (
              <div className="p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-sm mb-1">Opis zabiegu:</h4>
                <p className="text-sm">{selectedTreatment.description}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
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
