
import { supabase } from "@/integrations/supabase/client";
import type { GalleryCategory, GalleryImage, ImageUploadRequest } from "@/types/gallery";

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

  // Images
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
    return data || [];
  }

  static async uploadImage(request: ImageUploadRequest): Promise<GalleryImage> {
    const { data, error } = await supabase.functions.invoke('optimize-image', {
      body: request
    });

    if (error) throw error;
    return data.data;
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
    return data;
  }

  static async deleteImage(id: string): Promise<void> {
    // First get the image to delete files from storage
    const { data: image, error: fetchError } = await supabase
      .from('gallery_images')
      .select('original_url, webp_url, thumbnail_url, medium_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete files from storage
    const filesToDelete = [
      image.original_url,
      image.webp_url,
      image.thumbnail_url,
      image.medium_url
    ].filter(Boolean).map(url => {
      const urlParts = url.split('/');
      return urlParts.slice(-2).join('/'); // Get folder/filename
    });

    if (filesToDelete.length > 0) {
      await supabase.storage
        .from('gallery')
        .remove(filesToDelete);
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
