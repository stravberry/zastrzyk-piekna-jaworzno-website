
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { toast } = useToast();

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      setUploadProgress(30);
      
      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);
        
      if (uploadError) {
        toast({
          title: "Upload Error",
          description: uploadError.message,
          variant: "destructive",
        });
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
      
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 600);
    }
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
                  disabled={uploading}
                />
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileUpload(e, field.onChange)}
                    disabled={uploading}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={uploading}
                  >
                    <Upload className={`h-4 w-4 mr-2 ${uploading ? 'animate-pulse' : ''}`} />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
              
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Uploading image... {uploadProgress}%
                  </p>
                </div>
              )}
              
              {field.value ? (
                <div className="relative aspect-video mt-2 rounded-md overflow-hidden border">
                  {uploading ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <img 
                      src={field.value} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error";
                      }}
                    />
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
