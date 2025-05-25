
import React, { useRef, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const galleryImages = [
  {
    id: "lips-1",
    before: "/lovable-uploads/2e819def-450f-472d-bf96-82773e78b080.jpg",
    after: "/lovable-uploads/3ffa044e-7598-4eaf-a751-a518d7f12c8b.jpg",
    description: "Naturalne powiększenie z zachowaniem proporcji",
    technique: "Kwas hialuronowy 1ml"
  },
  {
    id: "lips-2",
    before: "/lovable-uploads/4213b2f8-4c25-45f4-a2e0-b49b708c6d8c.png",
    after: "/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png",
    description: "Korekja asymetrii i zwiększenie objętości",
    technique: "Kwas hialuronowy 1,5ml"
  },
  {
    id: "lips-3",
    before: "/lovable-uploads/9ab7a07f-c052-4dff-a5bc-07a270a5d943.png",
    after: "/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png",
    description: "Subtelne powiększenie z podkreśleniem konturu",
    technique: "Kwas hialuronowy 0,8ml"
  },
  {
    id: "lips-4",
    before: "/lovable-uploads/16696627-596a-4696-a3a9-72c9146e2c1f.png",
    after: "/lovable-uploads/a49b2ad5-04a2-47df-b4f5-9c377ef464a3.png",
    description: "Modelowanie z uwzględnieniem proporcji twarzy",
    technique: "Kwas hialuronowy 1,2ml"
  },
  {
    id: "lips-5",
    before: "/lovable-uploads/image-jX9SrE3N7FjZCiGV8eA3M.png",
    after: "/lovable-uploads/image-tLuEGz3WVNgJdDfexSFWl.png",
    description: "Naturalne powiększenie i definiowanie konturu",
    technique: "Kwas hialuronowy 1ml"
  },
  {
    id: "lips-6",
    before: "/lovable-uploads/image-EyY8U7m8IYpfXXz6RhUgF.png",
    after: "/lovable-uploads/image-Vgb2HZjXhPgB8hJeLpKqU.png",
    description: "Korekta proporcji i zwiększenie objętości",
    technique: "Kwas hialuronowy 1,3ml"
  },
  {
    id: "lips-7",
    before: "/lovable-uploads/image-qA1J2Y6Q5pAqvdI8RbNsQ.png",
    after: "/lovable-uploads/image-T5iQhSQShAmBFZjnUlvjJ.png",
    description: "Profesjonalne modelowanie z zachowaniem naturalności",
    technique: "Kwas hialuronowy 1,1ml"
  },
  {
    id: "lips-8",
    before: "/lovable-uploads/image-9uUgPr0qH1vVQOPsyJvNV.png",
    after: "/lovable-uploads/image-I8xSxf8bMUJLVOtQGO4KV.png",
    description: "Efekt natychmiastowy - widoczne powiększenie",
    technique: "Kwas hialuronowy 0,9ml"
  },
  {
    id: "lips-9",
    before: "/lovable-uploads/image-cGXVAQLZdJeFIh41waPZK.png",
    after: "/lovable-uploads/image-cGXVAQLZdJeFIh41waPZK.png",
    description: "Proces aplikacji fillera podczas zabiegu",
    technique: "Precyzyjna technika wstrzykiwania"
  }
];

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
        <div 
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            <span className="text-pink-500">Galeria </span>
            <span>efektów</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Zobacz efekty moich zabiegów modelowania ust. Każdy przypadek jest unikalny 
            i dostosowany do indywidualnych potrzeb klienta.
          </p>
        </div>

        {/* Main Gallery Display */}
        <div 
          className={`mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <Card className="max-w-4xl mx-auto shadow-xl border-0">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="relative group">
                  <img
                    src={galleryImages[currentImage].before}
                    alt={`Przed zabiegiem - ${galleryImages[currentImage].description}`}
                    className="w-full h-80 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Przed
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-8 h-8 text-white" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <img
                        src={galleryImages[currentImage].before}
                        alt={`Przed zabiegiem - ${galleryImages[currentImage].description}`}
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="relative group">
                  <img
                    src={galleryImages[currentImage].after}
                    alt={`Po zabiegu - ${galleryImages[currentImage].description}`}
                    className="w-full h-80 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Po
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-8 h-8 text-white" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <img
                        src={galleryImages[currentImage].after}
                        alt={`Po zabiegu - ${galleryImages[currentImage].description}`}
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold font-playfair">
                  {galleryImages[currentImage].description}
                </h3>
                <p className="text-pink-600 font-medium">
                  {galleryImages[currentImage].technique}
                </p>
              </div>
              
              <div className="flex justify-center items-center mt-6 space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevImage}
                  className="border-pink-200 hover:bg-pink-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex space-x-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImage ? 'bg-pink-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextImage}
                  className="border-pink-200 hover:bg-pink-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thumbnail Gallery */}
        <div 
          className={`grid grid-cols-3 md:grid-cols-5 gap-4 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentImage(index)}
              className={`relative group rounded-lg overflow-hidden transition-all ${
                index === currentImage 
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
        
        <div 
          className={`text-center mt-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Każdy zabieg jest przeprowadzany z najwyższą starannością i dostosowany do indywidualnych potrzeb klienta. 
            Efekty są widoczne natychmiast i trwają od 8 do 18 miesięcy.
          </p>
          <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
            <a href="/kontakt">Umów wizytę</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(LipModelingGallerySection);
