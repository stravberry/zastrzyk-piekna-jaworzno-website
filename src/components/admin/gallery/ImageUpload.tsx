
import React, { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onUploadComplete?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    alt_text: '',
    tags: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: GalleryService.getCategories
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            await GalleryService.uploadImage({
              file: base64,
              filename: file.name,
              category_id: formData.category_id,
              title: formData.title || file.name.replace(/\.[^/.]+$/, ''),
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
        reader.readAsDataURL(file);
      });
    },
    onSuccess: () => {
      toast.success('Zdjęcie zostało przesłane i zoptymalizowane');
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      onUploadComplete?.();
    },
    onError: (error) => {
      toast.error('Błąd podczas przesyłania zdjęcia');
      console.error(error);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Generate previews
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke URL for removed preview
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (!formData.category_id) {
      toast.error('Wybierz kategorię');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Wybierz przynajmniej jedno zdjęcie');
      return;
    }

    try {
      for (const file of selectedFiles) {
        await uploadMutation.mutateAsync(file);
      }
      
      // Clear form
      setSelectedFiles([]);
      setPreviews([]);
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
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prześlij nowe zdjęcia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="category">Kategoria</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz kategorię" />
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

        <div>
          <Label htmlFor="title">Tytuł (opcjonalny)</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Jeśli pusty, zostanie użyta nazwa pliku"
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
          <Label htmlFor="alt_text">Tekst alternatywny</Label>
          <Input
            id="alt_text"
            value={formData.alt_text}
            onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
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

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">Przeciągnij i upuść zdjęcia tutaj</p>
          <p className="text-sm text-gray-500">lub kliknij, aby wybrać pliki</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
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

        <Button
          onClick={handleUpload}
          disabled={uploadMutation.isPending || selectedFiles.length === 0 || !formData.category_id}
          className="w-full"
        >
          {uploadMutation.isPending ? 'Przesyłanie...' : 'Prześlij zdjęcia'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
