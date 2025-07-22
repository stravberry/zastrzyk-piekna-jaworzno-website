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
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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


  if (!displayPatient) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] mx-auto overflow-y-auto p-4 sm:p-6">
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
                className="w-full sm:w-auto py-3 text-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edytuj dane
              </Button>
              <Button 
                      onClick={() => {
                        onClose();
                        navigate(`/admin/appointments/new?patientId=${patient.id}`);
                      }}
                className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto py-3 text-sm"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nowa wizyta
              </Button>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="info" className="text-xs sm:text-sm py-3">Info</TabsTrigger>
              <TabsTrigger value="appointments" className="text-xs sm:text-sm py-3">Wizyty</TabsTrigger>
              <TabsTrigger value="medical" className="text-xs sm:text-sm py-3">Medyczne</TabsTrigger>
              <TabsTrigger value="photos" className="text-xs sm:text-sm py-3">Zdjęcia</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 px-1">
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="w-5 h-5 mr-3" />
                    Dane kontaktowe
                  </h3>
                  
                  <div className="space-y-4">
                    {displayPatient.phone && (
                      <div className="flex items-center text-base p-3 bg-white rounded-md">
                        <Phone className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                        <span className="break-all">{displayPatient.phone}</span>
                      </div>
                    )}
                    
                    {displayPatient.email && (
                      <div className="flex items-center text-base p-3 bg-white rounded-md">
                        <Mail className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                        <span className="break-all">{displayPatient.email}</span>
                      </div>
                    )}
                    
                    {displayPatient.address && (
                      <div className="flex items-start text-base p-3 bg-white rounded-md">
                        <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-500 flex-shrink-0" />
                        <span className="break-words">{displayPatient.address}</span>
                      </div>
                    )}
                    
                    {displayPatient.date_of_birth && (
                      <div className="flex items-center text-base p-3 bg-white rounded-md">
                        <Calendar className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                        <span>{new Date(displayPatient.date_of_birth).toLocaleDateString('pl-PL')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <h3 className="text-lg font-semibold">Dodatkowe informacje</h3>
                  
                  <div className="space-y-4">
                    {displayPatient.skin_type && (
                      <div className="p-3 bg-white rounded-md">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          Typ skóry: {displayPatient.skin_type}
                        </Badge>
                      </div>
                    )}
                    
                    {displayPatient.source && (
                      <div className="p-3 bg-white rounded-md">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          Źródło: {displayPatient.source}
                        </Badge>
                      </div>
                    )}

                    {displayPatient.notes && (
                      <div className="p-4 bg-white rounded-md">
                        <h4 className="font-medium text-sm text-gray-700 mb-3">Notatki:</h4>
                        <p className="text-sm break-words leading-relaxed">{displayPatient.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6 p-2">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold">Historia wizyt</h3>
                <span className="text-sm text-gray-500 font-medium">
                  {appointments?.length || 0} wizyt
                </span>
              </div>

              <div className="space-y-6">
                {appointments?.map((appointment) => (
                  <Card key={appointment.id} className="p-6 bg-white border-l-4 border-l-blue-500">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col gap-2">
                            <h4 className="font-semibold text-lg text-gray-900">{appointment.treatments.name}</h4>
                            <Badge className={`${getStatusColor(appointment.status || 'scheduled')} px-3 py-2 text-sm w-fit`}>
                              {getStatusText(appointment.status || 'scheduled')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-base text-gray-700 font-medium">
                              📅 {formatDate(appointment.scheduled_date)}
                            </p>
                            
                            {appointment.cost && (
                              <p className="text-base font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-md inline-block">
                                💰 Koszt: {appointment.cost} zł
                              </p>
                            )}
                          </div>
                          
                          {appointment.post_treatment_notes && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                              <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-base text-gray-700 leading-relaxed">
                                  {appointment.post_treatment_notes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                          <Button 
                            size="default" 
                            variant="outline"
                            onClick={() => downloadCalendarEvent(appointment.id)}
                            className="px-6 py-3 h-auto text-sm font-medium"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Pobierz .ics
                          </Button>
                          <Button 
                            size="default" 
                            variant="outline"
                            onClick={() => setAppointmentToDelete(appointment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 h-auto border-red-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Usuń
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(!appointments || appointments.length === 0) && (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg">Brak wizyt w historii</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="grid gap-6">
                {displayPatient.allergies && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                      Alergie
                    </h3>
                    <p className="text-sm sm:text-base bg-orange-50 p-4 rounded-md">{displayPatient.allergies}</p>
                  </div>
                )}

                {displayPatient.contraindications && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                      Przeciwwskazania
                    </h3>
                    <p className="text-sm sm:text-base bg-red-50 p-4 rounded-md">{displayPatient.contraindications}</p>
                  </div>
                )}

                {displayPatient.medical_notes && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                      <Heart className="w-5 h-5 mr-2 text-pink-500" />
                      Notatki medyczne
                    </h3>
                    <p className="text-sm sm:text-base bg-gray-50 p-4 rounded-md">{displayPatient.medical_notes}</p>
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
        <AlertDialogContent className="p-5 sm:p-6 w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Potwierdź usunięcie wizyty</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base py-2">
              Czy na pewno chcesz usunąć tę wizytę? Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto py-3 text-base">Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => appointmentToDelete && deleteAppointment(appointmentToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto py-3 text-base"
            >
              {isDeleting ? "Usuwanie..." : "Usuń wizytę"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isEditing && displayPatient && (
        <PatientEditForm
          patient={displayPatient}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      )}

    </>
  );
};

export default PatientProfileModal;
