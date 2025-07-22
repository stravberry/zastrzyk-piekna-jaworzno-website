import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { 
  X, 
  Trash2, 
  Calendar, 
  FileText, 
  Download,
  Edit3
} from "lucide-react";

type TreatmentPhoto = Tables<"treatment_photos"> & {
  patient_appointments: {
    treatments: Tables<"treatments">;
  };
};

interface PhotoViewerProps {
  photo: TreatmentPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photo,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!photo) return null;

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete from storage first
      const urlParts = photo.photo_url.split('/');
      const fileName = urlParts.slice(-3).join('/'); // Get the path after bucket name
      
      const { error: storageError } = await supabase.storage
        .from('treatment-photos')
        .remove([fileName]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('treatment_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      toast.success("Zdjęcie zostało usunięte");
      onDelete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error("Błąd podczas usuwania zdjęcia");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.photo_url;
    link.download = `zabieg_${photo.patient_appointments.treatments.name}_${formatDate(photo.taken_at)}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {photo.patient_appointments.treatments.name}
                <Badge className={`${getPhotoTypeColor(photo.photo_type)} text-xs`}>
                  {getPhotoTypeText(photo.photo_type)}
                </Badge>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image */}
            <div className="relative">
              <img
                src={photo.photo_url}
                alt={photo.description || 'Zdjęcie zabiegu'}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>

            {/* Photo details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Data wykonania: {formatDate(photo.taken_at)}</span>
                </div>

                {photo.description && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Opis:</p>
                      <p className="text-foreground">{photo.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {(photo as any).metadata && typeof (photo as any).metadata === 'object' && Object.keys((photo as any).metadata).length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Szczegóły pliku:</p>
                    {((photo as any).metadata as any).file_name && (
                      <p>Nazwa: {((photo as any).metadata as any).file_name}</p>
                    )}
                    {((photo as any).metadata as any).file_size && (
                      <p>Rozmiar: {Math.round(((photo as any).metadata as any).file_size / 1024)} KB</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Pobierz
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć zdjęcie?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Zdjęcie zostanie trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PhotoViewer;