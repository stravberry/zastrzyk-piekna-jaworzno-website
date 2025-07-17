import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import AppointmentsCalendarView from "@/components/admin/crm/AppointmentsCalendarView";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminAppointments: React.FC = () => {

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
            asChild
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <Link to="/admin/appointments/new">
              <CalendarPlus className="w-4 h-4" />
              Dodaj wizytę
            </Link>
          </Button>
        </div>

        <AppointmentsCalendarView />
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;