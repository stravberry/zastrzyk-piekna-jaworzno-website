
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, UserX } from "lucide-react";

interface QuickStatusChangeProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
}

const QuickStatusChange: React.FC<QuickStatusChangeProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'no_show': return <UserX className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'no_show': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Status:</span>
      <Select
        value={currentStatus}
        onValueChange={onStatusChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-auto h-6 text-xs border-none p-1 focus:ring-1">
          <div className={`flex items-center gap-1 ${getStatusColor(currentStatus)}`}>
            {getStatusIcon(currentStatus)}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="scheduled">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-blue-600" />
              Zaplanowana
            </div>
          </SelectItem>
          <SelectItem value="completed">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Zakończona
            </div>
          </SelectItem>
          <SelectItem value="cancelled">
            <div className="flex items-center gap-2">
              <XCircle className="w-3 h-3 text-red-600" />
              Anulowana
            </div>
          </SelectItem>
          <SelectItem value="no_show">
            <div className="flex items-center gap-2">
              <UserX className="w-3 h-3 text-gray-600" />
              Nieobecność
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default QuickStatusChange;
