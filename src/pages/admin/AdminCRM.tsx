
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Clock, Search, Plus, FileText, Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import PatientsList from "@/components/admin/crm/PatientsList";
import PatientProfileModal from "@/components/admin/crm/PatientProfileModal";
import AppointmentForm from "@/components/admin/crm/AppointmentForm";
import TreatmentHistory from "@/components/admin/crm/TreatmentHistory";

type Patient = Tables<"patients">;
type Appointment = Tables<"patient_appointments">;
type Treatment = Tables<"treatments">;

const AdminCRM: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [activeTab, setActiveTab] = useState("patients");

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: async () => {
      const [patientsResult, appointmentsResult, todayAppointmentsResult] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact' }),
        supabase.from('patient_appointments').select('*', { count: 'exact' }),
        supabase.from('patient_appointments')
          .select('*', { count: 'exact' })
          .gte('scheduled_date', new Date().toISOString().split('T')[0])
          .lt('scheduled_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      ]);

      return {
        totalPatients: patientsResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        todayAppointments: todayAppointmentsResult.count || 0
      };
    }
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleClosePatientModal = () => {
    setShowPatientModal(false);
    setSelectedPatient(null);
  };

  const handlePatientUpdate = () => {
    refetchStats(); // Refresh stats when patient is updated
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Pacjentów</h1>
          <p className="text-gray-600">Zarządzanie pacjentami i wizytami</p>
        </div>
        <Button onClick={() => setShowAddAppointment(true)} className="bg-pink-500 hover:bg-pink-600">
          <Plus className="w-4 h-4 mr-2" />
          Umów wizytę
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszyscy pacjenci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">Aktywni pacjenci w systemie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dzisiejsze wizyty</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Zaplanowanych na dziś</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkich wizyt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">W całej historii</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patients">Pacjenci</TabsTrigger>
          <TabsTrigger value="appointments">Wizyty</TabsTrigger>
          <TabsTrigger value="history">Historia zabiegów</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista pacjentów</CardTitle>
              <CardDescription>Zarządzaj pacjentami i ich danymi</CardDescription>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po imieniu, nazwisku, telefonie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <PatientsList 
                searchTerm={searchTerm}
                onPatientSelect={handlePatientSelect}
                selectedPatient={selectedPatient}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nadchodzące wizyty</CardTitle>
              <CardDescription>Przeglądaj i zarządzaj wizytami</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Lista wizyt będzie wyświetlana tutaj
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TreatmentHistory />
        </TabsContent>
      </Tabs>

      {/* Patient Profile Modal */}
      <PatientProfileModal
        patient={selectedPatient}
        isOpen={showPatientModal}
        onClose={handleClosePatientModal}
        onUpdate={handlePatientUpdate}
      />

      {/* Add Appointment Dialog */}
      {showAddAppointment && (
        <AppointmentForm 
          isOpen={showAddAppointment}
          onClose={() => setShowAddAppointment(false)}
          selectedPatient={selectedPatient}
        />
      )}
    </div>
  );
};

export default AdminCRM;
