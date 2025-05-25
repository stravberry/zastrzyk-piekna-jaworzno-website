
import React from "react";

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
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
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
          <img
            src={image.after}
            alt={`Miniatura - ${image.description}`}
            className="w-full h-24 object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        </button>
      ))}
    </div>
  );
};

export default ThumbnailGallery;
