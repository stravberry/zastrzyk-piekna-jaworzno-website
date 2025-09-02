import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Droplet, User, Heart, Syringe, Star, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Services = () => {
  const { toast } = useToast();
  
  const services = [
    {
      id: 1,
      title: "TERAPIE PRZECIWSTARZENIOWE",
      description: "Zaawansowane zabiegi oparte na pobudzaniu istniejących fibroblastów do intensywniejszej produkcji kolagenu oraz zabiegi zwiększające liczbę fibroblastów (rozmnażanie/napływ)",
      icon: <Droplet size={36} />,
      link: "/zabiegi/terapie-przeciwstarzeniowe",
      features: ["Biostymulacja kolagenu", "Redukcja zmarszczek", "Poprawa owalu twarzy", "Lifting bez skalpela"],
      benefits: "Skóra staje się jędrna, napięta, zredukowane są zmarszczki, a owal twarzy ulega zauważalnej poprawie.",
      image: "/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png"
    },
    {
      id: 2,
      title: "MODELOWANIE UST",
      description: "to nie tylko zabieg powiększenia ust, to precyzyjne, indywidualne dopasowanie kształtu oraz ich wielkości. Praca oparta nie na wyuczonych schematach, a oparta na wieloletnim doświadczeniu oraz jednostkowym podejściu do klienta",
      icon: <Heart size={36} />,
      link: "/zabiegi/modelowanie-ust",
      features: ["Naturalne powiększenie", "Korekja asymetrii", "Hydratacja ust", "Wyraźny kontur"],
      benefits: "Usta zyskują objętość, stają się nawilżone, a ich kontur staje się wyraźniejszy i bardziej proporcjonalny.",
      image: "/lovable-uploads/5c03dd3d-5c8a-47b3-8321-e95a85f20394.png"
    },
    {
      id: 3,
      title: "MAKIJAŻ PERMANENTNY BRWI",
      description: "intensywne, ale lekko wykończone brwi permanentne bez wyraźnych konturów z uniesioną końcówka dla efektu otwartego i wypoczętego spojrzenia - to moja wypracowana latami technika",
      icon: <User size={36} />,
      link: "/zabiegi/makijaz-permanentny-brwi",
      features: ["Technika ombre", "Naturalny efekt", "Trwałość do 2 lat", "Indywidualny dobór kształtu"],
      benefits: "Perfekcyjnie wyglądające brwi każdego dnia, bez konieczności codziennego makijażu.",
      image: "/lovable-uploads/280bfdfd-5739-433f-b71e-e6a00eae59d8.png"
    },
    {
      id: 4,
      title: "MEZOTERAPIA IGŁOWA",
      description: "niekwestionowana królowa technik dostarczania składników odżywczych w głąb skóry. Często mylona z konkretnym zabiegiem, tymczasem jest to metoda, a nie zabieg. Nie wszystkie preparaty można podać ta techniką, dobór koktajlu możliwy jest po ustaleniu oczekiwanych rezultatów",
      icon: <Syringe size={36} />,
      link: "/zabiegi/mezoterapia-iglowa",
      features: ["Silne nawilżenie", "Stymulacja kolagenu", "Rozjaśnienie przebarwień", "Poprawa elastyczności"],
      benefits: "Skóra jest wyraźnie nawilżona, odżywiona i rozświetlona, zmniejszają się drobne niedoskonałości.",
      image: "/lovable-uploads/a49b2ad5-04a2-47df-b4f5-9c377ef464a3.png"
    },
    {
      id: 5,
      title: "LIPOLIZA INIEKCYJNA",
      description: "zabieg pozwalający na redukcję lokalnie nagromadzonej tkanki tłuszczowej, zwłaszcza w okolicy twarzy",
      icon: <Syringe size={36} />,
      link: "/zabiegi/lipoliza-iniekcyjna",
      features: ["Redukcja podbródka", "Modelowanie policzków", "Likwidacja tzw. chomików", "Nieinwazyjna procedura"],
      benefits: "Skuteczna redukcja lokalnie nagromadzonej tkanki tłuszczowej, poprawa konturu twarzy.",
      image: null
    },
    {
      id: 6,
      title: "Peelingi chemiczne",
      description: "Głęboka regeneracja skóry przy pomocy kwasów, poprawiająca jej strukturę i niwelująca niedoskonałości.",
      icon: <Droplet size={36} />,
      link: "/zabiegi/peelingi-chemiczne",
      features: ["Redukcja blizn", "Zmniejszenie porów", "Wyrównanie kolorytu", "Wygładzenie tekstury"],
      benefits: "Skóra jest gładsza, jednolita kolorystycznie, a niedoskonałości takie jak blizny czy przebarwienia są zredukowane.",
      image: null
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-pink-50 pt-32 md:pt-40 pb-8 md:pb-12">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              <span>Zabiegi </span>
              <span className="text-pink-500">Kosmetologiczne</span>
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              W gabinecie kosmetologii estetycznej Zastrzyk Piękna w Jaworznie oferuję szeroki zakres
              profesjonalnych zabiegów kosmetologicznych, dostosowanych do indywidualnych potrzeb każdego klienta.
            </p>
          </div>
        </section>

        {/* Services List */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="space-y-16">
              {services.map((service, index) => (
                <div 
                  key={service.id} 
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                    index % 2 !== 0 ? 'lg:grid-flow-dense' : ''
                  }`}
                >
                  <div className={index % 2 !== 0 ? 'lg:col-start-2' : ''}>
                    <div className="inline-flex items-center space-x-2 mb-4">
                      <div className="text-pink-500">{service.icon}</div>
                      <h2 className="text-2xl md:text-3xl font-bold font-playfair">{service.title}</h2>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    
                    <h3 className="text-lg font-semibold mb-3">Cechy zabiegu:</h3>
                    <ul className="mb-6 space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Star className="text-gold-400 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="bg-pink-50 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold mb-2">Efekty zabiegu:</h3>
                      <p className="text-gray-700">{service.benefits}</p>
                    </div>
                    
                    <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
                      <Link to={service.link}>Dowiedz się więcej</Link>
                    </Button>
                  </div>
                  
                  <div className={`relative ${index % 2 !== 0 ? 'lg:col-start-1' : ''}`}>
                    {service.image ? (
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-full h-auto rounded-lg shadow-lg object-cover"
                        style={{height: "400px"}}
                        onLoad={() => console.log(`Image loaded successfully: ${service.image}`)}
                        onError={(e) => {
                          console.log(`Error loading image for ${service.title}: ${service.image}`);
                          console.error('Image error event:', e);
                          e.currentTarget.src = "/placeholder.svg";
                          toast({
                            title: "Informacja",
                            description: `Używam obrazu zastępczego dla: ${service.title}`,
                          });
                        }}
                      />
                    ) : (
                      <div className="w-full h-[400px] rounded-lg shadow-lg bg-pink-100 flex items-center justify-center">
                        <FileImage size={48} className="text-pink-300" />
                      </div>
                    )}
                    <Link to="/cennik" className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-md border border-pink-100 hover:bg-pink-50 transition-colors">
                      <span className="text-gold-500 font-medium font-playfair">
                        Sprawdź cennik
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-6 font-playfair">
              Zarezerwuj wizytę już teraz
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Skorzystaj z profesjonalnych zabiegów kosmetologicznych w gabinecie Zastrzyk Piękna w Jaworznie.
              Zadbaj o swoją urodę z kosmetologiem roku województwa śląskiego.
            </p>
            <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
              <Link to="/kontakt">Umów wizytę</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
