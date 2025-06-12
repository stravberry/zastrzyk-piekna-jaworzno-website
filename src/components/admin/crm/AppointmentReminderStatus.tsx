
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, Clock, XCircle } from "lucide-react";
import { useReminderStatus } from "@/hooks/useReminderStatus";

interface AppointmentReminderStatusProps {
  appointmentId: string;
}

const AppointmentReminderStatus: React.FC<AppointmentReminderStatusProps> = ({ appointmentId }) => {
  const { data: reminderStatus, isLoading } = useReminderStatus(appointmentId);

  if (isLoading) {
    return <Badge variant="outline" className="text-xs">Ładowanie...</Badge>;
  }

  if (!reminderStatus || reminderStatus.length === 0) {
    return <Badge variant="outline" className="text-xs">Brak przypomnień</Badge>;
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {reminderStatus.map((reminder: any, index: number) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'sent': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };

        const getStatusIcon = (status: string) => {
          switch (status) {
            case 'sent': return <CheckCircle className="w-3 h-3" />;
            case 'pending': return <Clock className="w-3 h-3" />;
            case 'failed': return <XCircle className="w-3 h-3" />;
            default: return <Mail className="w-3 h-3" />;
          }
        };

        return (
          <Badge 
            key={index}
            className={`text-xs flex items-center gap-1 ${getStatusColor(reminder.status)}`}
            title={reminder.sent_at ? `Wysłano: ${new Date(reminder.sent_at).toLocaleString('pl-PL')}` : 'Oczekuje na wysłanie'}
          >
            {getStatusIcon(reminder.status)}
            {reminder.reminder_type}
          </Badge>
        );
      })}
    </div>
  );
};

export default AppointmentReminderStatus;
