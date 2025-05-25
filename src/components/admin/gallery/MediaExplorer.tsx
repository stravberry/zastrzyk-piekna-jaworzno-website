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
  Play
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {filteredMedia.map((item) => (
        <Card 
          key={item.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleSelectItem(item.id)}
        >
          <CardContent className="p-2">
            <div className="relative aspect-square">
              <img
                src={getMediaPreview(item)}
                alt={item.title}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute top-1 left-1 flex gap-1">
                {item.file_type === 'video' && (
                  <Badge variant="secondary" className="text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                )}
                {item.is_featured && (
                  <Badge variant="default" className="text-xs">
                    <Star className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              {item.file_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-2" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="text-xs font-medium truncate">{item.title}</p>
              <p className="text-xs text-gray-500">
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
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={getMediaPreview(item)}
                  alt={item.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  {item.file_type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                  {item.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                  {!item.is_active && <Eye className="w-4 h-4 text-gray-400" />}
                </div>
                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-400">
                    {item.file_type === 'image' ? 
                      `${item.width}x${item.height}` : 
                      `${Math.floor((item.video_duration || 0) / 60)}:${String((item.video_duration || 0) % 60).padStart(2, '0')}`
                    }
                  </span>
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Eksplorator mediów</h2>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Dodaj media
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
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
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystko</SelectItem>
            <SelectItem value="image">Zdjęcia</SelectItem>
            <SelectItem value="video">Filmy</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2 ml-auto">
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Wybrano {selectedItems.length} plików
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems([])}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Usuń wybrane
              </Button>
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
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' || fileTypeFilter !== 'all' 
                ? 'Nie znaleziono mediów pasujących do filtrów'
                : 'Dodaj pierwsze media do galerii'
              }
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
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
