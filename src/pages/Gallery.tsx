
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Gallery = () => {
  // Categories of before/after images
  const categories = [
    {
      id: "lips",
      name: "Modelowanie ust",
      images: [
        {
          id: "lips-1",
          before: "/lovable-uploads/2e819def-450f-472d-bf96-82773e78b080.jpg",
          after: "/lovable-uploads/3ffa044e-7598-4eaf-a751-a518d7f12c8b.jpg",
          description: "Naturalne powiększenie i konturowanie ust"
        },
        {
          id: "lips-2",
          before: "/lovable-uploads/4213b2f8-4c25-45f4-a2e0-b49b708c6d8c.png",
          after: "/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png",
          description: "Korekta asymetrii i zwiększenie objętości"
        },
        {
          id: "lips-3",
          before: "/lovable-uploads/image-jX9SrE3N7FjZCiGV8eA3M.png",
          after: "/lovable-uploads/image-tLuEGz3WVNgJdDfexSFWl.png",
          description: "Naturalne powiększenie i definiowanie konturu"
        },
        {
          id: "lips-4",
          before: "/lovable-uploads/image-EyY8U7m8IYpfXXz6RhUgF.png",
          after: "/lovable-uploads/image-Vgb2HZjXhPgB8hJeLpKqU.png",
          description: "Korekta proporcji i zwiększenie objętości"
        },
        {
          id: "lips-5",
          before: "/lovable-uploads/image-qA1J2Y6Q5pAqvdI8RbNsQ.png",
          after: "/lovable-uploads/image-T5iQhSQShAmBFZjnUlvjJ.png",
          description: "Profesjonalne modelowanie z zachowaniem naturalności"
        },
        {
          id: "lips-6",
          before: "/lovable-uploads/image-9uUgPr0qH1vVQOPsyJvNV.png",
          after: "/lovable-uploads/image-I8xSxf8bMUJLVOtQGO4KV.png",
          description: "Efekt natychmiastowy - widoczne powiększenie"
        },
        {
          id: "lips-7",
          before: "/lovable-uploads/image-cGXVAQLZdJeFIh41waPZK.png",
          after: "/lovable-uploads/image-cGXVAQLZdJeFIh41waPZK.png",
          description: "Proces aplikacji fillera podczas zabiegu"
        },
      ]
    },
    {
      id: "brows",
      name: "Makijaż permanentny brwi",
      images: [
        {
          id: "brows-1",
          before: "/lovable-uploads/9ab7a07f-c052-4dff-a5bc-07a270a5d943.png",
          after: "/lovable-uploads/a49b2ad5-04a2-47df-b4f5-9c377ef464a3.png",
          description: "Technika ombre, naturalne wykończenie"
        },
        {
          id: "brows-2",
          before: "/lovable-uploads/ce209bbf-87ec-4255-8de6-dd3c78be95e0.png",
          after: "/lovable-uploads/f6040378-2ea3-416b-96ff-8bc14bebf7ba.png",
          description: "Korekta kształtu i zagęszczenie brwi"
        },
      ]
    },
    {
      id: "mesotherapy",
      name: "Mezoterapia igłowa",
      images: [
        {
          id: "meso-1",
          before: "/lovable-uploads/16696627-596a-4696-a3a9-72c9146e2c1f.png",
          after: "/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png",
          description: "Poprawa kondycji skóry, rozświetlenie"
        },
        {
          id: "meso-2",
          before: "/lovable-uploads/4e36b405-2b0b-48e1-a707-234600f8a1c0.png",
          after: "/lovable-uploads/3b19512b-b68a-4530-ac22-e8c824bf3cf3.png",
          description: "Redukcja cieni pod oczami"
        },
      ]
    },
    {
      id: "anti-aging",
      name: "Terapie przeciwstarzeniowe",
      images: [
        {
          id: "anti-1",
          before: "/lovable-uploads/2e819def-450f-472d-bf96-82773e78b080.jpg",
          after: "/lovable-uploads/3ffa044e-7598-4eaf-a751-a518d7f12c8b.jpg",
          description: "Lifting i poprawa owalu twarzy"
        },
        {
          id: "anti-2",
          before: "/lovable-uploads/4213b2f8-4c25-45f4-a2e0-b49b708c6d8c.png",
          after: "/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png",
          description: "Redukcja zmarszczek i odmłodzenie skóry"
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-pink-50 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              <span className="text-pink-500">Galeria </span>
              <span>Efektów</span>
            </h1>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Zobacz efekty przed i po zabiegach wykonanych w gabinecie kosmetologii estetycznej 
              Zastrzyk Piękna w Jaworznie.
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <Tabs defaultValue="lips" className="w-full">
              <TabsList className="flex flex-wrap justify-center mb-8 space-x-2">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {category.images.map((image) => (
                      <div key={image.id} className="flex flex-col">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 relative">
                            <AspectRatio ratio={9/16}>
                              <img
                                src={image.before}
                                alt={`Przed zabiegiem - ${image.description}`}
                                className="w-full h-full object-cover rounded-lg shadow-md"
                              />
                            </AspectRatio>
                            <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Przed
                            </div>
                          </div>
                          <div className="flex-1 relative">
                            <AspectRatio ratio={9/16}>
                              <img
                                src={image.after}
                                alt={`Po zabiegu - ${image.description}`}
                                className="w-full h-full object-cover rounded-lg shadow-md"
                              />
                            </AspectRatio>
                            <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Po
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-gray-700 font-medium">{image.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="text-center mt-16">
              <h3 className="text-2xl font-semibold mb-4 font-playfair">
                Chcesz uzyskać podobne efekty?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Zapraszam na konsultację, podczas której dobierzemy najlepszy zabieg dla Twoich potrzeb.
              </p>
              <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
                <Link to="/kontakt">Umów wizytę</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Instagram Section */}
        <section className="py-16 bg-pink-50/50">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-6 font-playfair">
              <span>Więcej efektów na </span>
              <span className="text-pink-500">Instagramie</span>
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Obserwuj mój profil na Instagramie @zastrzyk_piekna, aby zobaczyć więcej zdjęć efektów zabiegów
              oraz dowiedzieć się o aktualnych promocjach i nowościach w gabinecie.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-pink-500 text-pink-500 hover:bg-pink-50"
            >
              <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer">
                Obserwuj na Instagramie
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
