
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    category_id: '',
    is_featured: false,
    is_active: false,
    display_order: 0
  });

  const { data: categories } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: GalleryService.getCategories
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        alt_text: item.alt_text || '',
        tags: item.tags?.join(', ') || '',
        category_id: item.category_id || '',
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
      category_id: formData.category_id || null,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {item.file_type === 'video' ? (
              <Video className="w-5 h-5" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
            Edytuj {item.file_type === 'video' ? 'film' : 'zdjęcie'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Preview */}
          <div className="space-y-4 order-2 lg:order-1">
            <div className="relative">
              {item.file_type === 'video' ? (
                <div className="relative">
                  <img
                    src={getVideoThumbnail(item)}
                    alt={item.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                    <Button
                      variant="secondary"
                      onClick={openVideoInNewTab}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 text-xs sm:text-sm"
                      size="sm"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Otwórz film
                    </Button>
                  </div>
                </div>
              ) : (
                <img
                  src={item.thumbnail_url || item.webp_url || item.original_url}
                  alt={item.title}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant={item.file_type === 'video' ? 'default' : 'secondary'} className="text-xs">
                {item.file_type === 'video' ? 'Film' : 'Zdjęcie'}
              </Badge>
              
              {item.video_provider && (
                <Badge variant="outline" className="text-xs">
                  {item.video_provider.toUpperCase()}
                </Badge>
              )}
              
              {item.category && (
                <Badge variant="outline" className="text-xs">
                  {item.category.name}
                </Badge>
              )}
            </div>

            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
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
          <form onSubmit={handleSubmit} className="space-y-4 order-1 lg:order-2">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Tytuł *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Kategoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Wybierz kategorię..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak kategorii</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Opis</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>

            {item.file_type === 'image' && (
              <div>
                <Label htmlFor="alt_text" className="text-sm font-medium">Tekst alternatywny</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Opis dla czytników ekranu"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="tags" className="text-sm font-medium">Tagi (oddzielone przecinkami)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="np. modelowanie, usta, efekt"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="display_order" className="text-sm font-medium">Kolejność wyświetlania</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>

            <div className="space-y-3 sm:space-y-4">
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

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Anuluj
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
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
