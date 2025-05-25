
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid, 
  List, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Star,
  Eye,
  Play,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import type { GalleryImage } from "@/types/gallery";
import MediaUploadDialog from "./MediaUploadDialog";
import MediaEditDialog from "./MediaEditDialog";

const MediaExplorer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedBulkCategory, setSelectedBulkCategory] = useState<string>('');
  const [editingItem, setEditingItem] = useState<GalleryImage | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: GalleryService.getCategories
  });

  const { data: media, isLoading } = useQuery({
    queryKey: ['gallery-images', selectedCategory],
    queryFn: () => GalleryService.getImages(selectedCategory === 'all' ? undefined : selectedCategory)
  });

  const deleteMutation = useMutation({
    mutationFn: GalleryService.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success('Plik został usunięty');
      setSelectedItems([]);
    },
    onError: () => {
      toast.error('Błąd podczas usuwania pliku');
    }
  });

  const bulkCategoryMutation = useMutation({
    mutationFn: ({ imageIds, categoryId }: { imageIds: string[]; categoryId: string }) =>
      GalleryService.bulkUpdateCategory(imageIds, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success(`Kategoria została przypisana do ${selectedItems.length} plików`);
      setSelectedItems([]);
      setSelectedBulkCategory('');
    },
    onError: () => {
      toast.error('Błąd podczas przypisywania kategorii');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GalleryImage> }) =>
      GalleryService.updateImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    }
  });

  const filteredMedia = media?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFileType = fileTypeFilter === 'all' || item.file_type === fileTypeFilter;
    return matchesSearch && matchesFileType;
  }) || [];

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`Czy na pewno chcesz usunąć ${selectedItems.length} plików?`)) {
      selectedItems.forEach(id => {
        deleteMutation.mutate(id);
      });
    }
  };

  const handleBulkCategoryAssign = () => {
    if (selectedItems.length === 0 || !selectedBulkCategory) return;
    
    const categoryName = categories?.find(cat => cat.id === selectedBulkCategory)?.name || 'wybranej kategorii';
    
    if (confirm(`Czy na pewno chcesz przypisać ${selectedItems.length} plików do kategorii "${categoryName}"?`)) {
      bulkCategoryMutation.mutate({
        imageIds: selectedItems,
        categoryId: selectedBulkCategory
      });
    }
  };

  const handleEdit = (item: GalleryImage) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const getMediaPreview = (item: GalleryImage) => {
    if (item.file_type === 'video') {
      if (item.video_provider === 'youtube') {
        const videoId = item.video_url?.split('v=')[1]?.split('&')[0];
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      } else if (item.video_provider === 'vimeo') {
        return item.thumbnail_url || '/placeholder.svg';
      }
      return item.thumbnail_url || '/placeholder.svg';
    }
    return item.thumbnail_url || item.webp_url || item.original_url;
  };

  const GridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4">
      {filteredMedia.map((item) => (
        <Card 
          key={item.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleSelectItem(item.id)}
        >
          <CardContent className="p-1 sm:p-2">
            <div className="relative aspect-square">
              <img
                src={getMediaPreview(item)}
                alt={item.title}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 flex gap-0.5 sm:gap-1">
                {item.file_type === 'video' && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs p-0.5 sm:p-1">
                    <Video className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    <span className="hidden sm:inline">Video</span>
                  </Badge>
                )}
                {item.is_featured && (
                  <Badge variant="default" className="text-[10px] sm:text-xs p-0.5 sm:p-1">
                    <Star className="w-2 h-2 sm:w-3 sm:h-3" />
                  </Badge>
                )}
              </div>
              <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex gap-0.5 sm:gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-4 w-4 sm:h-6 sm:w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                >
                  <Edit className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-4 w-4 sm:h-6 sm:w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
              </div>
              {item.file_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-8 sm:h-8 text-white bg-black bg-opacity-50 rounded-full p-1 sm:p-2" />
                </div>
              )}
            </div>
            <div className="mt-1 sm:mt-2">
              <p className="text-[10px] sm:text-xs font-medium truncate">{item.title}</p>
              <p className="text-[9px] sm:text-xs text-gray-500">
                {item.file_type === 'image' ? 
                  `${item.width}x${item.height}` : 
                  `${Math.floor((item.video_duration || 0) / 60)}:${String((item.video_duration || 0) % 60).padStart(2, '0')}`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {filteredMedia.map((item) => (
        <Card 
          key={item.id}
          className={`cursor-pointer transition-all hover:shadow-sm ${
            selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleSelectItem(item.id)}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                <img
                  src={getMediaPreview(item)}
                  alt={item.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <h3 className="font-medium truncate text-sm sm:text-base">{item.title}</h3>
                  {item.file_type === 'video' && <Video className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />}
                  {item.is_featured && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />}
                  {!item.is_active && <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{item.description}</p>
                <div className="flex items-center space-x-2 sm:space-x-4 mt-1">
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    {item.file_type === 'image' ? 
                      `${item.width}x${item.height}` : 
                      `${Math.floor((item.video_duration || 0) / 60)}:${String((item.video_duration || 0) % 60).padStart(2, '0')}`
                    }
                  </span>
                  {item.category && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {item.category.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-1 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Ładowanie mediów...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Eksplorator mediów</h2>
        <Button onClick={() => setIsUploadOpen(true)} size="sm" className="w-full sm:w-auto">
          <Upload className="w-4 h-4 mr-2" />
          Dodaj media
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-center">
        <div className="flex items-center space-x-2 flex-1 sm:flex-none">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Wszystkie kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie kategorie</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fileTypeFilter} onValueChange={(value: 'all' | 'image' | 'video') => setFileTypeFilter(value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystko</SelectItem>
            <SelectItem value="image">Zdjęcia</SelectItem>
            <SelectItem value="video">Filmy</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2 justify-center sm:ml-auto">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <span className="text-sm font-medium">
              Wybrano {selectedItems.length} plików
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Select value={selectedBulkCategory} onValueChange={setSelectedBulkCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Wybierz kategorię..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCategoryAssign}
                  disabled={!selectedBulkCategory || bulkCategoryMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Przypisz kategorię</span>
                  <span className="sm:hidden">Przypisz</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItems([]);
                    setSelectedBulkCategory('');
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Anuluj
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Usuń wybrane</span>
                  <span className="sm:hidden">Usuń</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak mediów</h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base px-4">
              {searchTerm || selectedCategory !== 'all' || fileTypeFilter !== 'all' 
                ? 'Nie znaleziono mediów pasujących do filtrów'
                : 'Dodaj pierwsze media do galerii'
              }
            </p>
            <Button onClick={() => setIsUploadOpen(true)} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Dodaj media
            </Button>
          </div>
        ) : (
          viewMode === 'grid' ? <GridView /> : <ListView />
        )}
      </div>

      {/* Upload Dialog */}
      <MediaUploadDialog 
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
        }}
      />

      {/* Edit Dialog */}
      {editingItem && (
        <MediaEditDialog
          open={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingItem(null);
          }}
          item={editingItem}
          onSuccess={() => {
            setIsEditOpen(false);
            setEditingItem(null);
            queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
          }}
        />
      )}
    </div>
  );
};

export default MediaExplorer;
