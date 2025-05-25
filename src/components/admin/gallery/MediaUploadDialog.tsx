
import React, { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image, Video, Link, X } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MediaUploadDialog: React.FC<MediaUploadDialogProps> = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('image');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    alt_text: '',
    tags: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: GalleryService.getCategories
  });

  // Filter out any categories that might have empty or invalid IDs
  const validCategories = categories?.filter(category => 
    category.id && 
    category.id.trim() !== '' && 
    category.name && 
    category.name.trim() !== ''
  ) || [];

  console.log('Valid categories for MediaUploadDialog:', validCategories);

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      if (activeTab === 'image' || activeTab === 'video-file') {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64 = (reader.result as string).split(',')[1];
              await GalleryService.uploadImage({
                file: base64,
                filename: data.file.name,
                category_id: formData.category_id,
                title: formData.title || data.file.name.replace(/\.[^/.]+$/, ''),
                description: formData.description,
                alt_text: formData.alt_text,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(data.file);
        });
      } else {
        // Video link upload
        return GalleryService.uploadVideoLink({
          video_url: videoUrl,
          video_provider: getVideoProvider(videoUrl),
          category_id: formData.category_id,
          title: formData.title || getVideoTitle(videoUrl),
          description: formData.description,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        });
      }
    },
    onSuccess: () => {
      toast.success('Media zostały przesłane');
      resetForm();
      onSuccess();
    },
    onError: (error) => {
      toast.error('Błąd podczas przesyłania mediów');
      console.error(error);
    }
  });

  const getVideoProvider = (url: string): 'youtube' | 'vimeo' | 'upload' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'upload';
  };

  const getVideoTitle = (url: string): string => {
    const provider = getVideoProvider(url);
    if (provider === 'youtube') {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `YouTube Video - ${videoId}`;
    }
    if (provider === 'vimeo') {
      const videoId = url.split('/').pop();
      return `Vimeo Video - ${videoId}`;
    }
    return 'Video';
  };

  const isValidVideoUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setVideoUrl('');
    setFormData({
      category_id: '',
      title: '',
      description: '',
      alt_text: '',
      tags: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.category_id) {
      toast.error('Wybierz kategorię');
      return;
    }

    if (activeTab === 'video-link') {
      if (!videoUrl || !isValidVideoUrl(videoUrl)) {
        toast.error('Podaj prawidłowy link do YouTube lub Vimeo');
        return;
      }
      await uploadMutation.mutateAsync({ videoUrl });
    } else {
      if (selectedFiles.length === 0) {
        toast.error('Wybierz przynajmniej jeden plik');
        return;
      }

      for (const file of selectedFiles) {
        await uploadMutation.mutateAsync({ file });
      }
    }
  };

  const DropZone = ({ accept, children }: { accept: string; children: React.ReactNode }) => (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
    >
      {children}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nowe media</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image">
              <Image className="w-4 h-4 mr-2" />
              Zdjęcia
            </TabsTrigger>
            <TabsTrigger value="video-file">
              <Video className="w-4 h-4 mr-2" />
              Film (plik)
            </TabsTrigger>
            <TabsTrigger value="video-link">
              <Link className="w-4 h-4 mr-2" />
              Film (link)
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            {/* Common fields */}
            <div>
              <Label htmlFor="category">Kategoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => {
                  console.log('MediaUploadDialog category selected:', value);
                  setFormData(prev => ({ ...prev, category_id: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {validCategories.map((category) => {
                    console.log('Rendering category SelectItem:', category.id, category.name);
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Tytuł</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Automatycznie wygenerowany z nazwy pliku"
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
              <Label htmlFor="tags">Tagi (oddzielone przecinkami)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="np. modelowanie, usta, efekt"
              />
            </div>

            <TabsContent value="image">
              {activeTab === 'image' && (
                <>
                  {formData.title && (
                    <div>
                      <Label htmlFor="alt_text">Tekst alternatywny</Label>
                      <Input
                        id="alt_text"
                        value={formData.alt_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      />
                    </div>
                  )}

                  <DropZone accept="image/*">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg mb-2">Przeciągnij i upuść zdjęcia tutaj</p>
                    <p className="text-sm text-gray-500">lub kliknij, aby wybrać pliki</p>
                    <p className="text-xs text-gray-400 mt-2">Obsługiwane formaty: JPG, PNG, WebP</p>
                  </DropZone>
                </>
              )}
            </TabsContent>

            <TabsContent value="video-file">
              {activeTab === 'video-file' && (
                <DropZone accept="video/*">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Przeciągnij i upuść filmy tutaj</p>
                  <p className="text-sm text-gray-500">lub kliknij, aby wybrać pliki</p>
                  <p className="text-xs text-gray-400 mt-2">Obsługiwane formaty: MP4, WebM, MOV</p>
                  <p className="text-xs text-yellow-600 mt-1">Filmy będą automatycznie skompresowane</p>
                </DropZone>
              )}
            </TabsContent>

            <TabsContent value="video-link">
              {activeTab === 'video-link' && (
                <div>
                  <Label htmlFor="video_url">Link do filmu *</Label>
                  <Input
                    id="video_url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... lub https://vimeo.com/..."
                  />
                  {videoUrl && !isValidVideoUrl(videoUrl) && (
                    <p className="text-sm text-red-500 mt-1">
                      Nieprawidłowy link. Obsługiwane są tylko linki YouTube i Vimeo.
                    </p>
                  )}
                  {videoUrl && isValidVideoUrl(videoUrl) && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Wykryto: {getVideoProvider(videoUrl).toUpperCase()}
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            {/* File previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    {activeTab === 'image' ? (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <video
                        src={preview}
                        className="w-full h-32 object-cover rounded"
                        controls={false}
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 p-1 h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Przesyłanie...' : 'Dodaj media'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploadDialog;
