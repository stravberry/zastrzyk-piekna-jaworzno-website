
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, VisuallyHidden } from "@/components/ui/dialog";
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
  console.log('FullscreenGallery render - currentIndex:', currentIndex, 'currentImage:', currentImage?.title);

  // Handle navigation with direct calls to parent functions
  const handlePrevious = useCallback(() => {
    console.log('Previous clicked, current index:', currentIndex, 'total images:', images.length);
    if (currentIndex > 0) {
      console.log('Calling onPrevious');
      onPrevious();
    } else {
      console.log('Already at first image');
    }
  }, [currentIndex, onPrevious, images.length]);

  const handleNext = useCallback(() => {
    console.log('Next clicked, current index:', currentIndex, 'total images:', images.length);
    if (currentIndex < images.length - 1) {
      console.log('Calling onNext');
      onNext();
    } else {
      console.log('Already at last image');
    }
  }, [currentIndex, onNext, images.length]);

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
      console.log('Key pressed:', e.key, 'current index:', currentIndex);
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setIsInfoVisible(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, handlePrevious, handleNext, onClose, currentIndex]);

  if (!currentImage) {
    console.log('No current image found for index:', currentIndex);
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-0">
        <VisuallyHidden>
          <DialogTitle>Galeria - {currentImage.description}</DialogTitle>
          <DialogDescription>
            Zdjęcie {currentIndex + 1} z {images.length} - {currentImage.technique}
          </DialogDescription>
        </VisuallyHidden>
        
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
            aria-label="Zamknij galerię"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className="absolute left-4 z-20 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Poprzednie zdjęcie"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex >= images.length - 1}
            className="absolute right-4 z-20 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Następne zdjęcie"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Main image container with proper sizing */}
          <div className="relative w-full h-full flex items-center justify-center p-16">
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <ImageWithLoading
                key={`${currentImage.id}-${currentIndex}`}
                src={currentImage.after}
                webpSrc={currentImage.webp_url}
                thumbnailSrc={currentImage.medium_url}
                alt={currentImage.description}
                className="max-w-full max-h-full w-auto h-auto object-contain"
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
