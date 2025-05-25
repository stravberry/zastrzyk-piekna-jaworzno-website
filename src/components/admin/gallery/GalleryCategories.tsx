import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { GalleryCategory } from "@/types/gallery";

// Helper function to ensure valid category type - moved outside component to avoid recreations
const getSafeCategoryType = (categoryType?: string): 'lip_modeling' | 'anti_aging' | 'general' | 'before_after' => {
  const validTypes = ['lip_modeling', 'anti_aging', 'general', 'before_after'] as const;
  return validTypes.includes(categoryType as any) ? (categoryType as any) : 'general';
};

// Form data type that supports all category types
type FormData = {
  name: string;
  slug: string;
  description: string;
  category_type: 'lip_modeling' | 'anti_aging' | 'general' | 'before_after';
  display_order: number;
  is_active: boolean;
};

// Initial form state that guarantees valid category_type
const getInitialFormState = (): FormData => ({
  name: '',
  slug: '',
  description: '',
  category_type: 'general',
  display_order: 0,
  is_active: true
});

const GalleryCategories: React.FC = () => {
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(getInitialFormState());

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: GalleryService.getCategories
  });

  const createMutation = useMutation({
    mutationFn: GalleryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
      toast.success('Kategoria została utworzona');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Błąd podczas tworzenia kategorii');
      console.error(error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GalleryCategory> }) =>
      GalleryService.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
      toast.success('Kategoria została zaktualizowana');
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Błąd podczas aktualizacji kategorii');
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: GalleryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
      toast.success('Kategoria została usunięta');
    },
    onError: (error) => {
      toast.error('Błąd podczas usuwania kategorii');
      console.error(error);
    }
  });

  const resetForm = () => {
    setFormData(getInitialFormState());
  };

  const handleEdit = (category: GalleryCategory) => {
    setEditingCategory(category);
    const safeCategoryType = getSafeCategoryType(category.category_type);
    
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      category_type: safeCategoryType,
      display_order: category.display_order,
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we always have a valid category type
    const validCategoryType = getSafeCategoryType(formData.category_type);
    const submitData = { ...formData, category_type: validCategoryType };
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, updates: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę kategorię?')) {
      deleteMutation.mutate(id);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const getCategoryTypeLabel = (type: string) => {
    const safeType = getSafeCategoryType(type);
    switch (safeType) {
      case 'lip_modeling': return 'Modelowanie ust';
      case 'anti_aging': return 'Terapie przeciwstarzeniowe';
      case 'general': return 'Ogólne';
      case 'before_after': return 'Przed i po';
      default: return 'Ogólne';
    }
  };

  if (isLoading) {
    return <div>Ładowanie kategorii...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kategorie galerii</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCategory(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj kategorię
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edytuj kategorię' : 'Dodaj nową kategorię'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nazwa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      name,
                      slug: generateSlug(name)
                    }));
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category_type">Typ kategorii</Label>
                <Select
                  value={formData.category_type}
                  onValueChange={(value: 'lip_modeling' | 'anti_aging' | 'general' | 'before_after') => 
                    setFormData(prev => ({ ...prev, category_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ kategorii" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Ogólne</SelectItem>
                    <SelectItem value="lip_modeling">Modelowanie ust</SelectItem>
                    <SelectItem value="anti_aging">Terapie przeciwstarzeniowe</SelectItem>
                    <SelectItem value="before_after">Przed i po</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="display_order">Kolejność wyświetlania</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCategory ? 'Zaktualizuj' : 'Utwórz'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>Slug: /{category.slug}</p>
                <p>Typ: {getCategoryTypeLabel(category.category_type)}</p>
                <p>Kolejność: {category.display_order}</p>
                <p>Status: {category.is_active ? 'Aktywna' : 'Nieaktywna'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GalleryCategories;
