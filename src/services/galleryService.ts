
import { supabase } from "@/integrations/supabase/client";
import type { GalleryCategory, GalleryImage, ImageUploadRequest, VideoUploadRequest } from "@/types/gallery";

export class GalleryService {
  // Categories
  static async getCategories(): Promise<GalleryCategory[]> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('display_order');
    
    if (error) throw error;
    return data || [];
  }

  static async createCategory(category: Omit<GalleryCategory, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryCategory> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCategory(id: string, updates: Partial<GalleryCategory>): Promise<GalleryCategory> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('gallery_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Images and Videos
  static async getImages(categoryId?: string): Promise<GalleryImage[]> {
    let query = supabase
      .from('gallery_images')
      .select(`
        *,
        category:gallery_categories(*)
      `)
      .order('display_order');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Map data to ensure all required fields are present
    return (data || []).map(item => ({
      id: item.id,
      category_id: item.category_id,
      title: item.title,
      description: item.description,
      alt_text: item.alt_text,
      original_url: item.original_url,
      webp_url: item.webp_url,
      thumbnail_url: item.thumbnail_url,
      medium_url: item.medium_url,
      file_size: item.file_size,
      width: item.width,
      height: item.height,
      mime_type: item.mime_type,
      tags: item.tags || [],
      display_order: item.display_order || 0,
      is_featured: item.is_featured || false,
      is_active: item.is_active !== false,
      uploaded_by: item.uploaded_by,
      file_type: item.file_type || 'image',
      video_url: item.video_url,
      video_duration: item.video_duration,
      video_provider: item.video_provider,
      created_at: item.created_at,
      updated_at: item.updated_at,
      category: item.category
    })) as GalleryImage[];
  }

  static async uploadImage(request: ImageUploadRequest): Promise<GalleryImage> {
    try {
      console.log('GalleryService.uploadImage called with:', { ...request, file: '[FILE_DATA]' });
      
      const { data, error } = await supabase.functions.invoke('optimize-image', {
        body: { 
          ...request, 
          file_type: 'image'
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to upload image');
      }

      if (!data?.success || !data?.data) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Invalid response from server');
      }

      return {
        ...data.data,
        file_type: 'image',
        video_url: undefined,
        video_duration: undefined,
        video_provider: undefined
      } as GalleryImage;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  }

  static async uploadVideoFile(request: ImageUploadRequest): Promise<GalleryImage> {
    try {
      console.log('GalleryService.uploadVideoFile called with:', { ...request, file: '[FILE_DATA]' });
      
      const { data, error } = await supabase.functions.invoke('optimize-image', {
        body: { 
          ...request, 
          file_type: 'video'
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to upload video');
      }

      if (!data?.success || !data?.data) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Invalid response from server');
      }

      return {
        ...data.data,
        file_type: 'video',
        video_url: data.data.video_url || data.data.original_url,
        video_duration: data.data.video_duration || 0,
        video_provider: 'upload'
      } as GalleryImage;
    } catch (error) {
      console.error('Error in uploadVideoFile:', error);
      throw error;
    }
  }

  static async uploadVideoLink(request: VideoUploadRequest): Promise<GalleryImage> {
    // Extract video metadata
    let videoDuration = 0;
    let thumbnailUrl = '';

    if (request.video_provider === 'youtube') {
      const videoId = request.video_url?.split('v=')[1]?.split('&')[0];
      if (videoId) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    }

    const videoData = {
      title: request.title,
      description: request.description,
      category_id: request.category_id,
      original_url: request.video_url || '',
      thumbnail_url: thumbnailUrl,
      tags: request.tags || [],
      display_order: 0,
      is_featured: false,
      is_active: true,
      file_type: 'video',
      video_url: request.video_url,
      video_provider: request.video_provider,
      video_duration: videoDuration
    };

    const { data, error } = await supabase
      .from('gallery_images')
      .insert(videoData)
      .select(`
        *,
        category:gallery_categories(*)
      `)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      file_type: 'video',
      video_url: data.video_url || request.video_url,
      video_duration: data.video_duration || undefined,
      video_provider: data.video_provider || request.video_provider
    } as GalleryImage;
  }

  static async updateImage(id: string, updates: Partial<GalleryImage>): Promise<GalleryImage> {
    const { data, error } = await supabase
      .from('gallery_images')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        category:gallery_categories(*)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      file_type: data.file_type || 'image',
      video_url: data.video_url || undefined,
      video_duration: data.video_duration || undefined,
      video_provider: data.video_provider || undefined
    } as GalleryImage;
  }

  static async deleteImage(id: string): Promise<void> {
    // First get the image to delete files from storage
    const { data: image, error: fetchError } = await supabase
      .from('gallery_images')
      .select('original_url, webp_url, thumbnail_url, medium_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete files from storage only for uploaded files (not external links)
    if (image && !image.original_url?.includes('http')) {
      const filesToDelete = [
        image.original_url,
        image.webp_url,
        image.thumbnail_url,
        image.medium_url
      ].filter(Boolean).map(url => {
        const urlParts = url!.split('/');
        return urlParts.slice(-2).join('/'); // Get folder/filename
      });

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('gallery')
          .remove(filesToDelete);
      }
    }

    // Delete database record
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async updateImageOrder(imageId: string, newOrder: number): Promise<void> {
    const { error } = await supabase
      .from('gallery_images')
      .update({ display_order: newOrder })
      .eq('id', imageId);
    
    if (error) throw error;
  }
}
