
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
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

interface GalleryMainDisplayProps {
  currentImage: GalleryImage;
  currentIndex: number;
  totalImages: number;
  onPrevious: () => void;
  onNext: () => void;
  onSetImage: (index: number) => void;
  onImageClick: () => void;
}

const GalleryMainDisplay: React.FC<GalleryMainDisplayProps> = ({
  currentImage,
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  onSetImage,
  onImageClick
}) => {
  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-0">
      <CardContent className="p-6">
        <div className="relative group mb-6">
          <AspectRatio ratio={9/16} className="w-full max-w-md mx-auto">
            <ImageWithLoading
              src={currentImage.after}
              webpSrc={currentImage.webp_url}
              thumbnailSrc={currentImage.medium_url}
              alt={currentImage.description}
              className="w-full h-full object-cover rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
              priority={true} // Main image should load immediately
            />
          </AspectRatio>
          <button 
            onClick={onImageClick}
            className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <Eye className="w-8 h-8 text-white" />
          </button>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold font-playfair">
            {currentImage.description}
          </h3>
          <p className="text-pink-600 font-medium">
            {currentImage.technique}
          </p>
        </div>
        
        <div className="flex justify-center items-center mt-6 space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            className="border-pink-200 hover:bg-pink-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalImages }).map((_, index) => (
              <button
                key={index}
                onClick={() => onSetImage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            className="border-pink-200 hover:bg-pink-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryMainDisplay;
