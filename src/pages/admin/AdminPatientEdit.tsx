import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import AdminLayout from "@/components/admin/AdminLayout";
import PatientEditForm from "@/components/admin/crm/PatientEditForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Patient = Tables<"patients">;

const AdminPatientEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error } = useQuery({
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

  const handleBack = () => {
    navigate(`/admin/crm/patient/${id}`);
  };

  const handleCancel = () => {
    navigate(`/admin/crm/patient/${id}`);
  };

  const handleSuccess = () => {
    toast.success('Dane pacjenta zostały zaktualizowane');
    navigate(`/admin/crm/patient/${id}`);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Ładowanie danych pacjenta...</p>
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
            <Button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Wróć do profilu pacjenta
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Button 
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do profilu
        </Button>
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg border">
          <div>
            <h1 className="text-2xl font-bold">
              Edytuj pacjenta: {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-muted-foreground">Zmień dane osobowe i medyczne pacjenta</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white p-6 rounded-lg border">
          <PatientEditForm 
            patient={patient}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPatientEdit;