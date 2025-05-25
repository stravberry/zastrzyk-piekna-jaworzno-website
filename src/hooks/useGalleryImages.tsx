
import { useQuery } from "@tanstack/react-query";
import { GalleryService } from "@/services/galleryService";
import type { GalleryImage } from "@/types/gallery";

interface UseGalleryImagesOptions {
  categoryType?: 'lip_modeling' | 'anti_aging' | 'general' | 'before_after';
  categoryId?: string;
  featured?: boolean;
  active?: boolean;
}

export const useGalleryImages = (options: UseGalleryImagesOptions = {}) => {
  const { categoryType, categoryId, featured, active = true } = options;

  return useQuery({
    queryKey: ['gallery-images', categoryType, categoryId, featured, active],
    queryFn: async (): Promise<GalleryImage[]> => {
      const images = await GalleryService.getImages(categoryId);
      
      return images.filter(image => {
        // Filter by active status
        if (active !== undefined && image.is_active !== active) {
          return false;
        }
        
        // Filter by featured status
        if (featured !== undefined && image.is_featured !== featured) {
          return false;
        }
        
        // Filter by category type
        if (categoryType && image.category?.category_type !== categoryType) {
          return false;
        }
        
        return true;
      }).sort((a, b) => {
        // Sort by display_order, then by created_at
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
  });
};

// Hook specifically for lip modeling images
export const useLipModelingImages = () => {
  return useGalleryImages({ categoryType: 'lip_modeling', active: true });
};

// Hook specifically for anti-aging images
export const useAntiAgingImages = () => {
  return useGalleryImages({ categoryType: 'anti_aging', active: true });
};

// Hook for featured images across all categories
export const useFeaturedImages = () => {
  return useGalleryImages({ featured: true, active: true });
};
