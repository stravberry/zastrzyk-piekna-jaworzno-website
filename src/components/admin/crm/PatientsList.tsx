
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import PatientForm from "./PatientForm";

type Patient = Tables<"patients">;

interface PatientsListProps {
  searchTerm: string;
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
}

const PatientsList: React.FC<PatientsListProps> = ({ 
  searchTerm, 
  onPatientSelect, 
  selectedPatient 
}) => {
  const [showAddPatient, setShowAddPatient] = useState(false);

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      if (searchTerm.trim()) {
        const { data, error } = await supabase.rpc('search_patients', {
          search_term: searchTerm
        });
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        return data;
      }
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Ładowanie pacjentów...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Znaleziono {patients?.length || 0} pacjentów
        </h3>
        <Button 
          onClick={() => setShowAddPatient(true)}
          size="sm"
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj pacjenta
        </Button>
      </div>

      <div className="grid gap-4">
        {patients?.map((patient) => (
          <Card 
            key={patient.id} 
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedPatient?.id === patient.id ? 'ring-2 ring-pink-500' : ''
            }`}
            onClick={() => onPatientSelect(patient)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">
                    {patient.first_name} {patient.last_name}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-3 h-3 mr-1" />
                        {patient.phone}
                      </div>
                    )}
                    
                    {patient.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-3 h-3 mr-1" />
                        {patient.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    {patient.skin_type && (
                      <Badge variant="secondary">
                        Skóra: {patient.skin_type}
                      </Badge>
                    )}
                    
                    {patient.source && (
                      <Badge variant="outline">
                        Źródło: {patient.source}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(patient.created_at!)}
                  </div>
                  {/* TODO: Add last appointment info */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {patients?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Nie znaleziono pacjentów' : 'Brak pacjentów w systemie'}
          </div>
        )}
      </div>

      {showAddPatient && (
        <PatientForm 
          isOpen={showAddPatient}
          onClose={() => setShowAddPatient(false)}
          onSuccess={() => {
            refetch();
            setShowAddPatient(false);
            toast.success('Pacjent został dodany');
          }}
        />
      )}
    </div>
  );
};

export default PatientsList;
