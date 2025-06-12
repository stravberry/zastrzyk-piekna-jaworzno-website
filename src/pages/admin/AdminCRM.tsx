
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PatientsList from "@/components/admin/crm/PatientsList";
import AppointmentsCalendarView from "@/components/admin/crm/AppointmentsCalendarView";
import AllAppointmentsList from "@/components/admin/crm/AllAppointmentsList";
import PatientForm from "@/components/admin/crm/PatientForm";
import AppointmentForm from "@/components/admin/crm/AppointmentForm";
import IntegrationsPanel from "@/components/admin/crm/IntegrationsPanel";
import { Users, Calendar, ClipboardList, Settings } from "lucide-react";

const AdminCRM: React.FC = () => {
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);

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
              <PatientsList onAddPatient={() => setIsPatientFormOpen(true)} />
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
      />

      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={() => setIsAppointmentFormOpen(false)}
      />
    </div>
  );
};

export default AdminCRM;
