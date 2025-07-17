import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
  Menu
} from "lucide-react";
import { toast } from "sonner";
import AppointmentForm from "./AppointmentForm";
import PatientEditForm from "./PatientEditForm";

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
    refetchPatient();
  };

  const handleAppointmentSuccess = () => {
    refetchAppointments();
    setShowAddAppointment(false);
  };

  if (!displayPatient) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 bg-white p-6 rounded-lg border">
        <div className="flex items-start gap-4">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="outline"
              size="sm"
              className="mt-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {displayPatient.first_name} {displayPatient.last_name}
            </h1>
            <p className="text-muted-foreground">Profil pacjenta</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="default"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edytuj dane
          </Button>
          <Button 
            onClick={() => setShowAddAppointment(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowa wizyta
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="info" className="space-y-6">
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="w-4 h-4" />
                Wybierz zakładkę
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-background">
              <TabsTrigger value="info" asChild>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Informacje
                </DropdownMenuItem>
              </TabsTrigger>
              <TabsTrigger value="appointments" asChild>
                <DropdownMenuItem className="cursor-pointer">
                  <Calendar className="w-4 h-4 mr-2" />
                  Wizyty
                </DropdownMenuItem>
              </TabsTrigger>
              <TabsTrigger value="medical" asChild>
                <DropdownMenuItem className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Medyczne
                </DropdownMenuItem>
              </TabsTrigger>
              <TabsTrigger value="photos" asChild>
                <DropdownMenuItem className="cursor-pointer">
                  <Camera className="w-4 h-4 mr-2" />
                  Zdjęcia
                </DropdownMenuItem>
              </TabsTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-3" />
                  Dane kontaktowe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              <CardContent className="space-y-6">
                <div className="space-y-4">
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
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historia wizyt</CardTitle>
              <CardDescription>
                {appointments?.length || 0} wizyt w systemie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {appointments?.map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="space-y-2">
                            <h4 className="text-xl font-semibold">{appointment.treatments.name}</h4>
                            <Badge className={`${getStatusColor(appointment.status || 'scheduled')} px-3 py-1 text-sm w-fit`}>
                              {getStatusText(appointment.status || 'scheduled')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <p className="text-lg text-muted-foreground">
                              📅 {formatDate(appointment.scheduled_date)}
                            </p>
                            
                            {appointment.cost && (
                              <p className="text-lg font-semibold text-green-600">
                                💰 Koszt: {appointment.cost} zł
                              </p>
                            )}
                          </div>
                          
                          {appointment.post_treatment_notes && (
                            <div className="p-4 bg-muted rounded-lg border-l-4 border-l-blue-500">
                              <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                <p className="text-base leading-relaxed">
                                  {appointment.post_treatment_notes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => downloadCalendarEvent(appointment.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Pobierz .ics
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setAppointmentToDelete(appointment.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Usuń
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!appointments || appointments.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">Brak wizyt w historii</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
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
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg">Brak informacji medycznych</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Zdjęcia zabiegów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Funkcja galerii zdjęć będzie dostępna wkrótce</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms and Modals */}
      {showAddAppointment && (
        <AppointmentForm
          isOpen={showAddAppointment}
          onClose={() => setShowAddAppointment(false)}
          onSuccess={handleAppointmentSuccess}
          selectedPatient={displayPatient}
        />
      )}

      {isEditing && (
        <PatientEditForm
          patient={displayPatient}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Appointment Confirmation Dialog */}
      <AlertDialog 
        open={!!appointmentToDelete} 
        onOpenChange={() => setAppointmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń wizytę</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć tę wizytę? Ta akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => appointmentToDelete && deleteAppointment(appointmentToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientProfile;