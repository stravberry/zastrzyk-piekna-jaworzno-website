
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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

interface FullscreenGalleryProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const FullscreenGallery: React.FC<FullscreenGalleryProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext
}) => {
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  
  const currentImage = images[currentIndex];

  // Preload adjacent images for better UX
  useEffect(() => {
    if (!isOpen || !images.length) return;

    const preloadImage = (index: number) => {
      if (index >= 0 && index < images.length) {
        const img = new Image();
        img.src = images[index].webp_url || images[index].after;
      }
    };

    // Preload previous and next images
    preloadImage(currentIndex - 1);
    preloadImage(currentIndex + 1);
  }, [currentIndex, isOpen, images]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'Escape':
          onClose();
          break;
        case 'i':
        case 'I':
          setIsInfoVisible(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onPrevious, onNext, onClose]);

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="lg"
            onClick={onPrevious}
            className="absolute left-4 z-20 text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={onNext}
            className="absolute right-4 z-20 text-white hover:bg-white/20"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Main image */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <ImageWithLoading
                src={currentImage.after}
                webpSrc={currentImage.webp_url}
                thumbnailSrc={currentImage.medium_url}
                alt={currentImage.description}
                className="max-w-full max-h-full object-contain"
                priority={true}
              />
            </div>
          </div>

          {/* Image info panel */}
          <div
            className={`absolute bottom-0 left-0 right-0 md:right-auto md:top-0 md:w-80 
              bg-black/80 backdrop-blur-sm text-white p-6 transition-transform duration-300 
              ${isInfoVisible 
                ? 'translate-y-0 md:translate-x-0' 
                : 'translate-y-full md:translate-y-0 md:-translate-x-full'
              }`}
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-playfair mb-2">
                  {currentImage.description}
                </h2>
                <p className="text-pink-400 font-medium">
                  {currentImage.technique}
                </p>
                <p className="text-gray-300 text-sm">
                  {currentImage.category}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{currentIndex + 1} z {images.length}</span>
                <button
                  onClick={() => setIsInfoVisible(!isInfoVisible)}
                  className="text-pink-400 hover:text-pink-300"
                >
                  {isInfoVisible ? 'Ukryj info' : 'Pokaż info'}
                </button>
              </div>
            </div>
          </div>

          {/* Touch/swipe indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs md:hidden">
            Przesuń palcem lub użyj strzałek
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullscreenGallery;
