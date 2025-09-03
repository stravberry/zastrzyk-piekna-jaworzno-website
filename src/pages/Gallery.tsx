
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Gallery = () => {

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
          <div className="container-custom text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair text-gray-800">
                Galeria w budowie
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Obecnie przygotowujemy dla Państwa nową galerię efektów zabiegów.
              </p>
              <div className="bg-pink-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-pink-700">
                  Wszystkie najnowsze efekty i zdjęcia znajdziecie na moim Instagramie
                </h3>
                <p className="text-gray-600 mb-6">
                  Obserwuj @zastrzyk_piekna aby zobaczyć najświeższe efekty zabiegów, 
                  proces wykonywania oraz poznać historie transformacji moich klientek.
                </p>
                <Button 
                  asChild 
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg"
                >
                  <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer">
                    Zobacz na Instagramie
                  </a>
                </Button>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Zapraszam również na konsultację, podczas której omówimy możliwe efekty dla Twoich potrzeb.
                </p>
                <Button asChild variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                  <Link to="/kontakt">Umów konsultację</Link>
                </Button>
              </div>
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
