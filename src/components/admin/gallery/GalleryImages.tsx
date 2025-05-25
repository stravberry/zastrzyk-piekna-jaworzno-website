
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import type { GalleryImage } from "@/types/gallery";

interface GalleryImagesProps {
  selectedCategoryId?: string;
}

const GalleryImages: React.FC<GalleryImagesProps> = ({ selectedCategoryId }) => {
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>(selectedCategoryId || '');

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: GalleryService.getCategories
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery-images', filterCategory],
    queryFn: () => GalleryService.getImages(filterCategory || undefined)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GalleryImage> }) =>
      GalleryService.updateImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success('Zdjęcie zostało zaktualizowane');
      setIsDialogOpen(false);
      setEditingImage(null);
    },
    onError: (error) => {
      toast.error('Błąd podczas aktualizacji zdjęcia');
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: GalleryService.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success('Zdjęcie zostało usunięte');
    },
    onError: (error) => {
      toast.error('Błąd podczas usuwania zdjęcia');
      console.error(error);
    }
  });

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      alt_text: formData.get('alt_text') as string,
      category_id: formData.get('category_id') as string,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      is_featured: formData.get('is_featured') === 'on',
      is_active: formData.get('is_active') === 'on',
      display_order: parseInt(formData.get('display_order') as string)
    };

    updateMutation.mutate({ id: editingImage.id, updates });
  };

  const handleDelete = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć to zdjęcie? Ta operacja jest nieodwracalna.')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleFeatured = (image: GalleryImage) => {
    updateMutation.mutate({
      id: image.id,
      updates: { is_featured: !image.is_featured }
    });
  };

  const toggleActive = (image: GalleryImage) => {
    updateMutation.mutate({
      id: image.id,
      updates: { is_active: !image.is_active }
    });
  };

  if (isLoading) {
    return <div>Ładowanie zdjęć...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zdjęcia galerii</h2>
        <div className="flex space-x-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Wszystkie kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Wszystkie kategorie</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images?.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={image.thumbnail_url || image.webp_url || image.original_url}
                alt={image.alt_text || image.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 flex space-x-1">
                {image.is_featured && (
                  <div className="bg-yellow-500 text-white p-1 rounded">
                    <Star className="w-3 h-3" />
                  </div>
                )}
                {!image.is_active && (
                  <div className="bg-red-500 text-white p-1 rounded">
                    <Eye className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleFeatured(image)}
                  className="p-1 h-6 w-6"
                >
                  <Star className={`w-3 h-3 ${image.is_featured ? 'fill-yellow-400' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleActive(image)}
                  className="p-1 h-6 w-6"
                >
                  <Eye className={`w-3 h-3 ${!image.is_active ? 'opacity-50' : ''}`} />
                </Button>
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm truncate">{image.title}</CardTitle>
              {image.category && (
                <p className="text-xs text-gray-500">{image.category.name}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {image.width}x{image.height}
                  {image.file_size && (
                    <span className="ml-2">
                      {(image.file_size / 1024).toFixed(1)}KB
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(image)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(image.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingImage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edytuj zdjęcie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Tytuł</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingImage.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category_id">Kategoria</Label>
                  <Select name="category_id" defaultValue={editingImage.category_id || ''}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingImage.description || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="alt_text">Tekst alternatywny</Label>
                <Input
                  id="alt_text"
                  name="alt_text"
                  defaultValue={editingImage.alt_text || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tagi (oddzielone przecinkami)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingImage.tags?.join(', ') || ''}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="display_order">Kolejność</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={editingImage.display_order}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    name="is_featured"
                    defaultChecked={editingImage.is_featured}
                  />
                  <Label htmlFor="is_featured">Wyróżnione</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingImage.is_active}
                  />
                  <Label htmlFor="is_active">Aktywne</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  Zaktualizuj
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GalleryImages;
