import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import AppointmentsCalendarView from "@/components/admin/crm/AppointmentsCalendarView";
import AppointmentForm from "@/components/admin/crm/AppointmentForm";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminAppointments: React.FC = () => {
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Wizyty</h1>
            <p className="text-sm text-muted-foreground">
              Zarządzaj kalendarzem wizyt i terminami pacjentów
            </p>
          </div>
          
          <Button
            onClick={() => setIsAppointmentFormOpen(true)}
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <CalendarPlus className="w-4 h-4" />
            Dodaj wizytę
          </Button>
        </div>

        <AppointmentsCalendarView onAddAppointment={() => setIsAppointmentFormOpen(true)} />

        <AppointmentForm
          isOpen={isAppointmentFormOpen}
          onClose={() => setIsAppointmentFormOpen(false)}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;