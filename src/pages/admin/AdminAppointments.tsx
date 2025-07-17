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
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wizyty</h1>
            <p className="text-muted-foreground">
              Zarządzaj kalendarzem wizyt i terminami pacjentów
            </p>
          </div>
          
          <Button
            onClick={() => setIsAppointmentFormOpen(true)}
            className="gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            Dodaj wizytę
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kalendarz wizyt</CardTitle>
            <CardDescription>
              Przegląd wszystkich zaplanowanych wizyt w kalendarzu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentsCalendarView onAddAppointment={() => setIsAppointmentFormOpen(true)} />
          </CardContent>
        </Card>

        <AppointmentForm
          isOpen={isAppointmentFormOpen}
          onClose={() => setIsAppointmentFormOpen(false)}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;