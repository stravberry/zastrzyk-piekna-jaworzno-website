
import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Video, Image as ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { GalleryImage } from "@/types/gallery";

interface MediaEditDialogProps {
  open: boolean;
  onClose: () => void;
  item: GalleryImage;
  onSuccess: () => void;
}

const MediaEditDialog: React.FC<MediaEditDialogProps> = ({ 
  open, 
  onClose, 
  item, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt_text: '',
    tags: '',
    is_featured: false,
    is_active: false,
    display_order: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        alt_text: item.alt_text || '',
        tags: item.tags?.join(', ') || '',
        is_featured: item.is_featured,
        is_active: item.is_active,
        display_order: item.display_order
      });
    }
  }, [item]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<GalleryImage>) =>
      GalleryService.updateImage(item.id, updates),
    onSuccess: () => {
      toast.success('Media zostały zaktualizowane');
      onSuccess();
    },
    onError: () => {
      toast.error('Błąd podczas aktualizacji mediów');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      title: formData.title,
      description: formData.description,
      alt_text: formData.alt_text,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      display_order: formData.display_order
    };

    updateMutation.mutate(updates);
  };

  const getVideoThumbnail = (item: GalleryImage) => {
    if (item.video_provider === 'youtube') {
      const videoId = item.video_url?.split('v=')[1]?.split('&')[0];
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return item.thumbnail_url || '/placeholder.svg';
  };

  const openVideoInNewTab = () => {
    if (item.video_url) {
      window.open(item.video_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.file_type === 'video' ? (
              <Video className="w-5 h-5" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
            Edytuj {item.file_type === 'video' ? 'film' : 'zdjęcie'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <div className="relative">
              {item.file_type === 'video' ? (
                <div className="relative">
                  <img
                    src={getVideoThumbnail(item)}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                    <Button
                      variant="secondary"
                      onClick={openVideoInNewTab}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Otwórz film
                    </Button>
                  </div>
                </div>
              ) : (
                <img
                  src={item.thumbnail_url || item.webp_url || item.original_url}
                  alt={item.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={item.file_type === 'video' ? 'default' : 'secondary'}>
                {item.file_type === 'video' ? 'Film' : 'Zdjęcie'}
              </Badge>
              
              {item.video_provider && (
                <Badge variant="outline">
                  {item.video_provider.toUpperCase()}
                </Badge>
              )}
              
              {item.category && (
                <Badge variant="outline">
                  {item.category.name}
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              {item.file_type === 'video' ? (
                <>
                  {item.video_duration && (
                    <p>Długość: {Math.floor(item.video_duration / 60)}:{String(item.video_duration % 60).padStart(2, '0')}</p>
                  )}
                  {item.video_url && (
                    <p className="truncate">URL: {item.video_url}</p>
                  )}
                </>
              ) : (
                <>
                  {item.width && item.height && (
                    <p>Wymiary: {item.width}x{item.height}px</p>
                  )}
                  {item.file_size && (
                    <p>Rozmiar: {(item.file_size / 1024).toFixed(1)}KB</p>
                  )}
                </>
              )}
              <p>Utworzono: {new Date(item.created_at).toLocaleDateString('pl-PL')}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Tytuł *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {item.file_type === 'image' && (
              <div>
                <Label htmlFor="alt_text">Tekst alternatywny</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Opis dla czytników ekranu"
                />
              </div>
            )}

            <div>
              <Label htmlFor="tags">Tagi (oddzielone przecinkami)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="np. modelowanie, usta, efekt"
              />
            </div>

            <div>
              <Label htmlFor="display_order">Kolejność wyświetlania</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured" className="text-sm font-medium">
                  Wyróżnione
                </Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Aktywne
                </Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaEditDialog;
