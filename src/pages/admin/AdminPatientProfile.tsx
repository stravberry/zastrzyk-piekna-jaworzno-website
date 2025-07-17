import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import AdminLayout from "@/components/admin/AdminLayout";
import PatientProfile from "@/components/admin/crm/PatientProfile";
import { toast } from "sonner";

type Patient = Tables<"patients">;

const AdminPatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error, refetch } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required');
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id
  });

  const handleUpdate = () => {
    refetch();
  };

  const handleBack = () => {
    navigate('/admin/crm');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Ładowanie profilu pacjenta...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !patient) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-destructive">Nie znaleziono pacjenta</h2>
            <p className="text-muted-foreground">
              {error ? 'Wystąpił błąd podczas ładowania danych pacjenta.' : 'Pacjent o podanym ID nie istnieje.'}
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Wróć do listy pacjentów
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PatientProfile 
        patient={patient} 
        onBack={handleBack}
      />
    </AdminLayout>
  );
};

export default AdminPatientProfile;