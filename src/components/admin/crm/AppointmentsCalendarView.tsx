
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Plus } from "lucide-react";
import AppointmentsList from "./AppointmentsList";
import AppointmentsCalendar from "./AppointmentsCalendar";

interface AppointmentsCalendarViewProps {
  onAddAppointment?: () => void;
}

const AppointmentsCalendarView: React.FC<AppointmentsCalendarViewProps> = ({ onAddAppointment }) => {
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-3 sm:space-y-4">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "list" | "calendar")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
          <TabsTrigger value="list" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Lista</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Kalendarz</span>
            <span className="sm:hidden">Kalendarz</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-3 sm:mt-4">
          <AppointmentsList />
        </TabsContent>

        <TabsContent value="calendar" className="mt-3 sm:mt-4">
          <AppointmentsCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsCalendarView;
