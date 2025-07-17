
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
import PatientProfileModal from "@/components/admin/crm/PatientProfileModal";
import ReminderControls from "@/components/admin/crm/ReminderControls";
import { Users, Calendar, ClipboardList, Settings, Search, Mail } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Patient = Tables<"patients">;

const AdminCRM: React.FC = () => {
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientProfileOpen, setIsPatientProfileOpen] = useState(false);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientProfileOpen(true);
  };

  const handlePatientUpdate = () => {
    // Refresh patient data when patient is updated
    setSelectedPatient(null);
  };

  const handlePatientFormSuccess = () => {
    setIsPatientFormOpen(false);
    handlePatientUpdate();
  };

  const handleProfileClose = () => {
    setIsPatientProfileOpen(false);
    setSelectedPatient(null);
  };

  const handleProfileUpdate = () => {
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
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-[600px] grid-cols-5 h-auto p-1">
            <TabsTrigger value="patients" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Pacjenci</span>
              <span className="sm:hidden">P</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Wizyty</span>
              <span className="sm:hidden">W</span>
            </TabsTrigger>
            <TabsTrigger value="all-appointments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3">
              <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden lg:inline">Wszystkie wizyty</span>
              <span className="lg:hidden">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Przypomnienia</span>
              <span className="sm:hidden">Mail</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Integracje</span>
              <span className="sm:hidden">Set</span>
            </TabsTrigger>
          </TabsList>
        </div>

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
                Pełna lista wszystkich wizyt w systemie z statusem przypomnień
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AllAppointmentsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <div className="space-y-6">
            <ReminderControls />
          </div>
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

      <PatientProfileModal
        patient={selectedPatient}
        isOpen={isPatientProfileOpen}
        onClose={handleProfileClose}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default AdminCRM;
