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

  // Fetch patient appointments
  const { data: appointments, refetch } = useQuery({
    queryKey: ['patient-appointments', patient?.id],
    queryFn: async () => {
      if (!patient?.id) return [];
      
      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          *,
          treatments (*)
        `)
        .eq('patient_id', patient.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!patient?.id
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
          patient_id: patient?.id,
          patient_name: `${patient?.first_name} ${patient?.last_name}`
        }
      });

      toast.success("Wizyta została usunięta");
      refetch();
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
    onUpdate();
  };

  if (!patient) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {patient.first_name} {patient.last_name}
              </h2>
              <p className="text-gray-600">Profil pacjenta</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edytuj
              </Button>
              <Button 
                onClick={() => setShowAddAppointment(true)}
                className="bg-pink-500 hover:bg-pink-600"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Umów wizytę
              </Button>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Informacje</TabsTrigger>
              <TabsTrigger value="appointments">Wizyty</TabsTrigger>
              <TabsTrigger value="medical">Medyczne</TabsTrigger>
              <TabsTrigger value="photos">Zdjęcia</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Dane kontaktowe
                  </h3>
                  
                  {patient.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  
                  {patient.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  
                  {patient.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                  
                  {patient.date_of_birth && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{new Date(patient.date_of_birth).toLocaleDateString('pl-PL')}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dodatkowe informacje</h3>
                  
                  <div className="space-y-2">
                    {patient.skin_type && (
                      <Badge variant="secondary">
                        Typ skóry: {patient.skin_type}
                      </Badge>
                    )}
                    
                    {patient.source && (
                      <Badge variant="outline">
                        Źródło: {patient.source}
                      </Badge>
                    )}
                  </div>

                  {patient.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Notatki:</h4>
                      <p className="text-sm">{patient.notes}</p>
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
                {patient.allergies && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                      Alergie
                    </h3>
                    <p className="text-sm bg-orange-50 p-3 rounded">{patient.allergies}</p>
                  </div>
                )}

                {patient.contraindications && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                      Przeciwwskazania
                    </h3>
                    <p className="text-sm bg-red-50 p-3 rounded">{patient.contraindications}</p>
                  </div>
                )}

                {patient.medical_notes && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                      <Heart className="w-5 h-5 mr-2 text-pink-500" />
                      Notatki medyczne
                    </h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">{patient.medical_notes}</p>
                  </div>
                )}

                {!patient.allergies && !patient.contraindications && !patient.medical_notes && (
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

      {isEditing && (
        <PatientEditForm
          patient={patient}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showAddAppointment && (
        <AppointmentForm
          isOpen={showAddAppointment}
          onClose={() => setShowAddAppointment(false)}
          selectedPatient={patient}
          onSuccess={() => {
            refetch();
            setShowAddAppointment(false);
          }}
        />
      )}
    </>
  );
};

export default PatientProfileModal;
