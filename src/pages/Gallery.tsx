
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Gallery = () => {
  // Categories of before/after images
  const categories = [
    {
      id: "lips",
      name: "Modelowanie ust",
      images: [
        {
          id: "lips-1",
          before: "/images/lips-before-1.jpg",
          after: "/images/lips-after-1.jpg",
          description: "Naturalne powiększenie i konturowanie ust"
        },
        {
          id: "lips-2",
          before: "/images/lips-before-2.jpg",
          after: "/images/lips-after-2.jpg",
          description: "Korekta asymetrii i zwiększenie objętości"
        },
      ]
    },
    {
      id: "brows",
      name: "Makijaż permanentny brwi",
      images: [
        {
          id: "brows-1",
          before: "/images/brows-before-1.jpg",
          after: "/images/brows-after-1.jpg",
          description: "Technika ombre, naturalne wykończenie"
        },
        {
          id: "brows-2",
          before: "/images/brows-before-2.jpg",
          after: "/images/brows-after-2.jpg",
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
          before: "/images/meso-before-1.jpg",
          after: "/images/meso-after-1.jpg",
          description: "Poprawa kondycji skóry, rozświetlenie"
        },
        {
          id: "meso-2",
          before: "/images/meso-before-2.jpg",
          after: "/images/meso-after-2.jpg",
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
          before: "/images/anti-before-1.jpg",
          after: "/images/anti-after-1.jpg",
          description: "Lifting i poprawa owalu twarzy"
        },
        {
          id: "anti-2",
          before: "/images/anti-before-2.jpg",
          after: "/images/anti-after-2.jpg",
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {category.images.map((image) => (
                      <div key={image.id} className="flex flex-col">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 relative">
                            <img
                              src={image.before}
                              alt={`Przed zabiegiem - ${image.description}`}
                              className="w-full h-64 object-cover rounded-lg shadow-md"
                            />
                            <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Przed
                            </div>
                          </div>
                          <div className="flex-1 relative">
                            <img
                              src={image.after}
                              alt={`Po zabiegu - ${image.description}`}
                              className="w-full h-64 object-cover rounded-lg shadow-md"
                            />
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
