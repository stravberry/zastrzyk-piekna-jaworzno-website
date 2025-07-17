import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type Patient = Tables<"patients">;

const quickPatientSchema = z.object({
  first_name: z.string().min(1, "Imię jest wymagane"),
  last_name: z.string().min(1, "Nazwisko jest wymagane"),
  phone: z.string().optional(),
  email: z.string().email("Nieprawidłowy format email").optional().or(z.literal(""))
}).refine(
  (data) => data.phone || data.email,
  {
    message: "Podaj telefon lub email",
    path: ["phone"]
  }
);

type QuickPatientFormData = z.infer<typeof quickPatientSchema>;

interface QuickPatientFormProps {
  onPatientCreated: (patient: Patient) => void;
  onCancel: () => void;
}

export const QuickPatientForm: React.FC<QuickPatientFormProps> = ({
  onPatientCreated,
  onCancel
}) => {
  const queryClient = useQueryClient();
  
  const form = useForm<QuickPatientFormData>({
    resolver: zodResolver(quickPatientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: ""
    }
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: QuickPatientFormData) => {
      // Check for duplicate email/phone
      if (data.email) {
        const { data: existingEmail } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .eq('email', data.email)
          .eq('is_active', true)
          .single();
        
        if (existingEmail) {
          throw new Error(`Pacjent z tym emailem już istnieje: ${existingEmail.first_name} ${existingEmail.last_name}`);
        }
      }
      
      if (data.phone) {
        const { data: existingPhone } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .eq('phone', data.phone)
          .eq('is_active', true)
          .single();
        
        if (existingPhone) {
          throw new Error(`Pacjent z tym telefonem już istnieje: ${existingPhone.first_name} ${existingPhone.last_name}`);
        }
      }

      // Create new patient
      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          email: data.email || null,
          source: 'other'
        })
        .select()
        .single();

      if (error) throw error;
      return newPatient as Patient;
    },
    onSuccess: (patient) => {
      toast.success(`Pacjent ${patient.first_name} ${patient.last_name} został dodany`);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient-search'] });
      onPatientCreated(patient);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Błąd podczas dodawania pacjenta');
    }
  });

  const onSubmit = (data: QuickPatientFormData) => {
    createPatientMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Imię" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwisko *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nazwisko" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Numer telefonu" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Adres email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <p>ℹ️ Podaj podstawowe dane. Pozostałe informacje można uzupełnić później w sekcji Pacjenci.</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={createPatientMutation.isPending}
            className="flex-1"
          >
            {createPatientMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Dodaj pacjenta
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createPatientMutation.isPending}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </Form>
  );
};