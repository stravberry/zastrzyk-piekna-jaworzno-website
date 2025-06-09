
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Plus } from "lucide-react";
import AppointmentsList from "./AppointmentsList";
import AppointmentsCalendar from "./AppointmentsCalendar";

interface AppointmentsCalendarViewProps {
  onAddAppointment: () => void;
}

const AppointmentsCalendarView: React.FC<AppointmentsCalendarViewProps> = ({ onAddAppointment }) => {
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">Wizyty i Historia</CardTitle>
            <CardDescription className="text-sm">Zarządzaj wizytami w widoku listy lub kalendarza</CardDescription>
          </div>
          <Button 
            onClick={onAddAppointment}
            className="bg-pink-500 hover:bg-pink-600 text-sm w-full sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj wizytę
          </Button>
        </div>
        
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "list" | "calendar")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="list" className="flex items-center gap-2 text-xs sm:text-sm">
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Lista</span>
              <span className="sm:hidden">L</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Kalendarz</span>
              <span className="sm:hidden">K</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <AppointmentsList />
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <AppointmentsCalendar />
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default AppointmentsCalendarView;
