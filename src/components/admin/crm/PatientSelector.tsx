import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useDebounce } from "@/hooks/useDebounce";
import { QuickPatientForm } from "./QuickPatientForm";

type Patient = Tables<"patients">;

type SearchResult = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
  last_appointment: string;
};

interface PatientSelectorProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient) => void;
  onClearSelection: () => void;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatient,
  onPatientSelect,
  onClearSelection
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuickForm, setShowQuickForm] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['patient-search', debouncedSearchTerm],
    queryFn: async () => {
      if (debouncedSearchTerm.length < 2) return [];
      
      const { data, error } = await supabase.rpc('search_patients', {
        search_term: debouncedSearchTerm
      });
      
      if (error) throw error;
      return data as SearchResult[];
    },
    enabled: debouncedSearchTerm.length >= 2
  });

  const handlePatientCreated = (patient: Patient) => {
    onPatientSelect(patient);
    setShowQuickForm(false);
    setSearchTerm("");
  };

  const handleSelectSearchResult = async (searchResult: SearchResult) => {
    try {
      // Fetch full patient data
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', searchResult.id)
        .single();
      
      if (error) throw error;
      onPatientSelect(data as Patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  if (selectedPatient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Wybrany pacjent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-semibold">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </h3>
              {selectedPatient.phone && (
                <p className="text-sm text-muted-foreground">
                  Tel: {selectedPatient.phone}
                </p>
              )}
              {selectedPatient.email && (
                <p className="text-sm text-muted-foreground">
                  Email: {selectedPatient.email}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              Zmień
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showQuickForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Dodaj nowego pacjenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuickPatientForm 
            onPatientCreated={handlePatientCreated}
            onCancel={() => setShowQuickForm(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Wybierz pacjenta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Wyszukaj pacjenta (imię, nazwisko, telefon, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowQuickForm(true)}
            className="shrink-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nowy
          </Button>
        </div>

        {isLoading && searchTerm.length >= 2 && (
          <div className="text-center py-4 text-muted-foreground">
            Wyszukiwanie...
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((patient) => (
              <div
                key={patient.id}
                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleSelectSearchResult(patient)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </h4>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      {patient.phone && <span>Tel: {patient.phone}</span>}
                      {patient.email && <span>Email: {patient.email}</span>}
                    </div>
                  </div>
                  <Badge variant="secondary">Wybierz</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && searchResults && searchResults.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nie znaleziono pacjenta</p>
            <Button 
              variant="outline" 
              onClick={() => setShowQuickForm(true)}
              className="mt-2"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Dodaj nowego pacjenta
            </Button>
          </div>
        )}

        {searchTerm.length < 2 && searchTerm.length > 0 && (
          <div className="text-center py-4 text-muted-foreground">
            Wpisz co najmniej 2 znaki
          </div>
        )}

        {searchTerm.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Rozpocznij wyszukiwanie lub</p>
            <Button 
              variant="outline" 
              onClick={() => setShowQuickForm(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Dodaj nowego pacjenta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};