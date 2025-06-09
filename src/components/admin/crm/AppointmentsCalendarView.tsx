
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
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Wizyty i Historia</CardTitle>
            <CardDescription>Zarządzaj wizytami w widoku listy lub kalendarza</CardDescription>
          </div>
          <Button 
            onClick={onAddAppointment}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj wizytę
          </Button>
        </div>
        
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "list" | "calendar")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Kalendarz
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
