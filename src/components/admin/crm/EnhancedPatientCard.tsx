
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Edit, 
  User, 
  Clock,
  Euro
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Patient = Tables<"patients">;

interface EnhancedPatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onSelect: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

const EnhancedPatientCard: React.FC<EnhancedPatientCardProps> = ({
  patient,
  isSelected,
  onSelect,
  onEdit
}) => {
  // Fetch patient statistics
  const { data: stats, refetch } = useQuery({
    queryKey: ['patient-stats', patient.id],
    queryFn: async () => {
      const { data: appointments, error } = await supabase
        .from('patient_appointments')
        .select('cost, scheduled_date, status')
        .eq('patient_id', patient.id);

      if (error) throw error;

      const totalVisits = appointments?.length || 0;
      const completedVisits = appointments?.filter(apt => apt.status === 'completed').length || 0;
      const totalSpent = appointments?.reduce((sum, apt) => sum + (apt.cost || 0), 0) || 0;
      const lastVisit = appointments?.sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      )[0];

      return {
        totalVisits,
        completedVisits,
        totalSpent,
        lastVisit: lastVisit?.scheduled_date
      };
    },
    // Force a refetch when the component re-renders to keep data fresh
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-pink-500 shadow-md' : ''
      }`}
      onClick={() => onSelect(patient)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with name and edit button */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base flex items-center gap-2 truncate">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              {patient.first_name} {patient.last_name}
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(patient);
            }}
            className="ml-2 flex-shrink-0"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edytuj
          </Button>
        </div>

        {/* Contact information */}
        <div className="space-y-1">
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{patient.phone}</span>
            </div>
          )}
          
          {patient.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
        </div>

        {/* Patient badges */}
        <div className="flex flex-wrap gap-2">
          {patient.skin_type && (
            <Badge variant="secondary" className="text-xs">
              Skóra: {patient.skin_type}
            </Badge>
          )}
          
          {patient.source && (
            <Badge variant="outline" className="text-xs">
              Źródło: {patient.source}
            </Badge>
          )}

          {stats && stats.totalVisits > 0 && (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
              {stats.completedVisits} wizyt
            </Badge>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="border-t pt-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
              <div className="flex justify-between items-center">
                {stats.totalSpent > 0 && (
                  <div className="flex items-center gap-1">
                    <Euro className="w-3 h-3" />
                    <span>{stats.totalSpent} zł</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Dołączył: {formatDate(patient.created_at!)}</span>
                </div>
              </div>
              
              {stats.lastVisit && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Ostatnia wizyta: {formatDate(stats.lastVisit)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPatientCard;
