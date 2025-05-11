
import React, { useState, useCallback } from "react";
import { Upload, Settings, X } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Control } from "react-hook-form";
import { FormValues } from "./formSchema";

interface ImageUploaderProps {
  control: Control<FormValues>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ control }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Create a memoized function to compress images
  const compressImage = useCallback(async (file: File): Promise<Blob> => {
    setIsCompressing(true);
    
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // Maintain aspect ratio but limit dimensions if needed
            const MAX_WIDTH = 1600;
            const MAX_HEIGHT = 1600;
            
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
            
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error("Could not get canvas context"));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                // Create a new File from the compressed Blob
                resolve(blob);
              } else {
                reject(new Error("Failed to compress image"));
              }
            }, file.type, compressionQuality / 100);
          };
          
          img.onerror = () => {
            reject(new Error("Failed to load image"));
          };
        };
        
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    } finally {
      setIsCompressing(false);
    }
  }, [compressionQuality]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setUploading(true);
      setUploadProgress(10);
      
      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      // Validate file size (5MB limit)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      // Compress image if it's a compatible type (JPEG or PNG)
      let fileToUpload: File | Blob = file;
      if (['image/jpeg', 'image/png'].includes(file.type)) {
        try {
          setUploadProgress(20);
          const compressedBlob = await compressImage(file);
          fileToUpload = compressedBlob;
        } catch (error) {
          console.error("Compression failed, using original file:", error);
          // Continue with original file if compression fails
        }
      }
      
      setUploadProgress(40);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      setUploadProgress(70);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);
        
      setUploadProgress(100);
      
      // Update form with the image URL
      onChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your image",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setShowSettings(false);
      }, 600);
      
      // Clear the input value so the same file can be uploaded again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const clearImage = (onChange: (value: string) => void) => {
    onChange('');
    toast({
      title: "Image Removed",
      description: "The image has been removed"
    });
  };

  const getUploadStateLabel = () => {
    if (isCompressing) return "Compressing...";
    if (uploading) return "Uploading...";
    return "Upload";
  };

  return (
    <FormField
      control={control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Featured Image (Optional)</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter image URL or upload" 
                  {...field} 
                  className="flex-1"
                  disabled={uploading || isCompressing}
                />
                <div className="flex gap-1">
                  <Popover open={showSettings} onOpenChange={setShowSettings}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={uploading || isCompressing}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Image Options</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Compression Quality</span>
                            <span className="text-sm font-semibold">{compressionQuality}%</span>
                          </div>
                          <Slider
                            value={[compressionQuality]}
                            min={10}
                            max={100}
                            step={5}
                            onValueChange={(value) => setCompressionQuality(value[0])}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Lower quality = smaller file size
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileUpload(e, field.onChange)}
                      disabled={uploading || isCompressing}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={uploading || isCompressing}
                    >
                      <Upload className={`h-4 w-4 mr-2 ${(uploading || isCompressing) ? 'animate-pulse' : ''}`} />
                      {getUploadStateLabel()}
                    </Button>
                  </div>
                </div>
              </div>
              
              {(uploading || isCompressing) && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {isCompressing ? "Compressing image..." : `Uploading image... ${uploadProgress}%`}
                  </p>
                </div>
              )}
              
              {field.value ? (
                <div className="relative aspect-video mt-2 rounded-md overflow-hidden border">
                  {uploading ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <>
                      <img 
                        src={field.value} 
                        alt="Preview" 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error";
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 hover:opacity-100 bg-background/80 text-foreground"
                        onClick={() => clearImage(field.onChange)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
