
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrevious, onNext, onClose]);

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0 bg-black/95 border-0">
        {/* Navigation buttons */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image section */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-2xl">
              <AspectRatio ratio={9/16}>
                <img
                  src={currentImage.after}
                  alt={currentImage.description}
                  className="w-full h-full object-cover rounded-lg"
                />
              </AspectRatio>
            </div>
          </div>

          {/* Description section - desktop */}
          <div className="hidden lg:flex lg:w-80 lg:flex-col lg:justify-center bg-white p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-playfair mb-2">
                  {currentImage.title || currentImage.description}
                </h2>
                <p className="text-pink-600 font-medium">
                  {currentImage.technique}
                </p>
              </div>

              {currentImage.description && currentImage.title && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Opis zabiegu</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {currentImage.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Kategoria</h3>
                <p className="text-gray-600">{currentImage.category}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{currentIndex + 1} / {images.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description section - mobile */}
        <div className="lg:hidden bg-white p-6 border-t">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold font-playfair mb-1">
                {currentImage.title || currentImage.description}
              </h2>
              <p className="text-pink-600 font-medium">
                {currentImage.technique}
              </p>
            </div>

            {currentImage.description && currentImage.title && (
              <div>
                <p className="text-gray-600 text-sm">
                  {currentImage.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{currentImage.category}</span>
              <span>{currentIndex + 1} / {images.length}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullscreenGallery;
