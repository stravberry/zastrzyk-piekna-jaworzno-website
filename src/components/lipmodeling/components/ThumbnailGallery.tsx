
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
}

interface ThumbnailGalleryProps {
  images: GalleryImage[];
  currentIndex: number;
  onImageSelect: (index: number) => void;
}

const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  images,
  currentIndex,
  onImageSelect
}) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {images.map((image, index) => (
        <button
          key={image.id}
          onClick={() => onImageSelect(index)}
          className={`relative group rounded-lg overflow-hidden transition-all ${
            index === currentIndex 
              ? 'ring-2 ring-pink-500 shadow-lg' 
              : 'hover:shadow-md hover:scale-105'
          }`}
        >
          <AspectRatio ratio={9/16}>
            <img
              src={image.after}
              alt={`Miniatura - ${image.description}`}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        </button>
      ))}
    </div>
  );
};

export default ThumbnailGallery;
