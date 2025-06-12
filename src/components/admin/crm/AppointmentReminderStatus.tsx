
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
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
      {reminderStatus.map((reminder, index: number) => {
        const getStatusColor = (status: string, deliveryStatus?: string | null) => {
          if (status === 'sent' && deliveryStatus === 'delivered') {
            return 'bg-green-100 text-green-800';
          }
          if (status === 'sent' && deliveryStatus === 'failed') {
            return 'bg-red-100 text-red-800';
          }
          switch (status) {
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };

        const getStatusIcon = (status: string, deliveryStatus?: string | null) => {
          if (status === 'sent' && deliveryStatus === 'delivered') {
            return <CheckCircle className="w-3 h-3" />;
          }
          if (status === 'sent' && deliveryStatus === 'failed') {
            return <XCircle className="w-3 h-3" />;
          }
          switch (status) {
            case 'sent': return <Mail className="w-3 h-3" />;
            case 'pending': return <Clock className="w-3 h-3" />;
            case 'failed': return <XCircle className="w-3 h-3" />;
            default: return <AlertCircle className="w-3 h-3" />;
          }
        };

        const getTooltipText = (reminder: any) => {
          if (reminder.status === 'sent' && reminder.sent_at) {
            return `Wysłano: ${new Date(reminder.sent_at).toLocaleString('pl-PL')}`;
          }
          if (reminder.status === 'failed' && reminder.error_message) {
            return `Błąd: ${reminder.error_message}`;
          }
          if (reminder.status === 'pending') {
            return 'Oczekuje na wysłanie';
          }
          return `Status: ${reminder.status}`;
        };

        return (
          <Badge 
            key={index}
            className={`text-xs flex items-center gap-1 ${getStatusColor(reminder.status, reminder.delivery_status)}`}
            title={getTooltipText(reminder)}
          >
            {getStatusIcon(reminder.status, reminder.delivery_status)}
            {reminder.reminder_type}
          </Badge>
        );
      })}
    </div>
  );
};

export default AppointmentReminderStatus;
