
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
  onImageClick: (index: number) => void;
}

const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  images,
  onImageClick
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <button
          key={image.id}
          onClick={() => onImageClick(index)}
          className="relative group rounded-lg overflow-hidden transition-all hover:shadow-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
        >
          <AspectRatio ratio={4/5}>
            <ImageWithLoading
              src={image.after}
              webpSrc={image.webp_url}
              thumbnailSrc={image.thumbnail_url}
              alt={`Efekt zabiegu - ${image.description}`}
              className="w-full h-full object-cover"
              priority={index < 8} // Prioritize first 8 images
            />
          </AspectRatio>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="truncate">{image.technique}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ThumbnailGallery;
