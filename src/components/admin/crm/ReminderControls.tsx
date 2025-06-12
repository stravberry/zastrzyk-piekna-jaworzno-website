
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { useAppointmentReminders } from "@/hooks/useAppointmentReminders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ReminderControls: React.FC = () => {
  const { pendingReminders, isLoading, sendReminders, isSending } = useAppointmentReminders();
  const [isCreatingMissing, setIsCreatingMissing] = React.useState(false);

  const createMissingReminders = async () => {
    setIsCreatingMissing(true);
    try {
      // Use a direct function call since create_missing_reminders might not be in the types yet
      const { data, error } = await supabase.rpc('create_missing_reminders' as any);
      if (error) throw error;
      
      // Type the response data properly
      const results = data as Array<{
        appointment_id: string;
        appointment_date: string;
        reminders_created: number;
      }>;
      
      const totalCreated = results?.reduce((sum, item) => sum + item.reminders_created, 0) || 0;
      toast.success(`Utworzono ${totalCreated} brakujących przypomnień dla ${results?.length || 0} wizyt`);
      
      // Refresh the reminders list
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating missing reminders:', error);
      toast.error(`Błąd podczas tworzenia przypomnień: ${error.message}`);
    } finally {
      setIsCreatingMissing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <CardTitle className="text-lg">Przypomnienia mailowe</CardTitle>
              <CardDescription>
                Zarządzaj wysyłaniem przypomnień o wizytach
              </CardDescription>
            </div>
          </div>
          <Badge variant={pendingReminders && pendingReminders.length > 0 ? "destructive" : "secondary"}>
            {isLoading ? "..." : pendingReminders?.length || 0} oczekujących
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium text-sm">Status automatycznego wysyłania</p>
              <p className="text-xs text-gray-600">
                Przypomnienia są sprawdzane co 30 minut automatycznie
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">Aktywne</span>
          </div>
        </div>

        {pendingReminders && pendingReminders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {pendingReminders.length} przypomnienia gotowe do wysłania
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {pendingReminders.slice(0, 3).map((reminder: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{reminder.patient_name}</span>
                  <span>{reminder.reminder_type}</span>
                </div>
              ))}
              {pendingReminders.length > 3 && (
                <p>...i {pendingReminders.length - 3} więcej</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={() => sendReminders()}
            disabled={isSending || isLoading}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? "Wysyłanie..." : "Wyślij wszystkie przypomnienia"}
          </Button>
          
          <Button 
            onClick={createMissingReminders}
            disabled={isCreatingMissing || isLoading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isCreatingMissing ? "Tworzenie..." : "Utwórz brakujące przypomnienia"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderControls;
