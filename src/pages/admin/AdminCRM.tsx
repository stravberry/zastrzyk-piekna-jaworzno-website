
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PatientsList from "@/components/admin/crm/PatientsList";
import AppointmentsCalendarView from "@/components/admin/crm/AppointmentsCalendarView";
import AllAppointmentsList from "@/components/admin/crm/AllAppointmentsList";
import PatientForm from "@/components/admin/crm/PatientForm";
import AppointmentForm from "@/components/admin/crm/AppointmentForm";
import IntegrationsPanel from "@/components/admin/crm/IntegrationsPanel";
import { Users, Calendar, ClipboardList, Settings, Search } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Patient = Tables<"patients">;

const AdminCRM: React.FC = () => {
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handlePatientUpdate = () => {
    // Refresh patient data when patient is updated
    setSelectedPatient(null);
  };

  const handlePatientFormSuccess = () => {
    setIsPatientFormOpen(false);
    handlePatientUpdate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System CRM</h1>
        <p className="text-muted-foreground">
          Zarządzaj pacjentami, wizytami i integracjami
        </p>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Pacjenci
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Wizyty
          </TabsTrigger>
          <TabsTrigger value="all-appointments" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Wszystkie wizyty
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Integracje
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Pacjenci</CardTitle>
              <CardDescription>
                Zarządzaj bazą pacjentów i ich danymi medycznymi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Szukaj pacjentów..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <PatientsList 
                searchTerm={searchTerm}
                onPatientSelect={handlePatientSelect}
                selectedPatient={selectedPatient}
                onPatientUpdate={handlePatientUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentsCalendarView onAddAppointment={() => setIsAppointmentFormOpen(true)} />
        </TabsContent>

        <TabsContent value="all-appointments">
          <Card>
            <CardHeader>
              <CardTitle>Wszystkie wizyty</CardTitle>
              <CardDescription>
                Pełna lista wszystkich wizyt w systemie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AllAppointmentsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integracje i automatyzacja</CardTitle>
                <CardDescription>
                  Konfiguruj przypomnienia mailowe i synchronizację z kalendarzami
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntegrationsPanel />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <PatientForm
        isOpen={isPatientFormOpen}
        onClose={() => setIsPatientFormOpen(false)}
        onSuccess={handlePatientFormSuccess}
      />

      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={() => setIsAppointmentFormOpen(false)}
      />
    </div>
  );
};

export default AdminCRM;
