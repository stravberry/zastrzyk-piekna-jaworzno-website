
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import PatientsList from "@/components/admin/crm/PatientsList";
import AppointmentsCalendarView from "@/components/admin/crm/AppointmentsCalendarView";
import AllAppointmentsList from "@/components/admin/crm/AllAppointmentsList";
import PatientForm from "@/components/admin/crm/PatientForm";
import AppointmentForm from "@/components/admin/crm/AppointmentForm";
import IntegrationsPanel from "@/components/admin/crm/IntegrationsPanel";
import ReminderControls from "@/components/admin/crm/ReminderControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { Users, Calendar, ClipboardList, Settings, Search, Mail, Filter, SortAsc, Eye, UserPlus, CalendarPlus, Menu } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Patient = Tables<"patients">;

const AdminCRM: React.FC = () => {
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("patients");
  const isMobile = useIsMobile();

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handlePatientUpdate = () => {
    // This will force a re-render and refresh the data
    setSelectedPatient(null);
    // Temporarily clear and reset search to trigger refetch
    const currentSearch = searchTerm;
    setSearchTerm("");
    setTimeout(() => setSearchTerm(currentSearch), 100);
  };

  const handlePatientFormSuccess = () => {
    setIsPatientFormOpen(false);
    handlePatientUpdate();
  };


  const tabItems = [
    { value: "patients", label: "Pacjenci", icon: Users },
    { value: "appointments", label: "Wizyty", icon: Calendar },
    { value: "all-appointments", label: "Wszystkie wizyty", icon: ClipboardList },
    { value: "reminders", label: "Przypomnienia", icon: Mail },
    { value: "integrations", label: "Integracje", icon: Settings },
  ];

  const getActiveTabLabel = () => {
    const activeTabItem = tabItems.find(item => item.value === activeTab);
    return activeTabItem ? activeTabItem.label : "Menu";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System CRM</h1>
          <p className="text-muted-foreground">
            Zarządzaj pacjentami, wizytami i integracjami
          </p>
        </div>
        
        {/* Quick Actions Popup */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Szybkie akcje
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white z-50" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Szybkie akcje</h4>
                <div className="grid gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => setIsPatientFormOpen(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Dodaj nowego pacjenta
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => setIsAppointmentFormOpen(true)}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Dodaj nową wizytę
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Podgląd statystyk
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Filtrowanie</h4>
                <div className="grid gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2"
                  >
                    <SortAsc className="w-4 h-4" />
                    Sortuj po dacie
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filtruj aktywnych
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Aktywni pacjenci
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Nadchodzące wizyty
                  </Badge>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Burger Menu for all screen sizes */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{getActiveTabLabel()}</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="w-4 h-4" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 md:w-[400px] mt-16">
              <div className="space-y-6 pt-4 px-4">
                <h3 className="text-xl font-semibold mb-6 text-center">Nawigacja</h3>
                <div className="space-y-3">
                  {tabItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.value}
                        variant={activeTab === item.value ? "default" : "ghost"}
                        className="w-full justify-start gap-4 h-12 text-base px-4 py-3"
                        onClick={() => setActiveTab(item.value)}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
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

    </div>
  );
};

export default AdminCRM;
