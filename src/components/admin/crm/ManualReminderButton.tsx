
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ChevronDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ManualReminderButtonProps {
  appointmentId: string;
  patientEmail?: string;
  disabled?: boolean;
}

const ManualReminderButton: React.FC<ManualReminderButtonProps> = ({
  appointmentId,
  patientEmail,
  disabled
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendReminder = async (reminderType: '24h' | '2h' | 'confirmation') => {
    if (!patientEmail) {
      toast.error('Pacjent nie ma podanego adresu email');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-manual-reminder', {
        body: {
          appointmentId,
          reminderType
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Przypomnienie zostało wysłane pomyślnie!');
      } else {
        throw new Error(data?.error || 'Wystąpił błąd podczas wysyłania');
      }
    } catch (error: any) {
      console.error('Error sending manual reminder:', error);
      const errorMessage = error.message || 'Wystąpił błąd podczas wysyłania przypomnienia';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case '24h': return 'Przypomnienie 24h';
      case '2h': return 'Przypomnienie 2h';
      case 'confirmation': return 'Potwierdzenie wizyty';
      default: return type;
    }
  };

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case '24h': return <Clock className="w-3 h-3" />;
      case '2h': return <AlertCircle className="w-3 h-3" />;
      case 'confirmation': return <CheckCircle className="w-3 h-3" />;
      default: return <Mail className="w-3 h-3" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || isSending || !patientEmail}
          className="text-xs px-2 py-1"
        >
          {isSending ? (
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              Wysyłanie...
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Wyślij
              <ChevronDown className="w-3 h-3" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(['24h', '2h', 'confirmation'] as const).map((type) => (
          <DropdownMenuItem
            key={type}
            onClick={() => handleSendReminder(type)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {getReminderTypeIcon(type)}
            {getReminderTypeLabel(type)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ManualReminderButton;
