import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Camera, Plus, Calendar, FileText } from "lucide-react";
import PhotoUploadDialog from "./PhotoUploadDialog";
import PhotoViewer from "./PhotoViewer";

type TreatmentPhoto = Tables<"treatment_photos"> & {
  patient_appointments: {
    treatments: Tables<"treatments">;
  };
};

interface PatientPhotosSectionProps {
  patientId: string;
}

const PatientPhotosSection: React.FC<PatientPhotosSectionProps> = ({ patientId }) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<TreatmentPhoto | null>(null);

  const { data: photos, refetch: refetchPhotos } = useQuery({
    queryKey: ['patient-photos', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('treatment_photos')
        .select(`
          *,
          patient_appointments!inner (
            patient_id,
            treatments (*)
          )
        `)
        .eq('patient_appointments.patient_id', patientId)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      return data as TreatmentPhoto[];
    },
    enabled: !!patientId
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPhotoTypeText = (type: string) => {
    switch (type) {
      case 'before': return 'Przed zabiegiem';
      case 'after': return 'Po zabiegu';
      case 'during': return 'Podczas zabiegu';
      default: return 'Inne';
    }
  };

  const getPhotoTypeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-orange-100 text-orange-800';
      case 'after': return 'bg-green-100 text-green-800';
      case 'during': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Galeria zdjęć zabiegów
            </CardTitle>
            <Button 
              onClick={() => setShowUploadDialog(true)}
              className="w-fit"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj zdjęcia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {photos && photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card 
                  key={photo.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || 'Zdjęcie zabiegu'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getPhotoTypeColor(photo.photo_type)} text-xs`}>
                        {getPhotoTypeText(photo.photo_type)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {photo.patient_appointments.treatments.name}
                      </h4>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(photo.taken_at)}</span>
                      </div>
                      
                      {photo.description && (
                        <div className="flex items-start gap-1 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2">{photo.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Brak zdjęć</p>
              <p className="text-sm">Dodaj pierwsze zdjęcia zabiegów dla tego pacjenta</p>
            </div>
          )}
        </CardContent>
      </Card>

      <PhotoUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        patientId={patientId}
        onSuccess={() => {
          refetchPhotos();
          setShowUploadDialog(false);
        }}
      />

      <PhotoViewer
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onDelete={() => {
          refetchPhotos();
          setSelectedPhoto(null);
        }}
      />
    </div>
  );
};

export default PatientPhotosSection;