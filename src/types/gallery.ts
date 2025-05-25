
export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_type: 'lip_modeling' | 'anti_aging' | 'general' | 'before_after';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  category_id?: string;
  title: string;
  description?: string;
  alt_text?: string;
  original_url: string;
  webp_url?: string;
  thumbnail_url?: string;
  medium_url?: string;
  file_size?: number;
  width?: number;
  height?: number;
  mime_type?: string;
  tags: string[];
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  category?: GalleryCategory;
}

export interface ImageUploadRequest {
  file: string;
  filename: string;
  category_id: string;
  title: string;
  description?: string;
  alt_text?: string;
  tags?: string[];
}
