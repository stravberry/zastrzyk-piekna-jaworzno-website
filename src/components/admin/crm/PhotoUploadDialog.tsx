import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, X, ImageIcon, Calendar } from "lucide-react";

type Appointment = Tables<"patient_appointments"> & {
  treatments: Tables<"treatments">;
};

interface PhotoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

const PhotoUploadDialog: React.FC<PhotoUploadDialogProps> = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}) => {
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const [photoType, setPhotoType] = useState<string>("before");
  const [description, setDescription] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch patient appointments
  const { data: appointments } = useQuery({
    queryKey: ['patient-appointments-for-photos', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          *,
          treatments (*)
        `)
        .eq('patient_id', patientId)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!patientId && isOpen
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const uploadPhotos = async () => {
    if (!selectedAppointment || photos.length === 0) {
      toast.error("Wybierz wizytę i dodaj co najmniej jedno zdjęcie");
      return;
    }

    setIsUploading(true);
    try {
      for (const photo of photos) {
        // Upload file to storage
        const fileName = `${patientId}/${selectedAppointment}/${Date.now()}_${photo.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('treatment-photos')
          .upload(fileName, photo.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('treatment-photos')
          .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
          .from('treatment_photos')
          .insert({
            appointment_id: selectedAppointment,
            photo_type: photoType as any,
            photo_url: publicUrl,
            description: description || null,
            taken_at: takenAt,
            metadata: {
              file_name: photo.file.name,
              file_size: photo.file.size,
              file_type: photo.file.type,
            }
          });

        if (dbError) throw dbError;
      }

      toast.success(`Dodano ${photos.length} zdjęć`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error("Błąd podczas dodawania zdjęć");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setSelectedAppointment("");
    setPhotoType("before");
    setDescription("");
    setTakenAt(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Dodaj zdjęcia zabiegu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment">Wizyta</Label>
              <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz wizytę" />
                </SelectTrigger>
                <SelectContent>
                  {appointments?.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      <div className="flex flex-col">
                        <span>{appointment.treatments.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(appointment.scheduled_date).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoType">Typ zdjęcia</Label>
              <Select value={photoType} onValueChange={setPhotoType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Przed zabiegiem</SelectItem>
                  <SelectItem value="after">Po zabiegu</SelectItem>
                  <SelectItem value="during">Podczas zabiegu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="takenAt">Data wykonania</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="takenAt"
                  type="date"
                  value={takenAt}
                  onChange={(e) => setTakenAt(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="description">Opis (opcjonalny)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dodaj opis zdjęć..."
                rows={3}
              />
            </div>
          </div>

          {/* File upload area */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Upuść pliki tutaj...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Przeciągnij i upuść zdjęcia lub kliknij, aby wybrać</p>
                <p className="text-sm text-muted-foreground">Obsługiwane formaty: JPG, PNG, WebP</p>
              </div>
            )}
          </div>

          {/* Preview photos */}
          {photos.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">Podgląd zdjęć ({photos.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square relative overflow-hidden rounded-lg border">
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {photo.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button 
            onClick={uploadPhotos} 
            disabled={isUploading || photos.length === 0 || !selectedAppointment}
          >
            {isUploading ? "Dodawanie..." : `Dodaj zdjęcia (${photos.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadDialog;