
import { supabase } from '@/integrations/supabase/client';
import type { GalleryCategory, GalleryImage, ImageUploadRequest, VideoUploadRequest } from '@/types/gallery';

export class GalleryService {
  // Categories
  static async getCategories(): Promise<GalleryCategory[]> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .eq('is_active', true)
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

  // Images
  static async getImages(categoryId?: string): Promise<GalleryImage[]> {
    let query = supabase
      .from('gallery_images')
      .select(`
        *,
        category:gallery_categories(*)
      `)
      .order('display_order')
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      file_type: item.file_type as 'image' | 'video'
    })) as GalleryImage[];
  }

  static async uploadImage(request: ImageUploadRequest): Promise<GalleryImage> {
    // Use the optimize-image edge function for better image processing
    const { data, error } = await supabase.functions.invoke('optimize-image', {
      body: {
        file: request.file,
        filename: request.filename,
        title: request.title,
        description: request.description,
        alt_text: request.alt_text,
        category_id: request.category_id,
        tags: request.tags || [],
        file_type: 'image'
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Upload failed');
    
    return {
      ...data.data,
      file_type: data.data.file_type as 'image' | 'video'
    } as GalleryImage;
  }

  static async uploadVideoFile(request: VideoUploadRequest & { file: string; filename: string }): Promise<GalleryImage> {
    // Use the optimize-image edge function for video uploads too
    const { data, error } = await supabase.functions.invoke('optimize-image', {
      body: {
        file: request.file,
        filename: request.filename,
        title: request.title,
        description: request.description,
        category_id: request.category_id,
        tags: request.tags || [],
        file_type: 'video'
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Upload failed');
    
    return {
      ...data.data,
      file_type: data.data.file_type as 'image' | 'video'
    } as GalleryImage;
  }

  static async uploadVideoLink(request: VideoUploadRequest): Promise<GalleryImage> {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        original_url: request.video_url || '',
        video_url: request.video_url,
        video_provider: request.video_provider,
        title: request.title,
        description: request.description,
        category_id: request.category_id || null,
        tags: request.tags || [],
        file_type: 'video' as const
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      file_type: data.file_type as 'image' | 'video'
    } as GalleryImage;
  }

  static async updateImage(id: string, updates: Partial<GalleryImage>): Promise<GalleryImage> {
    const { data, error } = await supabase
      .from('gallery_images')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      file_type: data.file_type as 'image' | 'video'
    } as GalleryImage;
  }

  static async deleteImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async bulkUpdateCategory(imageIds: string[], categoryId: string | null): Promise<void> {
    const { error } = await supabase
      .from('gallery_images')
      .update({ 
        category_id: categoryId,
        updated_at: new Date().toISOString() 
      })
      .in('id', imageIds);

    if (error) throw error;
  }
}
