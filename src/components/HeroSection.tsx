import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScrollTo } from "@/hooks/useScrollTo";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
const HeroSection = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const {
    scrollToRef
  } = useScrollTo();

  // Create refs for animation elements
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  // Track animations
  const isTitleVisible = useScrollAnimation(titleRef, {
    triggerOnce: true
  });
  const isDescriptionVisible = useScrollAnimation(descriptionRef, {
    triggerOnce: true
  });
  const isButtonsVisible = useScrollAnimation(buttonsRef, {
    triggerOnce: true
  });
  const isStatsVisible = useScrollAnimation(statsRef, {
    triggerOnce: true
  });
  const isVideoVisible = useScrollAnimation(videoRef, {
    triggerOnce: true
  });
  const handleScrollToServices = () => {
    scrollToRef(servicesRef, {
      offset: 80
    });
  };
  return <div className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-pink-50 to-white">
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm"></div>
      
      <div className="container-custom relative z-20 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 pt-20">
        {/* Left side content */}
        <div className="flex flex-col items-start text-left space-y-8 mb-10 lg:mb-0">
          <h1 ref={titleRef} className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight transition-all duration-1000 ${isTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            Gabinet kosmetologii Jaworzno
          </h1>
          
          <p ref={descriptionRef} className={`text-lg md:text-xl text-gray-600 max-w-2xl transition-all duration-1000 delay-200 ${isDescriptionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>Piękno to nie efekt jednego zabiegu. 
To styl życia, który łączy pielegnacje, odżywianie i ruch – holistyczne podejście do życia to klucz do piękna, które trwa, a ja się do tego przyczynię</p>
          
          <div ref={buttonsRef} className={`flex flex-col sm:flex-row gap-4 pt-4 mb-4 sm:mb-0 transition-all duration-1000 delay-300 ${isButtonsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-base">
              <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer">
                Umów wizytę
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-6 text-base" onClick={handleScrollToServices}>
              Poznaj zabiegi
            </Button>
          </div>
          
          <div ref={statsRef} className={`grid grid-cols-2 gap-6 pt-8 w-full transition-all duration-1000 delay-400 ${isStatsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-pink-100">
              <div className="text-gold-500 text-xl font-bold font-playfair">11+</div>
              <div className="text-gray-600 text-sm">Lat doświadczenia</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-pink-100">
              <div className="text-gold-500 text-xl font-bold font-playfair">2200+</div>
              <div className="text-gray-600 text-sm">Zadowolonych klientów</div>
            </div>
          </div>
        </div>
        
        {/* Right side video */}
        <div ref={videoRef} className={`flex items-center justify-center transition-all duration-1000 delay-500 ${isVideoVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
          <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-lg shadow-md overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <iframe className="w-full h-[300px] md:h-[350px]" src="https://www.youtube.com/embed/bUmHTcIdrmk?si=3uuNuaWxzCmSr0KJ" title="Zastrzyk Piękna - Gabinet kosmetologiczny" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
              </iframe>
            </div>
          </div>
        </div>
      </div>
      
      {/* Invisible ref for scrolling to services */}
      <div ref={servicesRef} className="absolute bottom-0 left-0 w-full"></div>
    </div>;
};
export default HeroSection;