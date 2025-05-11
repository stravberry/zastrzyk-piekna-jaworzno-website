
import React, { useState } from "react";
import { Control } from "react-hook-form";
import { Upload } from "lucide-react";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "./formSchema";

interface EditorMainTabProps {
  control: Control<FormValues>;
}

export const EditorMainTab: React.FC<EditorMainTabProps> = ({ control }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;
      
      // Check if storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === 'blog-images')) {
        await supabase.storage.createBucket('blog-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      }
      
      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);
        
      // Update form with the image URL
      onChange(publicUrl);
      
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the post" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your post content here..." 
                      className="min-h-[200px] sm:min-h-[300px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter image URL or upload" 
                          {...field} 
                          className="flex-1"
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
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                      {field.value && (
                        <div className="relative aspect-video mt-2 rounded-md overflow-hidden border">
                          <img 
                            src={field.value} 
                            alt="Preview" 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anti-aging" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="readTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Read Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5 min" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
