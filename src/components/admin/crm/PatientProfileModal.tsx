import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Camera,
  AlertTriangle,
  Heart,
  X,
  Plus,
  Download,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import AppointmentForm from "./AppointmentForm";
import PatientEditForm from "./PatientEditForm";

type Patient = Tables<"patients">;
type Appointment = Tables<"patient_appointments"> & {
  treatments: Tables<"treatments">;
};

interface PatientProfileModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const PatientProfileModal: React.FC<PatientProfileModalProps> = ({ 
  patient, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch current patient data to ensure we have the latest information
  const { data: currentPatient, refetch: refetchPatient } = useQuery({
    queryKey: ['current-patient', patient?.id],
    queryFn: async () => {
      if (!patient?.id) return null;
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patient.id)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!patient?.id && isOpen
  });

  // Use current patient data if available, fallback to prop
  const displayPatient = currentPatient || patient;

  // Fetch patient appointments
  const { data: appointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['patient-appointments', displayPatient?.id],
    queryFn: async () => {
      if (!displayPatient?.id) return [];
      
      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          *,
          treatments (*)
        `)
        .eq('patient_id', displayPatient.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!displayPatient?.id
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Zaplanowana';
      case 'completed': return 'Zakończona';
      case 'cancelled': return 'Anulowana';
      case 'no_show': return 'Nieobecność';
      default: return status;
    }
  };

  const downloadCalendarEvent = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_ics_event', {
        appointment_id_param: appointmentId
      });

      if (error) throw error;
      
      if (data) {
        const blob = new Blob([data], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wizyta_${appointmentId}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating calendar event:', error);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('patient_appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      // Log the deletion activity
      await supabase.rpc('log_admin_activity', {
        _action: 'delete_appointment',
        _resource_type: 'patient_appointment',
        _resource_id: appointmentId,
        _details: {
          patient_id: displayPatient?.id,
          patient_name: `${displayPatient?.first_name} ${displayPatient?.last_name}`
        }
      });

      toast.success("Wizyta została usunięta");
      refetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error("Błąd podczas usuwania wizyty");
    } finally {
      setIsDeleting(false);
      setAppointmentToDelete(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    refetchPatient(); // Refresh patient data
    onUpdate(); // Notify parent to refresh its data
  };

  const handleAppointmentSuccess = () => {
    refetchAppointments();
    setShowAddAppointment(false);
  };

  if (!displayPatient) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] mx-auto overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {displayPatient.first_name} {displayPatient.last_name}
              </h2>
              <p className="text-gray-600 text-sm">Profil pacjenta</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edytuj dane
              </Button>
              <Button 
                onClick={() => setShowAddAppointment(true)}
                className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nowa wizyta
              </Button>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
              <TabsTrigger value="appointments" className="text-xs sm:text-sm">Wizyty</TabsTrigger>
              <TabsTrigger value="medical" className="text-xs sm:text-sm">Medyczne</TabsTrigger>
              <TabsTrigger value="photos" className="text-xs sm:text-sm">Zdjęcia</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 px-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Dane kontaktowe
                  </h3>
                  
                  {displayPatient.phone && (
                    <div className="flex items-center text-sm sm:text-base">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="break-all">{displayPatient.phone}</span>
                    </div>
                  )}
                  
                  {displayPatient.email && (
                    <div className="flex items-center text-sm sm:text-base">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="break-all">{displayPatient.email}</span>
                    </div>
                  )}
                  
                  {displayPatient.address && (
                    <div className="flex items-start text-sm sm:text-base">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                      <span className="break-words">{displayPatient.address}</span>
                    </div>
                  )}
                  
                  {displayPatient.date_of_birth && (
                    <div className="flex items-center text-sm sm:text-base">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span>{new Date(displayPatient.date_of_birth).toLocaleDateString('pl-PL')}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">Dodatkowe informacje</h3>
                  
                  <div className="space-y-2">
                    {displayPatient.skin_type && (
                      <Badge variant="secondary" className="text-xs">
                        Typ skóry: {displayPatient.skin_type}
                      </Badge>
                    )}
                    
                    {displayPatient.source && (
                      <Badge variant="outline" className="text-xs">
                        Źródło: {displayPatient.source}
                      </Badge>
                    )}
                  </div>

                  {displayPatient.notes && (
                    <div>
                      <h4 className="font-medium text-xs sm:text-sm text-gray-700 mb-1">Notatki:</h4>
                      <p className="text-xs sm:text-sm break-words">{displayPatient.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Historia wizyt</h3>
                <span className="text-sm text-gray-500">
                  {appointments?.length || 0} wizyt
                </span>
              </div>

              <div className="space-y-3">
                {appointments?.map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{appointment.treatments.name}</h4>
                          <Badge className={getStatusColor(appointment.status || 'scheduled')}>
                            {getStatusText(appointment.status || 'scheduled')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          {formatDate(appointment.scheduled_date)}
                        </p>
                        
                        {appointment.cost && (
                          <p className="text-sm font-medium">
                            Koszt: {appointment.cost} zł
                          </p>
                        )}
                        
                        {appointment.post_treatment_notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <FileText className="w-3 h-3 inline mr-1" />
                            {appointment.post_treatment_notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadCalendarEvent(appointment.id)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          .ics
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setAppointmentToDelete(appointment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {(!appointments || appointments.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Brak wizyt w historii
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="grid gap-6">
                {displayPatient.allergies && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                      Alergie
                    </h3>
                    <p className="text-sm bg-orange-50 p-3 rounded">{displayPatient.allergies}</p>
                  </div>
                )}

                {displayPatient.contraindications && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                      Przeciwwskazania
                    </h3>
                    <p className="text-sm bg-red-50 p-3 rounded">{displayPatient.contraindications}</p>
                  </div>
                )}

                {displayPatient.medical_notes && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                      <Heart className="w-5 h-5 mr-2 text-pink-500" />
                      Notatki medyczne
                    </h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">{displayPatient.medical_notes}</p>
                  </div>
                )}

                {!displayPatient.allergies && !displayPatient.contraindications && !displayPatient.medical_notes && (
                  <div className="text-center py-8 text-gray-500">
                    Brak informacji medycznych
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Zdjęcia zabiegów
                </h3>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                Funkcja galerii zdjęć będzie dostępna wkrótce
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Appointment Confirmation Dialog */}
      <AlertDialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź usunięcie wizyty</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć tę wizytę? Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => appointmentToDelete && deleteAppointment(appointmentToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Usuwanie..." : "Usuń wizytę"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isEditing && displayPatient && (
        <PatientEditForm
          patient={displayPatient}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showAddAppointment && (
        <AppointmentForm
          isOpen={showAddAppointment}
          onClose={() => setShowAddAppointment(false)}
          selectedPatient={displayPatient}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </>
  );
};

export default PatientProfileModal;
