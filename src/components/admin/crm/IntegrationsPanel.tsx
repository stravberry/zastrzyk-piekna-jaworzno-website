
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Settings, Trash2 } from "lucide-react";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useAppointmentReminders } from "@/hooks/useAppointmentReminders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const IntegrationsPanel: React.FC = () => {
  const { 
    integrations, 
    isLoading, 
    authorizeGoogle, 
    isAuthorizing 
  } = useGoogleCalendar();

  const {
    pendingReminders,
    sendReminders,
    isSending
  } = useAppointmentReminders();

  const handleDisconnectGoogle = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_integrations')
        .update({ is_active: false })
        .eq('id', integrationId);

      if (error) throw error;
      
      toast.success('Integracja została rozłączona');
      window.location.reload(); // Refresh to update the list
    } catch (error: any) {
      toast.error(`Błąd: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Synchronizuj wizyty z Google Calendar
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => authorizeGoogle()}
              disabled={isAuthorizing}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isAuthorizing ? 'Łączenie...' : 'Połącz z Google'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Ładowanie integracji...</p>
          ) : integrations && integrations.length > 0 ? (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{integration.owner_email}</p>
                      <p className="text-sm text-gray-500">
                        Połączono: {new Date(integration.created_at).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={integration.is_active ? "default" : "secondary"}>
                      {integration.is_active ? 'Aktywna' : 'Nieaktywna'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectGoogle(integration.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Brak aktywnych integracji. Połącz się z Google Calendar aby synchronizować wizyty.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Email Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-500" />
              <div>
                <CardTitle>Przypomnienia mailowe</CardTitle>
                <CardDescription>
                  Automatyczne wysyłanie przypomnień o wizytach
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => sendReminders()}
              disabled={isSending}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSending ? 'Wysyłanie...' : 'Wyślij przypomnienia'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Oczekujące przypomnienia</p>
                <p className="text-sm text-gray-500">
                  Liczba przypomnień gotowych do wysłania
                </p>
              </div>
              <Badge variant="outline" className="text-lg font-semibold">
                {pendingReminders?.length || 0}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>• Przypomnienia są wysyłane automatycznie 24h i 2h przed wizytą</p>
              <p>• Możesz również wysłać je ręcznie używając przycisku powyżej</p>
              <p>• System sprawdza przypomnienia co godzinę</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <div>
              <CardTitle>Ustawienia</CardTitle>
              <CardDescription>
                Konfiguracja systemu przypomnień i integracji
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Szablony maili:</span>
              <span className="text-green-600">Skonfigurowane</span>
            </div>
            <div className="flex justify-between">
              <span>Automatyczne przypomnienia:</span>
              <span className="text-green-600">Włączone</span>
            </div>
            <div className="flex justify-between">
              <span>Integracja z kalendarzem:</span>
              <span className={integrations?.length ? "text-green-600" : "text-gray-500"}>
                {integrations?.length ? 'Aktywna' : 'Nieaktywna'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPanel;
