
import React, { useRef, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { galleryImages } from "./data/galleryImages";
import GalleryHeader from "./components/GalleryHeader";
import GalleryMainDisplay from "./components/GalleryMainDisplay";
import ThumbnailGallery from "./components/ThumbnailGallery";
import GalleryCTA from "./components/GalleryCTA";

const LipModelingGallerySection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

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
            currentImage={galleryImages[currentImage]}
            currentIndex={currentImage}
            totalImages={galleryImages.length}
            onPrevious={prevImage}
            onNext={nextImage}
            onSetImage={setCurrentImage}
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
            images={galleryImages}
            currentIndex={currentImage}
            onImageSelect={setCurrentImage}
          />
        </div>
        
        <GalleryCTA isVisible={isVisible} />
      </div>
    </section>
  );
};

export default React.memo(LipModelingGallerySection);
