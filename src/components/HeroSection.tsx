
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronDown, ShieldCheck, Star, Leaf } from "lucide-react";
import { useScrollTo } from "@/hooks/useScrollTo";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import AnimatedBackground from "@/components/hero/AnimatedBackground";
import VideoLite from "@/components/media/VideoLite";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const HeroSection = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const { scrollToRef } = useScrollTo();

  // Create refs for animation elements
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  // Track animations
  const isTitleVisible = useScrollAnimation(titleRef, { triggerOnce: true });
  const isDescriptionVisible = useScrollAnimation(descriptionRef, { triggerOnce: true });
  const isButtonsVisible = useScrollAnimation(buttonsRef, { triggerOnce: true });
  const isStatsVisible = useScrollAnimation(statsRef, { triggerOnce: true });
  const isVideoVisible = useScrollAnimation(videoRef, { triggerOnce: true });

  return (
    <header className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-pink-50 to-white overflow-hidden pt-24 md:pt-32 pb-14">
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" aria-hidden="true"></div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/20"></div>
        <div className="absolute -top-20 -right-20 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(244,114,182,0.15),transparent_60%)] blur-3xl"></div>
        <div className="absolute -bottom-32 -left-24 w-[36rem] h-[36rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.12),transparent_60%)] blur-3xl"></div>
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle,_rgba(248,60,134,0.3)_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden="true"></div>
      </div>
      
      {/* Animated 3D Background */}
      <AnimatedBackground className="z-[15]" />
      
      <div className="container-custom relative z-20 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 pt-20">
        {/* Left side content */}
        <div className="flex flex-col items-start text-left space-y-6 mb-10 lg:mb-0">
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/70 backdrop-blur px-3 py-1 text-xs md:text-sm tracking-[0.2em] uppercase text-pink-600 transition-all duration-1000 ${
              isTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <span className="size-1.5 rounded-full bg-pink-500" aria-hidden="true"></span>
            <span aria-label="Gabinet kosmegologii">Gabinet kosmegologii</span>
          </div>
          <h1 
            ref={titleRef} 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight transition-all duration-1000 ${
              isTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            Gabinet kosmetologii Jaworzno
          </h1>
          <div
            className={`h-1 w-28 rounded-full bg-gold-400/90 transition-all duration-1000 ${
              isTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            aria-hidden="true"
          ></div>
          
          <p 
            ref={descriptionRef} 
            className={`text-lg md:text-xl text-gray-600 max-w-2xl transition-all duration-1000 delay-200 ${
              isDescriptionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            Piękno to nie efekt jednego zabiegu. 
            To styl życia, który łączy pielegnacje, odżywianie i ruch – holistyczne podejście do życia to klucz do piękna, które trwa, a ja się do tego przyczynię
          </p>
          
          <div 
            ref={buttonsRef} 
            className={`flex flex-col sm:flex-row gap-4 pt-4 mb-4 sm:mb-0 transition-all duration-1000 delay-300 ${
              isButtonsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-base">
              <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer">
                Umów wizytę
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-6 text-base">
              <Link to="/uslugi">
                Poznaj zabiegi
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div 
            className={`flex flex-wrap items-center gap-3 md:gap-4 transition-all duration-1000 delay-350 ${
              isButtonsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            aria-label="Atuty gabinetu"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3 py-1 text-sm text-gray-700">
              <ShieldCheck className="w-4 h-4 text-pink-500" aria-hidden="true" />
              Bezpieczeństwo zabiegów
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3 py-1 text-sm text-gray-700">
              <Star className="w-4 h-4 text-pink-500" aria-hidden="true" />
              Certyfikowane preparaty
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3 py-1 text-sm text-gray-700">
              <Leaf className="w-4 h-4 text-pink-500" aria-hidden="true" />
              Naturalne efekty
            </div>
          </div>
          
          <div 
            ref={statsRef} 
            className={`grid grid-cols-2 gap-6 pt-8 w-full transition-all duration-1000 delay-400 ${
              isStatsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
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
        <div 
          ref={videoRef} 
          className={`hidden sm:flex items-center justify-center transition-all duration-1000 delay-500 ${
            isVideoVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
          }`}
        >
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-pink-100">
            <AspectRatio ratio={16 / 9}>
              <VideoLite videoId="bUmHTcIdrmk" title="Zastrzyk Piękna - Gabinet kosmetologii" className="w-full h-full" priority={true} />
            </AspectRatio>
          </div>
        </div>
      </div>
      
      {/* Scroll hint */}
      <button
        type="button"
        onClick={() => scrollToRef(servicesRef, { offset: 80 })}
        aria-label="Przewiń do sekcji usług"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 text-pink-500 hover:translate-y-1 transition-transform"
      >
        <ChevronDown className="w-6 h-6 animate-bounce" aria-hidden="true" />
      </button>

      {/* Invisible ref for scrolling to services */}
      <div ref={servicesRef} className="absolute bottom-0 left-0 w-full" />
    </header>
  );
};

export default HeroSection;
