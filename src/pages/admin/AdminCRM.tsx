
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Clock, Search, Plus, FileText, Camera, List } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import PatientsList from "@/components/admin/crm/PatientsList";
import PatientProfileModal from "@/components/admin/crm/PatientProfileModal";
import AppointmentForm from "@/components/admin/crm/AppointmentForm";
import AppointmentsCalendarView from "@/components/admin/crm/AppointmentsCalendarView";
import AllAppointmentsList from "@/components/admin/crm/AllAppointmentsList";

type Patient = Tables<"patients">;
type Appointment = Tables<"patient_appointments">;
type Treatment = Tables<"treatments">;

const AdminCRM: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [activeTab, setActiveTab] = useState("patients");
  const queryClient = useQueryClient();

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
    // Invalidate all related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['patients'] });
    queryClient.invalidateQueries({ queryKey: ['current-patient'] });
    queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
    
    // Refetch stats
    refetchStats();
  };

  const handleAppointmentSuccess = () => {
    // Invalidate appointment-related queries
    queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['appointments-list'] });
    queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    
    // Refetch stats
    refetchStats();
    setShowAddAppointment(false);
  };

  const handleDataUpdate = () => {
    // Unified function for all data updates
    queryClient.invalidateQueries({ queryKey: ['patients'] });
    queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['appointments-list'] });
    queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    refetchStats();
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CRM Pacjentów</h1>
          <p className="text-sm sm:text-base text-gray-600">Zarządzanie pacjentami i wizytami</p>
        </div>
        <Button 
          onClick={() => setShowAddAppointment(true)} 
          className="bg-pink-500 hover:bg-pink-600 text-sm sm:text-base w-full sm:w-auto"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Umów wizytę
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Wszyscy pacjenci</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">Aktywni pacjenci w systemie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Dzisiejsze wizyty</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Zaplanowanych na dziś</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Wszystkich wizyt</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">W całej historii</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="patients" className="text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Pacjenci</span>
            <span className="sm:hidden">P</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Kalendarz</span>
            <span className="sm:hidden">K</span>
          </TabsTrigger>
          <TabsTrigger value="all-appointments" className="text-xs sm:text-sm">
            <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Wszystkie wizyty</span>
            <span className="sm:hidden">W</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Lista pacjentów</CardTitle>
              <CardDescription className="text-sm">Zarządzaj pacjentami i ich danymi</CardDescription>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po imieniu, nazwisku, telefonie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <PatientsList 
                searchTerm={searchTerm}
                onPatientSelect={handlePatientSelect}
                selectedPatient={selectedPatient}
                onPatientUpdate={handlePatientUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4 mt-4">
          <AppointmentsCalendarView onAddAppointment={() => setShowAddAppointment(true)} />
        </TabsContent>

        <TabsContent value="all-appointments" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Wszystkie wizyty</CardTitle>
              <CardDescription className="text-sm">Chronologiczny spis wszystkich wizyt w systemie</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <AllAppointmentsList onUpdate={handleDataUpdate} />
            </CardContent>
          </Card>
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
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </div>
  );
};

export default AdminCRM;
