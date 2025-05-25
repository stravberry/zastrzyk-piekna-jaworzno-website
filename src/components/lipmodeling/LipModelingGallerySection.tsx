
import React, { useRef, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLipModelingImages } from "@/hooks/useGalleryImages";
import GalleryHeader from "./components/GalleryHeader";
import GalleryMainDisplay from "./components/GalleryMainDisplay";
import ThumbnailGallery from "./components/ThumbnailGallery";
import GalleryCTA from "./components/GalleryCTA";
import FullscreenGallery from "./components/FullscreenGallery";

const LipModelingGallerySection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const { data: galleryImages, isLoading } = useLipModelingImages();

  // Convert gallery images to the format expected by existing components
  const images = galleryImages?.map(img => ({
    id: img.id,
    src: img.webp_url || img.original_url,
    alt: img.alt_text || img.title,
    title: img.title,
    description: img.description || '',
    before: img.webp_url || img.original_url,
    after: img.medium_url || img.webp_url || img.original_url,
    category: img.category?.name || 'Modelowanie ust',
    technique: img.tags?.join(', ') || 'Kwas hialuronowy',
    webp_url: img.webp_url,
    thumbnail_url: img.thumbnail_url,
    medium_url: img.medium_url
  })) || [];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const openFullscreen = (index?: number) => {
    if (index !== undefined) {
      setCurrentImage(index);
    }
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
  };

  if (isLoading) {
    return (
      <section ref={sectionRef} className="py-16 bg-gradient-to-b from-pink-50/50 to-white">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              <div className="mt-8 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[9/16] bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!images || images.length === 0) {
    return (
      <section ref={sectionRef} className="py-16 bg-gradient-to-b from-pink-50/50 to-white">
        <div className="container-custom">
          <GalleryHeader isVisible={isVisible} />
          <div className="text-center">
            <p className="text-lg text-gray-600">Brak zdjęć w galerii. Zdjęcia będą dostępne wkrótce.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="lip-gallery" className="py-16 bg-gradient-to-b from-pink-50/50 to-white">
      <div className="container-custom">
        <GalleryHeader isVisible={isVisible} />

        {/* Main Gallery Display */}
        <div 
          className={`mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <GalleryMainDisplay
            currentImage={images[currentImage]}
            currentIndex={currentImage}
            totalImages={images.length}
            onPrevious={prevImage}
            onNext={nextImage}
            onSetImage={setCurrentImage}
            onImageClick={() => openFullscreen()}
          />
        </div>

        {/* Thumbnail Gallery */}
        <div 
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <ThumbnailGallery
            images={images}
            currentIndex={currentImage}
            onImageSelect={setCurrentImage}
            onImageClick={openFullscreen}
          />
        </div>
        
        <GalleryCTA isVisible={isVisible} />

        {/* Fullscreen Gallery */}
        <FullscreenGallery
          images={images}
          currentIndex={currentImage}
          isOpen={isFullscreenOpen}
          onClose={closeFullscreen}
          onPrevious={prevImage}
          onNext={nextImage}
        />
      </div>
    </section>
  );
};

export default React.memo(LipModelingGallerySection);
