import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Download,
  Edit,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import AppointmentTimeline from "./AppointmentTimeline";
import PatientPhotosSection from "./PatientPhotosSection";

type Patient = Tables<"patients">;
type Appointment = Tables<"patient_appointments"> & {
  treatments: Tables<"treatments">;
};

interface PatientProfileProps {
  patient: Patient;
  onBack?: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ 
  patient, 
  onBack
}) => {
  console.log('[DEBUG] PatientProfile component loaded - FIXED', { patientId: patient?.id });
  const navigate = useNavigate();
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
    enabled: !!patient?.id
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

  const handleEditClick = () => {
    navigate(`/admin/crm/patient/${displayPatient.id}/edit`);
  };


  if (!displayPatient) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Back button */}
        {onBack && (
          <Button 
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć
          </Button>
        )}
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 bg-card p-4 sm:p-6 rounded-xl border shadow-sm mb-6">
          <div className="text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {displayPatient.first_name} {displayPatient.last_name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Profil pacjenta</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
            <Button 
              onClick={handleEditClick}
              variant="outline"
              size="default"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edytuj dane
            </Button>
             <Button 
               onClick={() => navigate(`/admin/appointments/new?patientId=${displayPatient.id}`)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowa wizyta
            </Button>
          </div>
        </div>

        {/* Content - All sections visible on one page */}
        <div className="space-y-8">
          {/* Basic Information Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-6 h-6" />
              Informacje podstawowe
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-3" />
                    Dane kontaktowe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayPatient.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span className="text-lg">{displayPatient.phone}</span>
                    </div>
                  )}
                  
                  {displayPatient.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <span className="text-lg">{displayPatient.email}</span>
                    </div>
                  )}
                  
                  {displayPatient.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                      <span className="text-lg">{displayPatient.address}</span>
                    </div>
                  )}
                  
                  {displayPatient.date_of_birth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span className="text-lg">
                        {new Date(displayPatient.date_of_birth).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dodatkowe informacje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {displayPatient.skin_type && (
                      <div>
                        <Badge variant="secondary" className="px-4 py-2">
                          Typ skóry: {displayPatient.skin_type}
                        </Badge>
                      </div>
                    )}
                    
                    {displayPatient.source && (
                      <div>
                        <Badge variant="outline" className="px-4 py-2">
                          Źródło: {displayPatient.source}
                        </Badge>
                      </div>
                    )}

                    {displayPatient.notes && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-muted-foreground">Notatki:</h4>
                        <p className="text-lg leading-relaxed">{displayPatient.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Appointments Timeline Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Historia wizyt
              {appointments?.length && (
                <Badge variant="secondary" className="ml-2">
                  {appointments.length}
                </Badge>
              )}
            </h2>
            
            <Card>
              <CardContent className="p-6">
                <AppointmentTimeline
                  appointments={appointments || []}
                  onDownloadCalendar={downloadCalendarEvent}
                  onDeleteAppointment={setAppointmentToDelete}
                />
              </CardContent>
            </Card>
          </section>

          {/* Medical Information Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-6 h-6" />
              Informacje medyczne
            </h2>
            
            <div className="grid gap-6">
              {displayPatient.allergies && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Alergie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{displayPatient.allergies}</p>
                  </CardContent>
                </Card>
              )}

              {displayPatient.contraindications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Przeciwwskazania
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{displayPatient.contraindications}</p>
                  </CardContent>
                </Card>
              )}

              {displayPatient.medical_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-pink-600">
                      <Heart className="w-5 h-5 mr-2" />
                      Notatki medyczne
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{displayPatient.medical_notes}</p>
                  </CardContent>
                </Card>
              )}

              {!displayPatient.allergies && !displayPatient.contraindications && !displayPatient.medical_notes && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Brak informacji medycznych</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Photos Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Galeria zdjęć
            </h2>
            
            <PatientPhotosSection patientId={displayPatient.id} />
          </section>
        </div>


        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Usunąć wizytę?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna. Wizyta zostanie trwale usunięta z systemu.
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
      </div>
    </div>
  );
};

export default PatientProfile;