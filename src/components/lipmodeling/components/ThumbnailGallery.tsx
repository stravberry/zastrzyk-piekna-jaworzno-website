
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ImageWithLoading from "@/components/ui/image-with-loading";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  before: string;
  after: string;
  category: string;
  technique: string;
  webp_url?: string;
  thumbnail_url?: string;
  medium_url?: string;
}

interface ThumbnailGalleryProps {
  images: GalleryImage[];
  currentIndex: number;
  onImageSelect: (index: number) => void;
  onImageClick: (index: number) => void;
}

const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  images,
  currentIndex,
  onImageSelect,
  onImageClick
}) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {images.map((image, index) => (
        <button
          key={image.id}
          onClick={() => onImageClick(index)}
          onMouseEnter={() => onImageSelect(index)}
          className={`relative group rounded-lg overflow-hidden transition-all ${
            index === currentIndex 
              ? 'ring-2 ring-pink-500 shadow-lg' 
              : 'hover:shadow-md hover:scale-105'
          }`}
        >
          <AspectRatio ratio={9/16}>
            <ImageWithLoading
              src={image.after}
              webpSrc={image.webp_url}
              thumbnailSrc={image.thumbnail_url}
              alt={`Miniatura - ${image.description}`}
              className="w-full h-full object-cover"
              priority={index < 6} // Prioritize first 6 images
            />
          </AspectRatio>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        </button>
      ))}
    </div>
  );
};

export default ThumbnailGallery;
